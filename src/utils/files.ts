import { User_File } from "../schemas/file";
import minioClient from "../db/minio_init";
import Minio from "minio";
const BUCKET = "transferit-files"

export function getStorageFromFileList(file_list: Array<User_File>) {
    let used_storage = 0
    file_list.forEach(file => {
        const metadata = minioClient.statObject(BUCKET, file.id, (err: Error | null, data: Minio.BucketItemStat) => {
            if(err) throw err
            const file_size = data.size
            if(!file_size) throw Error("File in db does not have a corresponding file in bucket")
            used_storage += file_size
        })
    })
    return used_storage
}