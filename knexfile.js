import 'dotenv/config';
// Update with your config settings.

const configuration = {
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        charset: 'utf8',
    },
    migrations: {
        directory: './migrations',
    },
    seeds: {
        directory: './seeds',
    },
};

export default configuration;