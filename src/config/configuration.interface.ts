import knex from 'knex';

export interface ConfigurationInterface {
  port: number;
  knex: knex.QueryBuilder;
}
