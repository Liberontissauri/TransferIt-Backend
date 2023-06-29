import { UUID } from "crypto";

import { Model, ModelObject } from "objection";

export default class UserFileModel extends Model {
    id!: UUID
    user!: UUID
    file_name!: string
    file_description!: string
    created_at!: string
    updated_at!: string

    static get tableName() {
        return "files"
    }
    static get idColumn() {
        return 'id';
    }

    static async createFile(user: UUID, file_name: string, file_description: string) {
        return this.query().insert({
            user, file_name, file_description
        }).returning("id")
    }

    static async getFileById(id: UUID) {
        const file = await this.query().findById(id)
        return file
    }

    static async getFilesFromUser(user_id: UUID) {
        const files = await this.query().where("user", "=", user_id)
        return files
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["user", "file_name", "file_description"],
            properties: {
                id: {type: "string"},
                user: {type: "string"},
                file_name: {type: "string"},
                file_description: {type: "string"},
                created_at: {type: "string"},
                updated_at: {type: "string"},
            }
        }
    }
}

export type fileShape = ModelObject<UserFileModel>