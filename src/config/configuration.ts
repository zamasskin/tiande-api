import knex from 'knex';
import { ConfigurationInterface } from './configuration.interface';

export default (): ConfigurationInterface => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  knex: knex({
    client: 'mysql2',
    connection: {
      host: process.env.DATABASE_HOST || '127.0.0.1',
      port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASS,
      database: process.env.DATABASE_NAME,
      pool: {
        min: parseInt(process.env.DATABASE_MIN_CONNECTIONS, 10) || 0,
        max: parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10) || 12,
      },
    },
  }),
});
