const express = require("express");
const myapp = express.Router();
const data = require("./getBnPReport");


myapp.get("/:id",async(req,res,next)=>{
    var acc_token = "";
    await data.getToken().then(dat=>{
      acc_token = dat;
    });
    console.log(acc_token);
  
  
    var inspectionDetails = {};
    var cartegories = [];
    let minor = 0;
    let major = 0;
    let safety = 0;
    const inspectionDetailandCategory_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectiondetails("+req.params.id+")?$expand=blu_inspectiondetail_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg'),blu_blu_inspectiondetail_blu_inspectioncatego($select=blu_name,blu_categoryhasbeenanswered;%20$filter=blu_categoryhasbeenanswered%20eq%201;$orderby=blu_id asc),owninguser";
    //const inspectionAnswers_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionanswers?$select=blu_name,blu_selected,blu_id,_blu_questionid_value&$filter=blu_selected%20eq%20true%20and%20_blu_questionid_value%20eq%2012345&$orderby=blu_id%20asc&$expand=blu_blu_inspectionanswer_blu_inspectionexplan($select=blu_name,blu_explanationhasbeengiven;$filter=blu_explanationhasbeengiven%20eq%20true;$expand=blu_blu_inspectionexplanation_blu_inspectiono($select=blu_name;$filter=blu_selected%20eq%20true))";
  
    await data.mydataasync(inspectionDetailandCategory_url,acc_token).then(async dat=>{
       inspectionDetails = dat;
      for(var i=0;i<dat.blu_blu_inspectiondetail_blu_inspectioncatego.length;i++){
        var nested_questions_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionquestions?$select=blu_name,blu_questionhasbeenanswered,blu_id&$filter=_blu_categoryid_value%20eq "+dat.blu_blu_inspectiondetail_blu_inspectioncatego[i].blu_inspectioncategoryid+" and%20blu_questionhasbeenanswered%20eq%20true&$orderby=blu_questionorder asc&$expand=blu_inspectionquestion_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg')";
        var questions = [];
        await data.mydataasync(nested_questions_url,acc_token).then(async questionsval=>{
          
          for(var j=0; j<questionsval.value.length;j++){
            
            const inspectionAnswers_url = "https://tpi.api.crm6.dynamics.com/api/data/v9.2/blu_inspectionanswers?$select=blu_name,blu_selected,blu_id,blu_supplementarytext,_blu_questionid_value&$filter=blu_selected%20eq%20true%20and%20_blu_questionid_value%20eq%20"+questionsval.value[j].blu_inspectionquestionid+"&$orderby=blu_id%20asc&$expand=blu_blu_inspectionanswer_blu_inspectionexplan($select=blu_name,blu_explanationhasbeengiven;$filter=blu_explanationhasbeengiven%20eq%20true;$expand=blu_blu_inspectionexplanation_blu_inspectiono($select=blu_name;$filter=blu_selected%20eq%20true)),blu_inspectionanswer_Annotations($filter=isdocument eq true and mimetype eq 'image/jpeg')";
  
            await data.mydataasync(inspectionAnswers_url,acc_token).then(async (answers)=>{
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

  //consuming the data from the api..
   //general photos section
   //adding inspector name and phone number to the report.
   
   //End-adding inspector name and phone number to the report.
   
   var sectionCounter = 5;
   


    //END - Smarts go here..

    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
   <head>
   <!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<!-- Optional theme -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

<!-- Latest compiled and minified JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
   </head>
<body>
    <!--Date stamp not there..
    
    -->
    <style>
    .title {
    color: #0F6CBD
}

.heading-one {
    color: #0B5394;
}
.heading-three{
    background-color: #C7E2FA; 
    padding: 5px;
    margin-top: 10px;
}
.heading-two{
    background-color: #0B5394; 
    color: #EBF2F2; 
    padding: 5px;
}
.heading-four{
    color: #0B5394; 
    border-top-style: solid;
    border-top-width: .5px; 
    padding: 5px; 
    margin-top: 5px;
}
.front-page-image{
    width: 40%;
    height: 350px;
    margin-bottom: 20px;
}

.dotted {
    border: 1px dotted #ff0000; 
    border-style: none none dotted; 
    color: #fff; 
    background-color: #fff; 
}

.footer{
    border-top-style: solid;
    border-top-width: .5px;
}

    
    </style>
    <div>
        <!--cover page-->
        <div class="text-center">
            <img style="width: 40%;margin-bottom: 20px;" src="http://thepropertyinspectors.com.au/wp-content/uploads/2022/11/tpilogo.jpg"
                alt="." />
            <h3><b>Pre-Purchase Building & Pest Inspection Report</b></h3><br/>
            <p style="font-size: small;">Complies with Australian Standard AS 4349.1-2007<br />
                Inspection of Buildings Part 1: Pre-Purchase<br />
                Inspections Residential Buildings - Appendix C<br /></p>
            <!--image goes here-->
            <img style="width: 40%;margin-bottom: 20px;" src="data:${inspection.inspectionImages[0].mimetype};base64, ${inspection.inspectionImages[0].documentbody}" id="coverpage-image" class="front-page-image"/>
            <h1 style="color:#0F6CBD; margin-top: 10px;margin-bottom: 10px;">BUILDING & PEST REPORT</h1><br/>
            <p>
                Commissioning Party's Name: Natalie Ferguson<br /><br/>
                <span style="font-size: large;"><b>Property Address: 45 Evans Street, Balmain NSW, Australia</b></span><br /><br/>
                Date of Inspection: 13/06/2024<br /><br/>
                Inspector's Name :{insert inspectors Name}<br /><br/>
                Insert Inspectors mobile phone number | 02 9181 5989 | admin@tpi.com.au<br /><br/>
                level 2, 118 Christie St, St Leonards NSW 2065<br />
            </p>
            
            <!--End of cover content-->
            <!--Cover page footer-->
            <!--div style="background-color: #0B5394; color: #EBF2F2; padding: 5px; margin-top: 5px; margin-bottom: 5px;" class="p-3">

                <div>
                    <div>
                        <p><b>The Property Inspectors</b></p>
                    </div>
                </div>
                <div class="d-flex justify-content-between">
                    <div class="text-left">
                        <p style="text-align: left;">Phone: (02)91815989</p>
                        <p style="text-align: left;">Address: 45 Evans Street Balmain</p>
                        <p style="text-align: left;">Email: admin@tpi.com.au</p>
                    </div>
                    <div class="text-right">
                        <p style="text-align: right;">Mobile: 0411 880 588</p>
                        <p style="text-align: right;">Mail: PO Box 290 Hunters Hill NSW 2110</p>
                        <p style="text-align: right;">http://www.tpi.com.au</p>
                    </div>

                </div>

            </div-->


        </div>
    </div>
    <!--Disclaimer page-->
    <div>
        <div style="background-color: #0B5394; color: #EBF2F2; page-break-before:always; page-break-after:always; padding:10px; font-size: small; border-radius: 100px;"
            class="text-center py-5">

            <h1><b>DISCLAIMER OF LIABILITY TO ANY THIRD PARTIES:</h1>
            <p>IMPORTANT<br /></b></p>
            <p>The information on this page is important and must be read before looking at the accompanying
                report.<br /></p>
            <p>You should not rely on this report if you wish to purchase the property.<br /></p>
            <p>This Report has been prepared for the Client, as listed on the cover page of this report, and for the
                exclusive use of the Client <br />only.<br /></p>
            <p>Accordingly, you should not rely upon this document if you intend to purchase the property to which it
                relates.<br /></p>
            <p>In receiving or viewing this report you are acknowledging that you will not rely upon it if you intend to
                purchase the <br />property.<br /></p>
            <p>If you require information contained in this report, you should seek out and commission the completion of
                your own report.<br /></p>
            <p>In that regard, The Property Inspectors can supply a report that you can rely upon.<br /></p>
            <p>Please see our website: www.thepropertyinspectors.com.au if you wish to purchase such a report.<br /></p>
            <p>Alternatively, you can arrange for another contractor to provide you with a report.<br /></p>
            <p>The Property Inspectors will not accept any responsibility and shall not be liable for any loss or
                damage, including in <br />negligence, arising out of or in connection with any use or reliance on the
                statements, comments, photographs or any other <br /></p>
            <p>information in this report.<br /></p>
            <p>This report does not take into account your individual needs, objectives or intentions in regard to the
                property.<br /></p>
            <p>Consideration of your individual needs and concerns can affect the recommendations and conclusions of the
                author of the <br />report.<br /></p>
            <p>Even if you are in possession of this report or have knowledge of its contents or are aware of the
                author, as you have not <br />purchased it you have no entitlement to discuss the report or your
                individual needs or concerns with the author.<br /></p>
            <p>You, as reader, must accept sole responsibility for what you do in relation to any material <br /></p>
            <p>If you do not agree, do not read this report. You can purchase a report that you can rely upon via our
                website or by <br />contacting The Property Inspectors.<br /></p>
            <p>This report can be relied upon if a sales transaction is made and/or a person's name is added to the
                report</p>

        </div>

    </div>
    <div style="page-break-before:always; page-break-after:always" >
        <!--Table of Contents-->
        <div>
            <h1 style="color: #0B5394;"><b>Table of Contents</b></h1>
            <table class="table" style="color: #0B5394;">
                <thead>
                    <tr>
                        <th></th>
                        <th>
                            
                        </th>
                        <th>
                            Section
                        </th>
                    </tr>
                </thead>
                <tbody  id="table-of-content">
                    <tr>
                        <td>Summary Of The Building Only</td>
                        <td><hr class='dotted'></td>
                        <td>1</td>
                    </tr>
                    <tr>
                        <td>Summary Of Pest Only</td>
                        <td><hr class='dotted'></td>
                        <td>2</td>
                    </tr>
                    <tr>
                        <td>Purpose And Scope Of Inspection</td>
                        <td><hr class='dotted'></td>
                        <td>3</td>
                    </tr>
                    <tr>
                        <td>General Photos</td>
                        <td><hr class='dotted'></td>
                        <td>4</td>
                    </tr>
                    ${inspection.questionStructure.map(cartegory=>{
                    return `<tr>
                         <td>${cartegory.cartegoryName == "Interior of Building - BYB" || cartegory.cartegoryName == "Exterior of Building - BYB"? cartegory.cartegoryName.split("-")[0]+" - Summary":cartegory.cartegoryName }</td>
                         <td><!--hr class='dotted'--></td>
                         <td>${sectionCounter++}</td>
                     </tr>`})}
                </tbody>
            </table>
        </div>
    </div>
    <div style="page-break-before:always; page-break-after:always">
        <div>
            <h1 style="color: #0B5394;" class="chapter-title"><b>BUILDING</b></h1>
            <p class="heading-two">SUMMARY OF THE BUILDING ONLY </p><br/>
            <h5 style="text-decoration: underline; color: #0F6CBD;">YOU MUST READ THE ENTIRE REPORT TO UNDERSTAND THE CONDITION
                OF THIS PROPERTY PRIOR TO PURCHASING THE HOME</h5><br/>
            <p>A summary of the results of the building inspection is highlighted below:<br /></p>
            <p style="color: red;">Were MINOR DEFECTS, MAJOR DEFECTS or SAFETY HAZARDS found in this property?<br /></p>
            <table class="table table-bordered border-primary " style="border-color: #0B5394; color: #0B5394;">
                <thead>
                    <tr>
                        <th>Defect Ratings</th>
                        <th>
                            Found
                        </th>
                        <th>
                            Not Found
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <!--fill the table below with occurances of major minor and safety hazards defects selections-->
                    <tr>
                        <td>Were Minor Defect Found?</td>
                        <td><div id="minor-found"></div></td>
                        <td><div  id="minor-not-found"></div></td>
                    </tr>
                    <tr>
                        <td>Were Major Defect Found?</td>
                        <td><div id="major-found"></div></td>
                        <td><div id="major-not-found"></div></td>
                    </tr>
                    <tr>
                        <td>Were Safety Hazard Found?</td>
                        <td><div id="safety-found"></div></td>
                        <td><div id="safety-not-found"></div></td>
                    </tr>
                </tbody>
            </table>
            <br/>
            <h5 class="heading-three">SUMMARY</h5><br/>
            <p>The purpose of the inspection is to identify the major defects and safety hazards associate
                with the property at the time of inspection. The inspection and report is limited to a visual
                assessment of the building members only in accordance with Appendix C AS4349. 1-2007.
            </p>
            <p>The overall condition of this building has been compared to similar constructed buildings of
                approximately the same age where those buildings have had a maintenance program implemented to
                ensure that the building members are still fit for purpose.</p>
            <p><b>The incidences of <u>MAJOR DEFECTS</u> in this property compared to similar buildings is considered to be:</b>
            </p>
            <!--Q32.-->
            <p id="summary-major-defects">

            </p>


            <p><b>The incidence of <u>MINOR DEFECTS</u> in this property as compared with similar buildings is considered:</b></p>
            <!--Q33.-->
            <p id="summary-minor-defects">

            </p>


            <p>The <b>Overall Condition</b> of this property in the context of its age, type and general expectations of
                similar properties is:</p>
                <!--Q36-->
            <p id="general-rating">

            </p>
            <p class="heading-four">OVERALL CONDITION
                COMMENTS:</p>
            <p>Please Note: This is a general appraisal only and cannot be relied upon
                on its own - read the report in its entirety.</p>
            <p><b>Building - Recommendation and Conclusion</b></p>
            <!--Q35-->
            <p id="building-recommendation">

            </p>
            <p>This summary is supplied to allow a quick and superficial overview of the inspection results. This
                summary is not the report and cannot be relied upon on its own. This summary must be read in
                conjunction with the full report and not in isolation from the report. If there should happen to
                be any discrepancy between anything in this report and anything in this summary, the information
                in the report shall override that on this summary.
            </p>

        </div>
    </div>
    <div style="page-break-before:always; page-break-after:always">
        <div>
            <p class="heading-two">SUMMARY OF PEST ONLY</p>
            <!--Pest question summary will be populated here-->
            <!--Q47.-->
            <p id="summary-pest-only">

            </p>
        </div>
    </div>
    <div style="page-break-before:always; page-break-after:always">
        <div>
            <p class="heading-two">Purpose And Scope Of Inspection
            </p>
            <p>This report complies with Australian Standard AS4349.1-2007 Inspection of Buildings, Part 1: Pre-Purchase
                Inspections-Residential Buildings.
            </p>
            <p class="heading-four">INSPECTION AGREEMENT -
                INDIVIDUAL TITLE PROPERTY</p>
            <p>Requirement for Inspection agreement AS 4349.1-2007 requires that an inspection agreement be entered into
                between the inspector & the client
                prior to the conduct of the inspection.
            </p>
            <p>This agreement sets out specific limitations on the scope of the inspection and on limits that apply in
                carrying it out.
            </p>
            <p>Where specific State or Territory requirements apply in addition to the scope of work in this agreement,
                or where the inspector and client agree to additional matters being covered, that additional scope
                is listed at the end of this agreement. </p>
            <p>It is assumed that the existing use of the building will continue.</p>
            <p class="heading-four">PURPOSE OF INSPECTION</p>
            <p>The purpose of the inspection is to provide advice to a prospective purchaser
                or other interested party regarding the condition of the property on the date and at the time of
                the inspection. </p>
            <p>The advice is limited to the reporting of the condition of the Building Elements in accord with Appendix
                B or C AS4349.1-2007 (Appendix B for Strata or Company Title and Appendix C for other residential
                buildings).</p>
            <p class="heading-four">IMPORTANT INFORMATION AND
                DISCLAIMER</p>
            <p>Any person who relies upon the contents of this report does so
                acknowledging that the following clauses both below and at the end of this report. 
            </p>
            <p>These define the Scope and Limitations of the inspection and form an integral part of the report.
            </p>
            <p> Before you decide to purchase this property, you should read and understand all of the information
                contained herein. </p>
            <p>It will help explain what is involved in a Pre-Purchase Building Inspection Report, the difficulties
                faced by an inspector and why it is not possible to guarantee that a property is free of defects,
                latent or otherwise. </p>
            <p>This information forms an integral part of the report. </p>
            <p>If there is anything contained within this report that is not clear or you have difficulty understanding,
                please contact the inspector prior to acting on this report.</p>
            <p>The extent and thoroughness of this inspection has been limited by our reading of what was reasonable by
                way of time, intrusion, and risk of doing physical damage to the property being inspected. 
            </p>
            <p>We have not inspected woodwork or other parts of the structure which are covered, unexposed or
                inaccessible and we are therefore unable to report that any such part of the structure is free
                from defect. Identification of hazardous materials or situations that may be in the building or on
                or near the property is outside the scope of this inspection. </p>
            <p>This report is not a certificate of compliance of the property within the requirements of any Act,
                regulation, ordinance, local law or by-law, and is not a warranty against problems developing with
                the building in the future.</p>

            <p>This report does not include the identification of unauthorized building work or of work not compliant
                with building regulations. With respect to minor defects, the inspection is limited to reporting
                on their overall extent. </p>
            <p>It is not intended to detail each individual minor defect or imperfection. </p>
            <p>This service is provided on an independent professional basis. </p>
            <p>It seeks to present a factual, unbiased, and balanced assessment. </p>
            <p>We have no financial interest in any work that may be recommended or in any share of commission if the
                property is sold.</p>
            <p class="heading-four">SCOPE OF INSPECTION</p>
            <p>The inspection comprised a visual assessment of the property to identify major
                defects and safety hazards, and to form an opinion regarding the general condition of the property
                at the time of inspection. </p>
            <p>An estimate of the cost of rectification of defects is outside the scope of the Standard and therefore
                does not form part of this report.</p>
            <p>AS 4349.1 - 2007 requires that the basis for comparison is a building of similar age and similar type to
                the subject building and which is in reasonable condition, having been adequately maintained over
                the life of the building. </p>
            <p>This means that building being inspected may not comply with Australian Standards, building regulations
                or specific state or territory requirements applicable at the time of the inspection.</p>
            <p  class="heading-four">WHAT IS REPORTED ON:</p>
            <ul>
                <li>The inspection includes subjective appraisal by an inspector competent
                    to assess the condition of residential buildings. It involves a subjective assessment so different
                    inspectors or even the same inspector on a
                    different occasion may reach different conclusions.
                </li>
                <li>The inspection comprises a visual assessment of the property to identify major defects and to
                    form an opinion regarding the general condition of the property at the time of inspection.
                </li>
                <li> The following areas shall be inspected where applicable:</li>
                <li>
                    The interior of the building: ceilings; walls; floors; windows; doors & frames; kitchen; bathroom;
                    WC; ensuite; laundry; stairs & damp problems.
                </li>
                <li>The exterior of the building: walls (including lintels, claddings, doors & windows); timber or steel
                    frames & structures; chimneys; stairs; balconies, verandas, patios, decks, suspended concrete
                    floors,
                    balustrades.</li>
                <li>The roof exterior: roof (including tiles, shingles & slates, roof
                    sheeting, gables, flashings); skylights, vents, flues; valleys; guttering; downpipes; eaves, fascias
                    and barges.</li>
                <li> The roof space: roof covering;
                    roof framing; sarking; party walls; insulation</li>
                <li>The sub-floor space: timber floor (including
                    supports, floor, ventilation, drainage, damp); suspended concrete floors.</li>
                <li>
                    The property within 5m of the house and within the boundaries of the site: car
                    accommodation, detached laundry, ablution facilities and garden sheds; retaining walls (where
                    supporting other structures and landscaping
                    retaining walls &gt; 700mm high); paths & driveways; steps; fencing (excluding swimming pool
                    fences) ; surface water (drainage effectiveness)
                </li>
            </ul>
                <p class="heading-four">WHAT IS NOT REPORTED
                    ON:</p>
                <ul>
                    <li> General exclusions detailed in the standard AS 4349.1-2007.</li>
                    <li> Parts of a building that are under construction.</li>
                    <li> The inspection is not intended to include rigorous assessment of all building elements in a
                        property.</li>
                    <li> Defects that would only be apparent under weather conditions or when using fittings & fixtures.
                    </li>
        
            <li> Defects not apparent due to occupancy or occupancy behavior e.g., nonuse of a leaking
                shower.</li>
            <li>
                The inspection report is not a certificate of compliance of the property within the
                requirements of any Act, regulation, ordinance, local law, or by-law and is not a warranty against
                problems developing with the
                building in the future.
            </li>
            <li>Unauthorized building work or of work not compliant with building regulations.</li>
            <li>Title
                and ownership matters, matters concerning easements, covenants, restrictions, zoning certificates and
                all other law-related matters.</li>
            <li> Estimation of the cost of rectification of specific defects.</li>
            <li>Specifics excluded by the standard AS 4349.1 - 2007 Footings below ground,</li>
            <li> Concealed damp-proof course,</li>
            <li>Electrical installations, </li>
            <li>
                Operation of smoke detectors, </li>
            <li>Light switches and fittings, </li>
            <li> TV, </li>
            <li>
                Sound and communication and security systems,</li>
            <li> Concealed plumbing, </li>
            <li>Adequacy of
                roof drainage as installed, </li>
            <li>Gas fittings and fixtures, </li>
            <li>Air conditioning,
            </li>
            <li>Automatic garage door mechanisms, </li>
            <li>Swimming pools and associated filtration
                and similar equipment, </li>
            <li>The operation of fireplaces and solid fuel heaters, including
                chimneys and flues,</li>
            <li> Alarm systems, </li>
            <li> Intercom systems, </li>
            <li> Soft floor
                coverings, </li>
            <li> Electrical appliances including dishwashers, </li>
            <li>Incinerators,
            </li>
            <li>Ovens, </li>
            <li> Ducted vacuum systems, </li>
            <li>Paint coatings except external
                protective coatings, </li>
            <li>Health hazards (e.g., allergies, soil toxicity, lead content, radon,
                presence of asbestos or urea formaldehyde)</li>
            <li> Timber and metal framing sizes and adequacy,
            </li>
            <li> Concealed tie downs and bracing, </li>
            <li>Timber pest activity, </li>
            <li> Other
                mechanical or electrical equipment (such as gates, inclinators), </li>
            <li> Soil conditions,
            </li>
            <li> Control joints, </li>
            <li> Sustainable development provisions, </li>
            <li> Concealed
                framing-timbers or any areas concealed by wall linings or sidings, </li>
            <li> Landscaping,
            </li>
            <li> Rubbish, </li>
            <li> Floor cover, </li>
            <li> Furniture and accessories, </li>
            <li>
                Stored items, </li>
            <li>Insulation, </li>
            <li> Environmental matters e.g. BASIX, </li>
            <li>
                Water tanks, </li>
            <li> BCA environmental provisions, </li>
            <li>Energy efficiency, </li>
            <li>
                Lighting efficiency.
            </li>
        </ul>

        </div>
    </div>
    <div style="page-break-before:always; page-break-after:always">
        <div>
            
            <p class="heading-four">SPECIAL REQUIREMENTS</p>
            <p>It is acknowledged that there are no special requirements placed on this
                inspection that are outside the scope of the above mentioned Australian Standard. If we do comment
                on an area outside of the above scope, you cannot rely upon the information within the report as
                it is not deemed as included within our report regardless of if payment has been made towards
                those areas of property.</p>
            <p class="heading-four">LIMITATIONS</p>
            <p>This report is limited to a visual inspection of areas where safe and reasonable access
                is available, and access permitted on the date and at the time of inspection.</p>
            <p>The Inspection will be carried out in accordance with AS4349.1-2007. </p>
            <p>The purpose of the inspection is to provide advice to a prospective purchaser regarding the condition of
                the property at the date and time of inspection. </p>
            <p>Areas for Inspection shall cover all safe and accessible areas. </p>
            <p>It does not purport to be geological as to foundation integrity or soil conditions, engineering as to
                structural, nor does it cover the condition of electrical, plumbing, gas or motorized appliances.
            </p>
            <p>It is strongly recommended that an appropriately qualified contractor check these services prior to
                purchase.</p>
            <p>As a matter of course, and in the interests of safety, all prospective purchasers should have an
                electrical report carried out by a suitably qualified contractor & a structural engineer carry
                out an assessment of the structural integrity of the property prior to purchasing this property as
                our comments are general only and you cannot rely upon our report for electrical, plumbing and
                engineering matters.</p>
            <p>This report is limited to (unless otherwise noted) the main structure on the site and no other building,
                structure or outbuilding within 5m of the main structure and within the site boundaries including
                fences.
            </p>
            <p class="heading-four">SAFE AND REASONABLE ACCESS</p>
            <p>Only areas to which safe and reasonable access is available were
                inspected. The Australian Standard 4349.1 defines reasonable access as "areas where safe,
                unobstructed access is provided and the minimum clearances specified below are available, or where
                these clearances are not available, areas within the inspector's unobstructed line of sight and within
                arm's length. Reasonable access does not include removing screws and bolts to access covers."
            </p>
            <p>Reasonable access does not include the use of destructive or invasive inspection methods, nor does it
                include cutting or making access traps or moving any furniture, floor coverings or stored
                goods.
            </p>
            <p class="heading-four">DIMENSIONS FOR REASONABLE ACCESS</p>
            <p><b>Roof Interior </b>- Access opening = 400 x 500 mm - Crawl Space
                = 600 x 600mm - Height accessible from a 3.6m ladder. The safe use of a 3.6m ladder requires the
                ladder to contact the building no greater than 2.7m from the FFL.</p>
            <p><b>Roof Exterior </b>- Must be accessible from a 3.6m ladder placed on the ground. The safe use of a 3.6m
                ladder requires the ladder to contact the building no greater than 2.7m from the FFL.</p>

        </div>
    </div>
    <div style="page-break-before:always; page-break-after:always">
        <div>
            <p style="background-color: #0B5394; color: #EBF2F2; padding: 5px;">General Photos</p>
        </div>
        <div style="display: grid;gap: 30px;grid-template-columns: auto auto auto; width: 80%;" id="gen_photos">
        ${inspection.inspectionImages && inspection.inspectionImages.map(photo=>{
            return `${photo.isdocument==true && `<img style="height:30vh;width:30vw" src='data:${photo.mimetype};base64, ${photo.documentbody}' alt='.' />`}`
        })}
        </div>
    </div>

    
    <div id="report">
        <!--all questions and answers go here..-->
        ${inspection.questionStructure.map(cartegory=>{
            //create element
            //for BYB type reports..
            if(cartegory.cartegoryName == "Interior of Building - BYB" || cartegory.cartegoryName == "Exterior of Building - BYB"  ){
            return `<div style="page-break-before:always"> 
            <p style="background-color: #0B5394; color: #EBF2F2; padding: 5px;" class="chapter-title">${cartegory.cartegoryName.split("-")[0]+ " - Summary"}</p>
            ${cartegory.questions.map(question=>{
                if(question.question_images.length>0){
                    return `<div style="padding-left:100px; width: 80%;">
                        ${question.question_images.map(photos=>{
                            return `<img style="height:35vh;width:50vw; margin-left:200px;" src='data:${photos.mimetype};base64, ${photos.documentbody}' alt='.' />`
                        })}
                        
                    </div>
                    ${question.answers.value.map(answer=>{
                            return `<p style='font-weight:bold; text-align:center;'>${answer.blu_name}</p>`;
                    })}
                    `;
                }
            })}
            </div>`;
            //end of Byb report type..
            }else{
            return `<div style="page-break-before:always"><p style="background-color: #0B5394; color: #EBF2F2; padding: 5px;" class="chapter-title">${cartegory.cartegoryName}</p>
                ${cartegory.questions.map(question=>{
                    return `<div>
                                <h5 style="color:red;margin-top:10px;">${question.question}</h5>
                                    <ul>
                                        ${/*question.answers.value>0 && */question.answers.value.map(answer=>{
                                            return `${answer.blu_name.includes("SUB_Q:")?"<p class='heading-three'>"+answer.blu_name+"</p>":`<li style='margin-left:10px'><span style='font-weight:bold'>${answer.blu_name}</span>
                                                <span style='font-style: italic;margin-left:15px'>${answer.blu_supplementarytext==null?"":answer.blu_supplementarytext}</span></li>`}
                                                
                                                ${/*answer.blu_blu_inspectionanswer_blu_inspectionexplan>0 && */answer.blu_blu_inspectionanswer_blu_inspectionexplan.map(expl => {
                                                    return `<ul>
                                                            ${/*expl.blu_blu_inspectionexplanation_blu_inspectiono>0 && */expl.blu_blu_inspectionexplanation_blu_inspectiono.map(opt=>{
                                                                return `<li style='font-style: italic; color: #0B5394;margin-left:15px;'>
                                                                            ${opt.blu_name} 
                                                                        </li>`
                                                            })}
                                                            </ul>`;
                                                })}`
                                        })}
                                    
                                        ${question.question_images.length>0?
                                        `<div style="display: grid; column-gap: 20px; row-gap: 10px; grid-template-columns: auto auto auto; width: 90%;">
                                            ${question.question_images.map(photos=>{
                                                return `<img style="height:30vh;width:26vw;" src='data:${photos.mimetype};base64, ${photos.documentbody}' alt='.' />`
                                            })}
                                                
                                        </div>`:""}
                                    </ul>
                            </div>`
                })} </div>`   
            }
        })}
    
    </div>
    <div style="page-break-before:always; page-break-after:always">
        <div>
            <p style="background-color: #0B5394; color: #EBF2F2; padding: 5px;">Credits</p>
        </div>
        <div style="text-align: center;">
            <img style="width: 40%;margin-bottom: 20px;" src="http://thepropertyinspectors.com.au/wp-content/uploads/2022/11/tpilogo.jpg" alt="." />
            <p style="text-align: center;">
                Inspectors Name: <span id="insp-name">${inspection.inspectionDetails.owninguser.fullname}</span><br /><br/>
                Mobile:  <span id="insp-mobile">${inspection.inspectionDetails.owninguser.mobilephone}</span> (7:00am – 9:00pm Monday -Friday + 7:00am – 5:00pm weekends)<br /><br/>
                Office: 0291815989 (7:00am-5:00pm Monday to Friday )<br />
                Email: admin@tpi.com.au<br/>
                Website: Tpi.com.au<br/>
            </p>
            <img style="width: 40%;margin-bottom: 20px;" src="http://thepropertyinspectors.com.au/wp-content/uploads/2024/11/Signature.jpg" alt="." />
        </div>
    </div>
</body>

</html>`);
});


module.exports = myapp;