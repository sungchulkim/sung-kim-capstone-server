/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
    // Deletes ALL existing entries
    await knex("rooms").del();
    await knex("rooms").insert([
        {
            id: 1,
            name: "General",
        }
    ]);
}