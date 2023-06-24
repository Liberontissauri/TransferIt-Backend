import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').alterTable("users", (table) =>{
        table.dropPrimary()
        table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary().alter({alterNullable: false})
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable("users", (table) =>{
        table.dropPrimary()
        table.uuid("id").primary().alter({alterNullable: false})
        // This option should be very well documented on the alter method docs cause I just spent an hour trying to figuring out why it wasn't working...
    })
}

