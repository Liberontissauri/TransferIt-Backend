import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("files", table => {
        table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary()
        table.uuid("user").unsigned().index().references("id").inTable("users")
        table.timestamps(true, true)
        table.bigint("file_size")
        table.string("file_name")
        table.text("file_description")
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("files")
}

