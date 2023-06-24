import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("users", (table) => {
        table.uuid("id").notNullable().primary();
        table.string("username").notNullable();
        table.string("hash").notNullable();
        table.string("salt").notNullable();
        table.string("email").notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("users")
}

