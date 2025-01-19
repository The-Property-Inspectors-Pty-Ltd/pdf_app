const server = require("express");
const app = server();
const port = process.env.PORT ? process.env.PORT : 5000;
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("node:fs");
//const msal = require("@azure/msal-node");
const data = require("./getBnPReport");
const { title } = require("process");
//const Building_n_Pest = require("./Building_n_Pest");


app.use('/css', server.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', server.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', server.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use("/htmlfile", server.static(path.join(__dirname, "page.html")));
app.use("/images", server.static(path.join("ReportImages")));
//other routes..
//app.use("/bnp", Building_n_Pest);



//optimised code..
app.get("/building-and-pest-pdf/:id", async (req, res) => {
  await data.emptyFolder(path.resolve(__dirname, "ReportImages/"));
  try {
    // Fetch token and inspection details concurrently
    const acc_token = await data.getToken();
    const inspectionDetailsUrl = `https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectiondetails(${req.params.id})?$expand=blu_inspectiondetail_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg'),blu_blu_inspectiondetail_blu_inspectioncatego($select=blu_name,blu_categoryhasbeenanswered;$filter=blu_categoryhasbeenanswered eq 1;$orderby=blu_id asc),owninguser,blu_inspectiondetail_inspectionportalqa`;
    const inspectionDetails = await data.mydataasync(inspectionDetailsUrl, acc_token);
    //const buyerUrl = `https://tpi.api.crm6.dynamics.com/api/data/v9.2/contacts?$select=fullname&$filter=contactid eq ${inspectionDetails._blu_buyer_value}`;
    //const buyer = await data.mydataasync(buyerUrl, acc_token);
    //console.log(buyer);
    //console.log(inspectionDetails._blu_buyer_value);
    //console.log(path.resolve(__dirname,"ReportImages/"))


    const cartegories = await Promise.all(inspectionDetails.blu_blu_inspectiondetail_blu_inspectioncatego.map(async (category) => {
      const nestedQuestionsUrl = `https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionquestions?$select=blu_name,blu_questionhasbeenanswered,blu_id&$filter=_blu_categoryid_value eq ${category.blu_inspectioncategoryid} and blu_questionhasbeenanswered eq true&$orderby=blu_questionorder asc&$expand=blu_inspectionquestion_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg')`;
      const questionsVal = await data.mydataasync(nestedQuestionsUrl, acc_token);
      //console.log(questionsVal);
      const questions = await Promise.all(questionsVal.value.map(async (question) => {
        const inspectionAnswersUrl = `https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionanswers?$select=blu_name,blu_selected,blu_id,blu_supplementarytext,_blu_questionid_value&$filter=blu_selected eq true and _blu_questionid_value eq ${question.blu_inspectionquestionid}&$orderby=blu_id asc&$expand=blu_blu_inspectionanswer_blu_inspectionexplan($select=blu_name,blu_explanationhasbeengiven;$filter=blu_explanationhasbeengiven eq true;$expand=blu_blu_inspectionexplanation_blu_inspectiono($select=blu_name;$filter=blu_selected eq true)),blu_inspectionanswer_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg')`;
        const answers = await data.mydataasync(inspectionAnswersUrl, acc_token);
        //console.log(answers);
        await data.Convert_to_Webp(question.blu_inspectionquestion_Annotations);
        /*await Promise.all(answers.value.map(async (answ)=>{
          await data.Convert_to_Webp(answ.blu_inspectionanswer_Annotations);
          await answ.blu_inspectionanswer_Annotations.map(img=>img.annotationid);
        }))*/
        return {
          question: question.blu_name,
          question_images: await question.blu_inspectionquestion_Annotations.map(image => image.annotationid),
          answers: answers
        };
      }));


      return {
        cartegoryName: category.blu_name,
        id: category.blu_inspectioncategoryid,
        questions: JSON.parse(JSON.stringify(questions))
      };
    }));

    await data.Convert_to_Webp(inspectionDetails.blu_inspectiondetail_Annotations);

    const inspection = {
      inspectionDetails: inspectionDetails,
      inspectionImages: inspectionDetails.blu_inspectiondetail_Annotations.map(image => image.annotationid),
      questionStructure: JSON.parse(JSON.stringify(cartegories)),
      buyer: inspectionDetails.blu_inspectiondetail_inspectionportalqa.find(val => val.blu_name == "Vendors Name").blu_answer
    };


    delete inspection.inspectionDetails.blu_inspectiondetail_Annotations;
    //console.log(inspection);

    // Prepare HTML template and resources
    const myHTML = fs.readFileSync(path.join(__dirname, "ReportTemplates/pre_purchase_building_pest.html"), "utf8");
    const logo = fs.readFileSync(path.join(__dirname, "Resources/tpilogo.jpg"), { encoding: "base64" });
    const greenTick = fs.readFileSync(path.join(__dirname, "Resources/green-tick.png"), { encoding: "base64" });
    //const imgUrl = "http://localhost:${port}/images/2beb2461-229b-ef11-8a69-6045bde6f702.webp";
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      headless: true,  // Set to true for headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-dev-shm-usage',
        '--force-device-scale-factor=1'
      ],
      defaultViewport: null,  // Allow Puppeteer to use full screen,
      timeout: 120000
    });
    const page = await browser.newPage();
    await page.setContent(myHTML, { timeout: 600000, waitUntil: 'networkidle0' });
    await page.addStyleTag({ path: "index.css" });
    await page.addStyleTag({ path: "node_modules/bootstrap/dist/css/bootstrap.min.css" });
    console.log("starting evaluate..")

    // Start populating content in Puppeteer page
    await page.evaluate((inspection, greenTick,port) => {
      console.log(inspection);
      let major = 0, minor = 0, safety = 0;

      // Set inspector information
      document.getElementById("insp-name").innerHTML = inspection.inspectionDetails.owninguser.fullname;
      document.getElementById("insp-mobile").innerHTML = inspection.inspectionDetails.owninguser.mobilephone;
      document.getElementById("cover-property-inspector").innerHTML = inspection.inspectionDetails.owninguser.fullname;
      document.getElementById("cover-property-inspector-mobile").innerHTML = inspection.inspectionDetails.owninguser.mobilephone;
      document.getElementById("cover-property-address").innerHTML = inspection.inspectionDetails.blu_address.split("=")[1];
      document.getElementById("cover-comm-party").innerHTML = inspection.buyer;
      document.getElementById("cover-property-date-of-inspection").innerHTML = new Date(inspection.inspectionDetails.blu_starttime).toLocaleDateString('en-AU');
      // Insert general photos
      inspection.inspectionImages.forEach(photo => {
        document.getElementById("gen_photos").innerHTML += `<img style="height:30vh;width:30vw" src="http://localhost:${port}/images/${photo}.webp" alt="." />`;
      });

      document.getElementById("coverpage-image").src = `http://localhost:${port}/images/${inspection.inspectionImages[0]}.webp`;

      // Table of Contents and Category Questions
      let sectionCounter = 5;
      inspection.questionStructure.forEach(category => {
        const catPage = document.createElement("div");
        catPage.style = "page-break-before:always";
        if (category.cartegoryName == "Interior of Building - Summary" || category.cartegoryName == "Exterior of Building - Summary" || category.cartegoryName == "Interior of Building - BYB" || category.cartegoryName == "Exterior of Building - BYB") {
          catPage.innerHTML = `<p style="background-color: #0B5394; color: #EBF2F2; padding: 5px;" class="chapter-title">${category.cartegoryName.split('-')[0] + " - Summary"}</p>`;
          category.questions.map(question => {
            const que_section = document.createElement("div");
            //que_section.innerHTML += `<h5 style="color:red;">${question.question}</h5>`
            que_section.innerHTML += '<div>';

            if (question.question_images.length > 0) {
              que_section.innerHTML += `<div style="padding-left:100px; width: 80%;">`;
              question.question_images.forEach(photos => {
                que_section.innerHTML += `<img style="height:35vh;width:50vw; margin-left:200px;" src='http://localhost:${port}/images/${photos}.webp' alt='.' />`
              })
              que_section.innerHTML += `</div>`;
            }

            question.answers.value.forEach(answer => {
              que_section.innerHTML += `<p style='font-weight:bold; text-align:center;'>${answer.blu_name}</p>`;
            });
            que_section.innerHTML += '</div>';

            catPage.appendChild(que_section);
          })
        } else {
          catPage.innerHTML = `<p style="background-color: #0B5394; color: #EBF2F2; padding: 5px;" class="chapter-title">${category.cartegoryName}</p>`;

          category.questions.forEach(question => {
            const questionSection = document.createElement("div");
            questionSection.innerHTML = `<h5 class='question-style'>${question.question}</h5>`;

            question.answers.value.forEach(answer => {
              questionSection.innerHTML += `${answer.blu_name.includes("SUB_Q:") ? "<p class='heading-three'>" + answer.blu_name + "</p>" : `<p><strong>${answer.blu_name} </strong>${answer.blu_supplementarytext == null ? '' : `<br/><span style="font-style: italic;margin-left:15px">${answer.blu_supplementarytext}</span>`}</p>`}`;
              if (answer.blu_name.includes("Defect Rating: MAJOR DEFECT") || answer.blu_name.includes("Defect Rating: MAJOR DEFECTS") || answer.blu_name.includes("Defect Rating; MAJOR DEFECT")) major++;
              if (answer.blu_name.includes("Defect Rating: MINOR DEFECT") || answer.blu_name.includes("Defect Rating: MINOR DEFECTS") || answer.blu_name.includes("Defect Rating; MINOR DEFECT")) minor++;
              if (answer.blu_name.includes("Defect Rating: SAFETY HAZARD") || answer.blu_name.includes("Defect Rating: SAFETY HAZARDS") || answer.blu_name.includes("Defect Rating; SAFETY HAZARDS")) safety++;


              /*populating questions to the summary page of the report*/
              //question 32 changes to question 54..
              if (question.question == "32. Incidence of MAJOR Defects compared to similar buildings" || question.question == "Question 47. Incidence of MAJOR Defects compared to similar buildings") {
                document.getElementById("summary-major-defects").innerHTML += `<span>${answer.blu_name}</span>-<span style='font-style: italic;margin-left:15px'>${answer.blu_supplementarytext == null ? "" : answer.blu_supplementarytext}</span>`;
              }//question 33 changes to question 55.. 
              else if (question.question == "33. Incidence of MINOR Defects compared to similar buildings" || question.question == "Question 48. Incidence of MINOR Defects compared to similar buildings") {
                document.getElementById("summary-minor-defects").innerHTML += `<span>${answer.blu_name}</span>-<span style='font-style: italic;margin-left:15px'>${answer.blu_supplementarytext == null ? "" : answer.blu_supplementarytext}</span>`;
              }//question 47 changes to question 51.. 
              else if (question.question == "47. SUMMARY" || question.question == "Question 55. SUMMARY" || question.question == "Question 51. SUMMARY") {
                document.getElementById("summary-pest-only").innerHTML += answer.blu_name.includes("SUB_Q:") ? `<p><b>${answer.blu_name.split(":")[1]}</b><br/>` : `${answer.blu_name}</p>`;
              }
              else if (question.question == "35. Overall condition and conclusions" || question.question == "Question 50. Overall condition and conclusions") {
                document.getElementById("building-recommendation").innerHTML += answer.blu_name.includes("SUB_Q:") ? "" : ` <span>${answer.blu_name}</span>${answer.blu_supplementarytext == null ? "" : "-<span style='font-style: italic;margin-left:15px'>" + answer.blu_supplementarytext + "</span>"}.`;
              } else if (question.question == "36. Overall Condition" || question.question == "Question 51. Overall Condition") {
                document.getElementById("general-rating").innerHTML += `<span>${answer.blu_name}</span>`;
              }


              
              /*END - populating questions to the summary page of the report*/

              /*Explaination section..*/

              answer.blu_blu_inspectionanswer_blu_inspectionexplan.forEach(expl => {
                expl.blu_name == "-" ? '' : questionSection.innerHTML += `<p>${expl.blu_name}</p>`;
                questionSection.innerHTML += `<ul>`
                expl.blu_blu_inspectionexplanation_blu_inspectiono.forEach(opt => {
                  questionSection.innerHTML += `<li style='font-style: italic; color: #0B5394;margin-left:15px;'>
                  ${opt.blu_name}
                  </li>`
                })
                questionSection.innerHTML += '</ul>';
              });

              /*End - Explaination section..*/

            });

            /*Question images section..*/

            if (question.question_images.length > 0) {
              questionSection.innerHTML += `<div style="display: grid;gap: 15px;grid-template-columns: auto auto auto; width: 100%;">`;
              question.question_images.forEach(photo => {
                questionSection.innerHTML += `<img style="height:30vh;width:30vw; margin:10px;" src="http://localhost:${port}/images/${photo}.webp" alt="." />`;
              });
              questionSection.innerHTML += `</div>`;
            }
            /*End - Question images section..*/

            catPage.appendChild(questionSection);
          });


          document.getElementById("table-of-content").innerHTML += `<tr><td>${category.cartegoryName}</td><td><hr class='dotted'></td><td>${sectionCounter++}</td></tr>`;

        }
        document.getElementById("report").appendChild(catPage);
      });

      // Update defect status based on counts
      const updateDefectStatus = (defectType, found) => {
        const elementId = `${defectType}-found`;
        const elementNotFoundId = `${defectType}-not-found`;
        document.getElementById(elementId).innerHTML = found ? `<span><img src="data:image/png;base64, ${greenTick}" alt="." /></span>` : '';
        document.getElementById(elementNotFoundId).innerHTML = found ? '' : `<span><img src="data:image/png;base64, ${greenTick}" alt="." /></span>`;
      };

      updateDefectStatus("major", major > 0);
      updateDefectStatus("minor", minor > 0);
      updateDefectStatus("safety", safety > 0);

    }, inspection, greenTick, port, { timeout: 600000 });



    // Generate the PDF
    await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      path: "myfile.pdf",
      headerTemplate: `<div></div>`,
      footerTemplate: `
        <div style=' width:100vw; padding-top:0px; height:40px; padding:5px;border-top-style: solid; border-top-width: 1px;'>
        <div style=' width:100%; height:100%; padding:10px; display:grid; grid-template-columns: 4fr 4fr 4fr;'>
          <p  style='margin-left:10px; font-size: 10px;'><span style='font-size:larger;'>${inspection.inspectionDetails.blu_name}</span><br/><span style='font-size:larger;'>${inspection.inspectionDetails.blu_address.split("=")[1]}</span></p>
          <div style='display:flex; justify-content:center;'>
          <img style="width: 120px; height:40px;" src="data:image/jpeg;base64, ${logo}" alt="." />
          </div>
          <p style='font-size: 10px; text-align:right; margin-right:20px;'>Page <span span style='font-size:larger;' class='pageNumber'></span> of <span span style='font-size:larger;' class='totalPages'></span><br/></p>
        </div></div>`,
      zoomFactor: 0.6,
      waitUntil: "load",
      margin: {
        top: "40px",
        bottom: "100px",
        left: "20px",
        right: "20px"
      },
      timeout: 600000
    })

    // Send PDF to client
    const pdfBuffer = fs.readFileSync("myfile.pdf");
    res.contentType("application/pdf");
    res.send(pdfBuffer).status(200);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.send(error).status(500);
  }

});



