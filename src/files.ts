import express from "express"
import multer from "multer"
const upload = multer({ dest: 'temp/' })
import UserFileModel from "./models/User_File"
import fs from "fs"
import validator from 'validator';

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
    const file = await UserFileModel.createFile(user.id, req.file.originalname, "")
    const read_stream = fs.createReadStream(req.file.destination + req.file.filename)
    minioClient.putObject(BUCKET, file.id, read_stream)
    res.status(200).send()
})
router.get("/", async (req, res) => {
    if(!req.user) return res.status(401).send({message: "not logged in"})

    const user: any = req.user
    const files = await UserFileModel.getFilesFromUser(user.id)
    let response_files: Array<any> = []
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const file_size = await getFileSize(file.id)
        response_files.push({
            id: file.id,
            user: file.user,
            name: file.file_name,
            description: file.file_description,
            size: file_size,
            created_at: file.created_at,
            updated_at: file.updated_at
        })
    }
    console.log(response_files)
    res.send(response_files)
})
router.get("/:file_id", async (req, res) => {
    if(!req.user) return res.status(401).send({message: "not logged in"})

    const user: any = req.user
    if(typeof req.query.file_id != "string" || validator.isUUID(req.query.file_id)) return res.status(400).send({message: "Invalid UUID"})
    const file = await UserFileModel.getFileById(req.query.file_id)
    if(!file) return res.status(404).send({message: "file not found"})

    const file_size = await getFileSize(file.id)

    res.send({
        id: file.id,
        user: file.user,
        name: file.file_name,
        description: file.file_description,
        size: file_size,
        created_at: file.created_at,
        updated_at: file.updated_at
    })
})

async function getFileSize(id: string) {
    let err, data = await minioClient.statObject(BUCKET, id)
    if(err) throw err
    if(!data) throw Error("File in db does not have a corresponding file in bucket")
    console.log(data.size)
    return data.size
}

module.exports = router