import express from "express"
import multer from "multer"
const upload = multer({ dest: 'temp/' })
import UserFileModel from "./models/User_File"
import fs from "fs"
import validator from 'validator';

const BUCKET = "transferit-files"
import minioClient from "./db/minio_init"
import { getStorageFromFileList } from "./utils/files"

// Routes

const router = express.Router()

router.post("/upload", upload.single("file"), async (req, res) => {
    if(!req.user) return res.status(401).send({message: "not logged in"})
    if(!req.file) return res.status(400).send({message: "no file uploaded"})

    const user: any = req.user

    const files = await UserFileModel.getFilesFromUser(user.id)
    let used_storage = await getStorageFromFileList(files)

    if (used_storage + req.file.size > user.storage_limit) return res.status(400).send({message: "upload exceeds storage limit"})
    const file = await UserFileModel.createFile(user.id, req.file.originalname, "")
    const read_stream = fs.createReadStream(req.file.destination + req.file.filename)
    minioClient.putObject(BUCKET, file.id, read_stream)
    res.status(302).redirect("/dashboard")
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

// General Functions

async function getFileSize(id: string) {
    let err, data = await minioClient.statObject(BUCKET, id)
    if(err) throw err
    if(!data) throw Error("File in db does not have a corresponding file in bucket")
    return data.size
}

module.exports = router