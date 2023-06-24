import { Knex } from "knex";

const MEGABYTE_SIZE = 8000000

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("users", table => {
        table.timestamps(true, true)
        table.bigint("storage_limit").unsigned().notNullable().defaultTo(250 * MEGABYTE_SIZE)
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable("users", table => {
        table.dropColumn("created_at")
        table.dropColumn("updated_at")
        table.dropColumn("storage_limit")
    })
}

