const server = require("express");
const app = server();
const port = 5000;
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("node:fs");
const msal = require("@azure/msal-node");
const data = require("./getBnPReport");
const { title } = require("process");


app.use('/css', server.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', server.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', server.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use("/htmlfile",server.static(path.join(__dirname, "page.html")));



app.get("/:id", async(req, res) => {
  var inspectionDetails = {};
  var cartegories = [];
  const inspectionDetailandCategory_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectiondetails("+req.params.id+")?$expand=blu_inspectiondetail_Annotations,blu_blu_inspectiondetail_blu_inspectioncatego($select=blu_name,blu_categoryhasbeenanswered;%20$filter=blu_categoryhasbeenanswered%20eq%201;$orderby=blu_id asc),owninguser($select=mobilephone,fullname)";
  //const inspectionAnswers_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionanswers?$select=blu_name,blu_selected,blu_id,_blu_questionid_value&$filter=blu_selected%20eq%20true%20and%20_blu_questionid_value%20eq%2012345&$orderby=blu_id%20asc&$expand=blu_blu_inspectionanswer_blu_inspectionexplan($select=blu_name,blu_explanationhasbeengiven;$filter=blu_explanationhasbeengiven%20eq%20true;$expand=blu_blu_inspectionexplanation_blu_inspectiono($select=blu_name;$filter=blu_selected%20eq%20true))";

  await data(inspectionDetailandCategory_url).then(async dat=>{
     inspectionDetails = dat;
     //console.log(inspectionDetails);
    for(var i=0;i<dat.blu_blu_inspectiondetail_blu_inspectioncatego.length;i++){
      var nested_questions_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionquestions?$select=blu_name,blu_questionhasbeenanswered,blu_id&$filter=_blu_categoryid_value%20eq "+dat.blu_blu_inspectiondetail_blu_inspectioncatego[i].blu_inspectioncategoryid+" and%20blu_questionhasbeenanswered%20eq%20true&$orderby=blu_questionorder asc&$expand=blu_inspectionquestion_Annotations";
      var questions = [];
      await data(nested_questions_url).then(async questionsval=>{
        
        for(var j=0; j<questionsval.value.length;j++){
          
          const inspectionAnswers_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionanswers?$select=blu_name,blu_selected,blu_id,blu_supplementarytext,_blu_questionid_value&$filter=blu_selected%20eq%20true%20and%20_blu_questionid_value%20eq%20"+questionsval.value[j].blu_inspectionquestionid+"&$orderby=blu_id%20asc&$expand=blu_blu_inspectionanswer_blu_inspectionexplan($select=blu_name,blu_explanationhasbeengiven;$filter=blu_explanationhasbeengiven%20eq%20true;$expand=blu_blu_inspectionexplanation_blu_inspectiono($select=blu_name;$filter=blu_selected%20eq%20true)),blu_inspectionanswer_Annotations";

          await data(inspectionAnswers_url).then(async (answers)=>{
            questions.push({
              question:questionsval.value[j].blu_name,
              question_images:questionsval.value[j].blu_inspectionquestion_Annotations,
              answers:answers,
            })
          });

          
        };

        cartegories.push({
            cartegoryName:dat.blu_blu_inspectiondetail_blu_inspectioncatego[i].blu_name,
            id:dat.blu_blu_inspectiondetail_blu_inspectioncatego[i].blu_inspectioncategoryid,
            questions:questions,
          });
        
        
      })
    }
  });
const inspection = {
  inspectionDetails:inspectionDetails,
  inspectionImages:inspectionDetails.blu_inspectiondetail_Annotations,
  questionStructure:cartegories
}
 res.json(inspection);
});



app.get("/test-new-pdf/:id",async (req,res)=>{
  var inspectionDetails = {};
  var cartegories = [];
  let minor = 0;
  let major = 0;
  let safety = 0;
  const inspectionDetailandCategory_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectiondetails("+req.params.id+")?$expand=blu_inspectiondetail_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg'),blu_blu_inspectiondetail_blu_inspectioncatego($select=blu_name,blu_categoryhasbeenanswered;%20$filter=blu_categoryhasbeenanswered%20eq%201;$orderby=blu_id asc),owninguser";
  //const inspectionAnswers_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionanswers?$select=blu_name,blu_selected,blu_id,_blu_questionid_value&$filter=blu_selected%20eq%20true%20and%20_blu_questionid_value%20eq%2012345&$orderby=blu_id%20asc&$expand=blu_blu_inspectionanswer_blu_inspectionexplan($select=blu_name,blu_explanationhasbeengiven;$filter=blu_explanationhasbeengiven%20eq%20true;$expand=blu_blu_inspectionexplanation_blu_inspectiono($select=blu_name;$filter=blu_selected%20eq%20true))";

  await data(inspectionDetailandCategory_url).then(async dat=>{
     inspectionDetails = dat;
    for(var i=0;i<dat.blu_blu_inspectiondetail_blu_inspectioncatego.length;i++){
      var nested_questions_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionquestions?$select=blu_name,blu_questionhasbeenanswered,blu_id&$filter=_blu_categoryid_value%20eq "+dat.blu_blu_inspectiondetail_blu_inspectioncatego[i].blu_inspectioncategoryid+" and%20blu_questionhasbeenanswered%20eq%20true&$orderby=blu_questionorder asc&$expand=blu_inspectionquestion_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg')";
      var questions = [];
      await data(nested_questions_url).then(async questionsval=>{
        
        for(var j=0; j<questionsval.value.length;j++){
          
          const inspectionAnswers_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionanswers?$select=blu_name,blu_selected,blu_id,blu_supplementarytext,_blu_questionid_value&$filter=blu_selected%20eq%20true%20and%20_blu_questionid_value%20eq%20"+questionsval.value[j].blu_inspectionquestionid+"&$orderby=blu_id%20asc&$expand=blu_blu_inspectionanswer_blu_inspectionexplan($select=blu_name,blu_explanationhasbeengiven;$filter=blu_explanationhasbeengiven%20eq%20true;$expand=blu_blu_inspectionexplanation_blu_inspectiono($select=blu_name;$filter=blu_selected%20eq%20true)),blu_inspectionanswer_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg')";

          await data(inspectionAnswers_url).then(async (answers)=>{
            questions.push({
              question:questionsval.value[j].blu_name,
              question_images:questionsval.value[j].blu_inspectionquestion_Annotations,
              answers:answers,
            })
          });

          
        };

        cartegories.push({
            cartegoryName:dat.blu_blu_inspectiondetail_blu_inspectioncatego[i].blu_name,
            id:dat.blu_blu_inspectiondetail_blu_inspectioncatego[i].blu_inspectioncategoryid,
            questions:questions,
          });
        
        
      })
    }
  });

  const inspection = {
    inspectionDetails:inspectionDetails,
    inspectionImages:inspectionDetails.blu_inspectiondetail_Annotations,
    questionStructure:cartegories
  }

 // console.log(JSON.stringify(cartegories));
  
  const myHTML = fs.readFileSync(path.join(__dirname, "ReportTemplates/pre_purchase_building_pest.html"), "utf8");
  const logo = fs.readFileSync(path.join(__dirname,"Resources/tpilogo.jpg"),{encoding:"base64"});
  const greenTick = fs.readFileSync(path.join(__dirname,"Resources/green-tick.png"),{encoding:"base64"});
  const browser = await puppeteer.launch({});
  console.log("started..");
  const page = await browser.newPage();

  //console.log(logo);

 await page.setContent(myHTML,{
  timeout:30000,
  waitUntil:"load"
 });
 await page.addStyleTag({path:"index.css"});
 await page.addStyleTag({path:"node_modules/bootstrap/dist/css/bootstrap.min.css"});
// await page.addScriptTag({path:"https://unpkg.com/pagedjs/dist/paged.polyfill.js"});
 //await page.addScriptTag({path:"pup_to_pdf.js"});
 
 await page.evaluate((inspection,greenTick)=>{
  //general photos section
  var major = 0;
  var minor = 0;
  var safety = 0;
  //adding inspector name and phone number to the report.
  document.getElementById("insp-name").innerHTML = inspection.inspectionDetails.owninguser.fullname;
  document.getElementById("insp-mobile").innerHTML = inspection.inspectionDetails.owninguser.mobilephone;
  //End-adding inspector name and phone number to the report.
  inspection.inspectionImages.forEach(photo=>{
    document.getElementById("gen_photos").innerHTML += `${photo.isdocument==true && `<img style="height:30vh;width:30vw" src='data:${photo.mimetype};base64, ${photo.documentbody}' alt='.' />`}`
  })
  document.getElementById("coverpage-image").src = `data:${inspection.inspectionImages[0].mimetype};base64, ${inspection.inspectionImages[0].documentbody}`;
  var sectionCounter = 5;
  inspection.questionStructure.map(cartegory=>{
    //create element
    document.getElementById("table-of-content").innerHTML +=`<tr>
                        <td>${cartegory.cartegoryName == "Interior of Building - BYB" || cartegory.cartegoryName == "Exterior of Building - BYB"? cartegory.cartegoryName.split("-")[0]+" - Summary":cartegory.cartegoryName }</td>
                        <td><hr class='dotted'></td>
                        <td>${sectionCounter++}</td>
                    </tr>`


    const catpage = document.createElement("div");
    catpage.style = "page-break-before:always";
    //for BYB type reports..
    if(cartegory.cartegoryName == "Interior of Building - BYB" || cartegory.cartegoryName == "Exterior of Building - BYB"  ){
      catpage.innerHTML = `<p style="background-color: #0B5394; color: #EBF2F2; padding: 5px;" class="chapter-title">${cartegory.cartegoryName.split("-")[0]+ " - Summary"}</p>`;
      cartegory.questions.map(question=>{
        const que_section = document.createElement("div");
        //que_section.innerHTML += `<h5 style="color:red;">${question.question}</h5>`
        que_section.innerHTML += '<div>';

        

        if(question.question_images.length>0){
          que_section.innerHTML +=`<div style="padding-left:100px; width: 80%;">`;
          question.question_images.forEach(photos=>{
            que_section.innerHTML +=`<img style="height:35vh;width:50vw; margin-left:200px;" src='data:${photos.mimetype};base64, ${photos.documentbody}' alt='.' />`
          })
          que_section.innerHTML +=`</div>`;
        }
        
        question.answers.value.forEach(answer=>{
          que_section.innerHTML +=`<p style='font-weight:bold; text-align:center;'>${answer.blu_name}</p>`;

          /*populating questions to the summary page of the report*/
          if(question.question == "32. Incidence of MAJOR Defects compared to similar buildings"){
            document.getElementById("summary-major-defects").innerHTML += `<span>${answer.blu_name}</span>-<span style='font-style: italic;margin-left:15px'>${answer.blu_supplementarytext==null?"":answer.blu_supplementarytext}</span>`;
          }else if(question.question == "33. Incidence of MINOR Defects compared to similar buildings"){
            document.getElementById("summary-minor-defects").innerHTML += `<span>${answer.blu_name}</span>-<span style='font-style: italic;margin-left:15px'>${answer.blu_supplementarytext==null?"":answer.blu_supplementarytext}</span>`;
          }

          /*END - populating questions to the summary page of the report*/

        });
        que_section.innerHTML += '</div>';
  
        catpage.appendChild(que_section);
      })
    }
    //End- BYY type reports..
    else{
      catpage.innerHTML = `<p style="background-color: #0B5394; color: #EBF2F2; padding: 5px;" class="chapter-title">${cartegory.cartegoryName}</p>`;
      cartegory.questions.map(question=>{
        const que_section = document.createElement("div");
        que_section.innerHTML += `<h5 style="color:red;margin-top:10px;">${question.question}</h5>`
        que_section.innerHTML += '<ul>';
        
        question.answers.value.forEach(answer=>{
          que_section.innerHTML +=`${answer.blu_name.includes("SUB_Q:")?"<p class='heading-three'>"+answer.blu_name+"</p>":`<li style='margin-left:10px'><span style='font-weight:bold'>${answer.blu_name}</span>
                                <span style='font-style: italic;margin-left:15px'>${answer.blu_supplementarytext==null?"":answer.blu_supplementarytext}</span></li>`}`;
  
          if(answer.blu_name == "Defect Rating: MINOR DEFECTS" || answer.blu_name == "Defect Rating: MINOR DEFECT"){ minor += 1;}
          if(answer.blu_name == "Defect Rating: SAFETY HAZARDS" || answer.blu_name == "Defect Rating: SAFETY HAZARD" ){ safety+=1;}
          if(answer.blu_name == "Defect Rating: MAJOR DEFECTS" || answer.blu_name == "Defect Rating: MAJOR DEFECT"){ major+=1;}

          /*populating questions to the summary page of the report*/
          if(question.question == "32. Incidence of MAJOR Defects compared to similar buildings"){
            document.getElementById("summary-major-defects").innerHTML += `<span>${answer.blu_name}</span>-<span style='font-style: italic;margin-left:15px'>${answer.blu_supplementarytext==null?"":answer.blu_supplementarytext}</span>`;
          }else if(question.question == "33. Incidence of MINOR Defects compared to similar buildings"){
            document.getElementById("summary-minor-defects").innerHTML += `<span>${answer.blu_name}</span>-<span style='font-style: italic;margin-left:15px'>${answer.blu_supplementarytext==null?"":answer.blu_supplementarytext}</span>`;
          }else if(question.question == "47. SUMMARY"){
            document.getElementById("summary-pest-only").innerHTML += answer.blu_name.includes("SUB_Q:")?`<p><b>${answer.blu_name.split(":")[1]}</b><br/>`:`${answer.blu_name}</p>`;
          }else if(question.question == "35. Overall condition and conclusions"){
            document.getElementById("building-recommendation").innerHTML += answer.blu_name.includes("SUB_Q:")?"":`<span>${answer.blu_name}</span>-<span style='font-style: italic;margin-left:15px'>${answer.blu_supplementarytext==null?"":answer.blu_supplementarytext}.</span>`;
          }else if(question.question == "36. Overall Condition"){
            document.getElementById("general-rating").innerHTML += `<span>${answer.blu_name}</span>-<span style='font-style: italic;margin-left:15px'>${answer.blu_supplementarytext==null?"":answer.blu_supplementarytext}.</span>`;
          }


          /*END - populating questions to the summary page of the report*/


  
          answer.blu_blu_inspectionanswer_blu_inspectionexplan.forEach(expl => {
            que_section.innerHTML +=`<ul>`
            expl.blu_blu_inspectionexplanation_blu_inspectiono.forEach(opt=>{
              que_section.innerHTML +=`<li style='font-style: italic; color: #0B5394;margin-left:15px;'>
              ${opt.blu_name}
              </li>`
            })
            que_section.innerHTML += '</ul>';
          });
        });
        que_section.innerHTML += '</ul>';
  
        if(question.question_images.length>0){
          que_section.innerHTML +=`<div style="display: grid; column-gap: 30px; grid-template-columns: auto auto auto; width: 80%;">`;
          question.question_images.forEach(photos=>{
            que_section.innerHTML +=`<img style="height:30vh;width:26vw; margin:15px;" src='data:${photos.mimetype};base64, ${photos.documentbody}' alt='.' />`
          })
          que_section.innerHTML +=`</div>`;
        }
  

        catpage.appendChild(que_section);
      })
    }
    //document.getElementById("safety-found").innerHTML +=`<p>safety-found</p>`;

    if(major>0){
      document.getElementById("major-found").innerHTML =`<span><img src="data:image/png;base64, ${greenTick}" alt="." /></span>`;
      document.getElementById("major-not-found").innerHTML ="";
    }else{
      document.getElementById("major-not-found").innerHTML =`<span><img src="data:image/png;base64, ${greenTick}" alt="." /></span>`;
      document.getElementById("major-found").innerHTML ="";
    }
    if(minor>0){
      document.getElementById("minor-found").innerHTML =`<span><img src="data:image/png;base64, ${greenTick}" alt="." /></span>`;
      document.getElementById("minor-not-found").innerHTML ="";
    }else{
      document.getElementById("minor-not-found").innerHTML =`<span><img src="data:image/png;base64, ${greenTick}" alt="." /></span>`;
      document.getElementById("minor-found").innerHTML ="";
    }
    if(safety>0){
      document.getElementById("safety-found").innerHTML =`<span><img src="data:image/png;base64, ${greenTick}" alt="." /></span>`;
      document.getElementById("safety-not-found").innerHTML ="";
    }else{
      document.getElementById("safety-not-found").innerHTML =`<span><img src="data:image/png;base64, ${greenTick}" alt="." /></span>`;
      document.getElementById("safety-found").innerHTML ="";
    }

    document.getElementById("report").appendChild(catpage);
    
  });
  
 },inspection,greenTick);

 

 await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    path:"myfile.pdf",
    headerTemplate:`<div></div>`,
    footerTemplate:`
    <div style=' width:100vw; padding-top:0px; height:40px; padding:5px;border-top-style: solid; border-top-width: 1px;'>
    <div style=' width:100%; height:100%; padding:10px; display:grid; grid-template-columns: 4fr 4fr 4fr;'>
      <p  style='margin-left:10px; font-size: 10px;'><span style='font-size:larger;'>${inspection.inspectionDetails.blu_name}</span><br/><span style='font-size:larger;'>${inspection.inspectionDetails.blu_address.split("=")[1]}</span></p>
      <div style='display:flex; justify-content:center;'>
      <img style="width: 120px; height:40px;" src="data:image/jpeg;base64, ${logo}" alt="." />
      </div>
      <p style='font-size: 10px; text-align:right; margin-right:20px;'>Page <span span style='font-size:larger;' class='pageNumber'></span> of <span span style='font-size:larger;' class='totalPages'></span><br/></p>
    </div></div>`,
    zoomFactor: 0.75,
    waitUntil: "load",
    margin: {
      top: "40px",
      bottom: "80px",
      left: "20px",
      right: "20px"
    }
  });

  res.status(200).json({message:"successful"});

});

