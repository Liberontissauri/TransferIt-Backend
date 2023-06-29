import express from "express"
import multer from "multer"
const upload = multer({ dest: 'temp/' })
import S3 from 'aws-sdk/clients/s3'
import UserFileModel from "./models/User_File"
import fs from "fs"

import Minio from "minio";
const _minio = require("minio");

if (!process.env["MINIO_CLIENT"]) throw Error("Please Define MINIO_CLIENT in your .env")
if (!process.env["MINIO_SECRET"]) throw Error("Please Define MINIO_SECRET in your .env")
if (!process.env["MINIO_ENDPOINT"]) throw Error("Please Define MINIO_ENDPOINT in your .env")
if (!process.env["MINIO_USE_SSL"]) throw Error("Please Define MINIO_USE_SSL in your .env")

let USE_SSL
if (process.env["MINIO_USE_SSL"] == "false") {
    USE_SSL = false
}
else {
    USE_SSL = true
}

const minioClient: Minio.Client = new _minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: USE_SSL,
    accessKey: process.env["MINIO_CLIENT"],
    secretKey: process.env["MINIO_SECRET"]
});

const BUCKET = "transferit-files"

const router = express.Router()

router.post("/upload", upload.single("file"), async (req, res) => {
    if(!req.user) return res.status(401).send({message: "not logged in"})
    if(!req.file) return res.status(400).send({message: "no file uploaded"})

    const user: any = req.user

    const files = await UserFileModel.getFilesFromUser(user.id)
    let used_storage = 0
    files.forEach(file => {
        const metadata = minioClient.statObject(BUCKET, file.id, (err: Error | null, data: Minio.BucketItemStat) => {
            if(err) throw err
            const file_size = data.size
            if(!file_size) throw Error("File in db does not have a corresponding file in bucket")
            used_storage += file_size
        })
    })
    if (used_storage + req.file.size > user.storage_limit) return res.status(400).send({message: "upload exceeds storage limit"})
    
    const file = await UserFileModel.createFile(user.id, req.file.filename, "")
    const read_stream = fs.createReadStream(req.file.destination + req.file.filename)
    minioClient.putObject(BUCKET, file.id, read_stream)
    res.status(200).send()
})

module.exports = router