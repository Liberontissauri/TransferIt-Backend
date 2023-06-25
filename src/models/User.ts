import { UUID } from "crypto";
import { Model, ModelObject } from "objection";

export default class UserModel extends Model implements UserShape {
    id!: UUID
    username!: string
    hash!: string
    email!: string
    storage_limit!: bigint
    created_at!: string
    updated_at!: string

    static get tableName() {
        return "users"
    }

    static async createUser(username: string, hash: string, email: string) {
        this.query().insert({
            username, hash, email
        }).then()
    }

    static async getUserById(id: UUID) {
        const user = await this.query().findById(id)
        return user
    }
    static async getUserByUsername(username: string) {
        const user = await this.query().findOne({username: username})
        return user
    }
    static async getUserByEmail(email: string) {
        const user = await this.query().findOne({email: email})
        return user
    }
    
    static get jsonSchema() {
        return {
            type: "object",
            required: ["username", "hash", "email"],
            properties: {
                id: {type: "string"},
                username: {type: "string"},
                hash: {type: "string"},
                email: {type: "string"},
                storage_limit: {type: "bigInt"},
                created_at: {type: "string"},
                updated_at: {type: "string"},
            }
        }
    }
}

export type UserShape = ModelObject<UserModel>