//getting authentication token to call dataverse apis

app.get("/get-auth-token/:jobNumber",async (req,res)=>{
  
  console.log("access request running..");
  
  //config parameters..
  const msalconfig = {
    auth:{
      clientId:"7b5db71f-f402-45f4-b693-838a5f19b32b",
      authority:"https://login.microsoftonline.com/765bb9c7-c916-4c22-8206-591682876419",
      clientSecret:"ZKK8Q~4DLqRxKIqL4lv1Pf1lhXZCGZOJDBA1BbOZ",
      tenantId:"765bb9c7-c916-4c22-8206-591682876419",
      Audience: '7b5db71f-f402-45f4-b693-838a5f19b32b'
    }
  }
  //initialize the deamon
  const cca = new msal.ConfidentialClientApplication(msalconfig);
  const tokenRequest = {
    scopes:['https://tpi.api.crm6.dynamics.com/.default'],
  };
  cca.acquireTokenByClientCredential(tokenRequest).then((response)=>{
    //console.log(response);
    fetch("https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectiondetails?$select=blu_name&$filter=blu_name eq '"+req.params.jobNumber+"'",{
      headers: {
        Authorization: 'Bearer '+response.accessToken, 
      }
    }).then((data)=>{
      data.json().then(dat=>res.json(dat).status(200));
    }).catch((err)=>{
      res.send(err);
      console.log(err);
    })
    
  }).catch((err)=>{
    console.log(err);
  })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
