/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('messages', (table) => {
        table.increments('id').primary();
        table
            .integer("user_id")
            .unsigned()
            .notNullable()
            .references("users.id")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
        table
            .integer("room_id")
            .unsigned()
            .notNullable()
            .references("rooms.id")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
        table.string('content').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    }).then(() => {
        return knex.raw('ALTER TABLE messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTable('messages');
};