app.get("/:id", async (req, res) => {
  try {
    // Fetch token and inspection details concurrently
    const acc_token = await data.getToken();
    const inspectionDetailsUrl = `https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectiondetails(${req.params.id})?$expand=blu_inspectiondetail_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg'),blu_blu_inspectiondetail_blu_inspectioncatego($select=blu_name,blu_categoryhasbeenanswered;$filter=blu_categoryhasbeenanswered eq 1;$orderby=blu_id asc),owninguser,blu_inspectiondetail_inspectionportalqa`;
    const inspectionDetails = await data.mydataasync(inspectionDetailsUrl, acc_token);
    //const buyerUrl = `https://tpi.api.crm6.dynamics.com/api/data/v9.2/contacts?$select=fullname&$filter=contactid eq ${inspectionDetails._blu_buyer_value}`;
    //const buyer = await data.mydataasync(buyerUrl, acc_token);
    //console.log(buyer);
    //console.log(inspectionDetails._blu_buyer_value);
    //console.log(path.resolve(__dirname,"ReportImages/"))
    //await data.emptyFolder(path.resolve(__dirname, "ReportImages/"));

    const cartegories = await Promise.all(inspectionDetails.blu_blu_inspectiondetail_blu_inspectioncatego.map(async (category) => {
      const nestedQuestionsUrl = `https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionquestions?$select=blu_name,blu_questionhasbeenanswered,blu_id&$filter=_blu_categoryid_value eq ${category.blu_inspectioncategoryid} and blu_questionhasbeenanswered eq true&$orderby=blu_questionorder asc&$expand=blu_inspectionquestion_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg')`;
      const questionsVal = await data.mydataasync(nestedQuestionsUrl, acc_token);
      //console.log(questionsVal);
      const questions = await Promise.all(questionsVal.value.map(async (question) => {
        const inspectionAnswersUrl = `https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionanswers?$select=blu_name,blu_selected,blu_id,blu_supplementarytext,_blu_questionid_value&$filter=blu_selected eq true and _blu_questionid_value eq ${question.blu_inspectionquestionid}&$orderby=blu_id asc&$expand=blu_blu_inspectionanswer_blu_inspectionexplan($select=blu_name,blu_explanationhasbeengiven;$filter=blu_explanationhasbeengiven eq true;$expand=blu_blu_inspectionexplanation_blu_inspectiono($select=blu_name;$filter=blu_selected eq true)),blu_inspectionanswer_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg')`;
        const answers = await data.mydataasync(inspectionAnswersUrl, acc_token);
        //console.log(answers);
        await data.Convert_to_Webp(question.blu_inspectionquestion_Annotations);
        await Promise.all(answers.value.map(async (answ) => {
          await data.Convert_to_Webp(answ.blu_inspectionanswer_Annotations);
          await answ.blu_inspectionanswer_Annotations.map(img => img.annotationid);
        }))
        return {
          question: question.blu_name,
          question_images: await question.blu_inspectionquestion_Annotations.map(image => image.annotationid),
          answers: answers
        };
      }));


      return {
        cartegoryName: category.blu_name,
        id: category.blu_inspectioncategoryid,
        questions: JSON.parse(JSON.stringify(questions))
      };
    }));

    await data.Convert_to_Webp(inspectionDetails.blu_inspectiondetail_Annotations);

    const inspection = {
      inspectionDetails: inspectionDetails,
      inspectionImages: inspectionDetails.blu_inspectiondetail_Annotations.map(image => image.annotationid),
      questionStructure: JSON.parse(JSON.stringify(cartegories)),
      buyer: inspectionDetails.blu_inspectiondetail_inspectionportalqa.find(val => val.blu_name == "Vendors Name").blu_answer
    };


    delete inspection.inspectionDetails.blu_inspectiondetail_Annotations;
    //console.log(inspection);

    res.status(200).json(inspection);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }

});

app.get("/", (req, res) => {
  res.send("Welcome to TPI - server!!");
})








app.listen(port, () => {
  console.log("listening in localhost:" + port + "/")
})