import { backupcredentials } from "./credentials/backup_credentials.mjs";
import cloudinary from "cloudinary";
import fs from "fs";
import { encryptData,decryptData } from "./EncryptionModule.mjs";
import axios from "axios";

// ----------------DEFINE MODULES & CONFIGURATION ---------------
const cloudinaryModule = cloudinary.v2;
cloudinaryModule.config(backupcredentials());


// ---------------- BACKUP MODULE ---------------
const backupModule=async(data={})=>{
    try{
    const payloadParams={encrypted_db_dump:encryptData(data).encryptedData,iv:encryptData(data).iv};
    fs.writeFileSync('backup.json', JSON.stringify(payloadParams), 'utf8');
    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload('backup.json', {
      resource_type: 'raw', 
      folder: 'mile83autos_backups',
      public_id: 'monthly_backup',
      overwrite: true          
    });
    if(result.secure_url){
        fs.unlinkSync('backup.json');
        console.log("Backup uploaded successfully:", result.secure_url);
        return true;
    }
    else{
        fs.unlinkSync('backup.json');
        return false;
    }
    }
    catch(error){
        console.log("Backup Module Error:", error.message);
        return false;
    }
}



//  function to get data from database;
const callDatabaseData=async(EnvironmentType="development")=>{
    try{
        console.log("Please wait, fetching data from database... [+]");
        const ENDPOINT_SERIAL_CODE="mirror_984894nhurjbvr@33893489384nd";
        const BACKUP_PAYLOAD={
            users_data:{},
            electronics_data:{},
            car_data:{},
            leads_data:{},
            customers_data:{},
            sales_affiliate_data:{}
        }
        // @ Define Backend Endpoints
        const API_ENDPOINTS={
            car_endpoint: EnvironmentType==="development" ? "http://localhost:5000/api/v1/listAllProduct" : "https://mile83autos-api-backend-1.onrender.com/api/v1/listAllProduct",
            electronics_endpoint:EnvironmentType==="development" ? "http://localhost:5000/api/v1/getAllElectronicProduct" : "https://mile83autos-api-backend-1.onrender.com/api/v1/getAllElectronicProduct",
            sales_affiliate_marketing_endpoint:EnvironmentType==="development" ? "http://localhost:5000/api/v1/getAllSalesAgent" : "https://mile83autos-api-backend-1.onrender.com/api/v1/getAllSalesAgent",
            leads_endpoint:EnvironmentType==="development" ? "http://localhost:5000/api/v1/getAllLeads" : "https://mile83autos-api-backend-1.onrender.com/api/v1/getAllLeads",
            customers_endpoint:EnvironmentType==="development" ? "http://localhost:5000/api/v1/getAllCustomer" : "https://mile83autos-api-backend-1.onrender.com/api/v1/getAllCustomer",
            users_endpoint:EnvironmentType==="development" ? "http://localhost:5000/api/v1/getAllUsers" : "https://mile83autos-api-backend-1.onrender.com/api/v1/getAllUsers"
        }
        const response = await Promise.all([
            axios.get(API_ENDPOINTS.car_endpoint),
            axios.get(API_ENDPOINTS.electronics_endpoint),
            axios.get(API_ENDPOINTS.sales_affiliate_marketing_endpoint,{
                headers:{
                    "serial_code":ENDPOINT_SERIAL_CODE,
                    "Content-Type": "application/json",
                }
            }),
            axios.get(API_ENDPOINTS.leads_endpoint, {
                headers:{
                    "serial_code":ENDPOINT_SERIAL_CODE
                }
            }),
            axios.get(API_ENDPOINTS.customers_endpoint, {
                headers:{
                    "serial_code":ENDPOINT_SERIAL_CODE
                }
            }),
            axios.get(API_ENDPOINTS.users_endpoint, {
                headers:{
                    "serial_code":ENDPOINT_SERIAL_CODE
                }
            })
        ]);
        BACKUP_PAYLOAD.car_data=await(response[0]).data || {};  
        BACKUP_PAYLOAD.electronics_data=await(response[1]).data || {};  
        BACKUP_PAYLOAD.sales_affiliate_data=await(response[2]).data.data|| {};
        BACKUP_PAYLOAD.leads_data=await(response[3]).data || {};  
        BACKUP_PAYLOAD.customers_data=await(response[4]).data || {};  
        BACKUP_PAYLOAD.users_data=await(response[5]).data || {};
        const StringifyData = JSON.stringify(BACKUP_PAYLOAD,null,3);
        return StringifyData  
    }
    catch(error){
        console.log("Call Database Data Error:", error);
    }
}

export {backupModule, callDatabaseData}



// test callDatabaseData function ;
// (async()=>{
//     const databaseData=await callDatabaseData("development");
//     console.log("Database Data:",databaseData);
// })();