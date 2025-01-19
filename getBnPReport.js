const msal = require("@azure/msal-node");
const { default: axios, options } = require("axios");
const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");



const getToken = function(){
  let acc_token = "";
  console.log("Trying to get a new token..");
  //config parameters..
  const msalconfig = {
    auth:{
      clientId:"7b5db71f-f402-45f4-b693-838a5f19b32b",
      authority:"https://login.microsoftonline.com/765bb9c7-c916-4c22-8206-591682876419",
      clientSecret:"ZKK8Q~4DLqRxKIqL4lv1Pf1lhXZCGZOJDBA1BbOZ",
      tenantId:"765bb9c7-c916-4c22-8206-591682876419",
      Audience: '7b5db71f-f402-45f4-b693-838a5f19b32b'
    },
    cache:{
      cacheLocation: "localStorage",  // "sessionStorage" is also an option
      storeAuthStateInCookie: false,  // Optional, set to true for IE11 support
    }
  }
  //initialize the deamon
  const cca = new msal.ConfidentialClientApplication(msalconfig);
  const tokenRequest = {
    scopes:[
      'https://tpi.api.crm6.dynamics.com/.default',
      //'https://graph.microsoft.com/.default'
    ],
  };
  try{
  cca.acquireTokenByClientCredential(tokenRequest).then((response)=>{
    acc_token = response;
    //console.log(response);
  }).catch((err)=>{
    console.error(err);
  })
  }catch(err){
    console.log(err);
  }finally{
    return new Promise(resolve=>{
      setTimeout(function(){
        resolve(acc_token.accessToken);
    },500);
    });
  }
  
}


const mydataasync = function (odata_url,accessToken){
  let dataval = "";
  console.log("running Query");
  try{
    fetch(odata_url,{
      headers: {
        Authorization: 'Bearer '+accessToken,
        
      }
    }).then((data)=>{
      //data.json().then(dat=>console.log(dat))
      data.json().then((dat)=>{
          dataval = dat;
      });
    }).catch((err)=>{
      //res.send(err);
      console.log(err);
    })
  }catch(err){
     console.log(response);
    fetch(odata_url,{
      headers: {
        Authorization: 'Bearer '+accessToken,
        
      }
    }).then((data)=>{
      //data.json().then(dat=>console.log(dat))
      data.json().then((dat)=>{
          dataval = dat;
      });
    }).catch((err)=>{
      //res.send(err);
      console.log(err);
    })
  }finally{
    
    return new Promise(resolve=>{
    setTimeout(function(){
         resolve(dataval);
     },10000);
    
    });
  }

}


//convert base64 images to webp..
const Convert_to_Webp = async function(base64_image_array){
  const images = await Promise.all(base64_image_array.map( async (image)=>{
    await sharp(Buffer.from(image.documentbody, 'base64')).resize(400).webp().toFile(`ReportImages/${image.annotationid}.webp`);
  }));
  return images;
}



async function emptyFolder(folderPath) {
  try {
    // Read the contents of the folder
    const files = await fs.readdir(folderPath);
    //console.log(files);
    // Loop over each file and delete it
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        // If the item is a directory, recursively delete its contents
        await emptyFolder(filePath);  // Recursively empty subdirectory
        await fs.rmdir(filePath);     // Then remove the subdirectory itself
      } else {
        // If the item is a file, delete it
        await fs.unlink(filePath);
      }
    }

    console.log(`Folder ${folderPath} is now empty.`);
  } catch (error) {
    console.error('Error while emptying folder:', error);
  }
}



//getToken();




module.exports ={
  mydataasync,
  getToken,
  Convert_to_Webp,
  emptyFolder
} 




