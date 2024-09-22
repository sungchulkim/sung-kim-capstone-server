/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable('reactions', (table) => {
        table.increments('id').primary();
        table
            .integer('message_id')
            .unsigned()
            .notNullable()
            .references("messages.id")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
        table
            .integer("user_id")
            .unsigned()
            .notNullable()
            .references("users.id")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
        table.string('emoji', 191).notNullable(); // Remove charset here
    }).then(() => {
        return knex.raw('ALTER TABLE reactions MODIFY emoji VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTable('reactions');
};
