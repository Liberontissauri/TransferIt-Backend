import logger from "../logs"
import Minio from "minio";
const _minio = require("minio");

// Config

if (!process.env["MINIO_CLIENT"]) throw Error("Please Define MINIO_CLIENT in your .env")
if (!process.env["MINIO_SECRET"]) throw Error("Please Define MINIO_SECRET in your .env")
if (!process.env["MINIO_ENDPOINT"]) throw Error("Please Define MINIO_ENDPOINT in your .env")
if (!process.env["MINIO_USE_SSL"]) throw Error("Please Define MINIO_USE_SSL in your .env")

let USE_SSL = true
if (process.env["MINIO_USE_SSL"] == "false") USE_SSL = false

const minioClient: Minio.Client = new _minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: USE_SSL,
    accessKey: process.env["MINIO_CLIENT"],
    secretKey: process.env["MINIO_SECRET"]
});
logger.info("Bucket Initialized")

export default minioClient