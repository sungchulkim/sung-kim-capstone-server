/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('rooms', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
    }).then(() => {
        return knex.raw('ALTER TABLE rooms CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTable('rooms');
};