import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("files", table => {
        table.dropColumn("file_size")
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable("files", table => {
        table.bigint("file_size")
    })
}

