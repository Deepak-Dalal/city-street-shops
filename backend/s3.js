import fs from'fs';
import sharp from 'sharp';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import chalk from 'chalk';
dotenv.config();

const bucketName=process.env.AWS_BUCKET_NAME;
const region=process.env.AWS_BUCKET_REGION;
const accessKeyId=process.env.AWS_ACCESS_KEY;
const secretAccessKey=process.env.AWS_SECRET_KEY;

const s3=new AWS.S3({
    region,
    accessKeyId,
    secretAccessKey
});

//uploads a file to s3
export const uploadFile=async (file)=>{
    var filename=file.filename;
    var ext = filename.substring(filename.indexOf('.')+1);
    var compressedFile;
    if(ext==='png'){
        compressedFile=await sharp(file.path).png({
        quality: 50,
        chromaSubsampling: '4:4:4'
        });
    }
    else{
        compressedFile=await sharp(file.path).jpeg({
        quality: 50,
        chromaSubsampling: '4:4:4'
        });
    }
    //const fileStream=fs.createReadStream(file.path);
    const uploadParams={
        Bucket:bucketName,
        Body:compressedFile,
        Key:file.filename
    }
    return s3.upload(uploadParams).promise();
}

// downloads a file from s3
export const getFileStream=(fileKey)=> {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    };

    return s3.getObject(downloadParams);
}

//delete a file from s3
export const deleteFileFromS3 = (fileKey) => {
    const params = {
        Bucket: bucketName, // pass your bucket name
        Key: fileKey, // file will be saved as testBucket/contacts.csv
    };
    s3.deleteObject(params, function(err, data) {
        if (err) 
        console.log(err, err.stack);  // error
        else    
        console.log(chalk.green("File Successfully Deleted!"));
    });
};