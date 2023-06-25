import { UUID } from "crypto";

import { Model, ModelObject } from "objection";

class User_File extends Model {
    id!: UUID
    user!: UUID
    file_size!: bigint
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

    static get jsonSchema() {
        return {
            type: "object",
            required: ["user", "file_size", "file_name", "file_description"],
            propreties: {
                id: {type: "string"},
                user: {type: "string"},
                file_size: {type: "bigint"},
                file_name: {type: "string"},
                file_description: {type: "string"},
                created_at: {type: "string"},
                updated_at: {type: "string"},
            }
        }
    }
}

export type fileShape = ModelObject<User_File>