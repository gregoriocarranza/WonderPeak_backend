import { knex, Knex } from 'knex';

export class KnexConnection {
  private static instance: any;
  public knex!: Knex<any, unknown[]>;
  constructor() {
    if (typeof KnexConnection.instance === 'object') {
      return KnexConnection.instance;
    }
    const config: Knex.Config = {
      client: process.env.SQL_CLIENT,
      connection: {
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        charset: 'utf8mb4',
        // @ts-ignore
        port: process.env.SQL_DB_PORT || 3306,
      },
      pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 10000,
        reapIntervalMillis: 5000,
      },
      acquireConnectionTimeout: 30000,
    };
    this.knex = knex(config);
    console.info(`SQL Connection established - ENV ${process.env.ENVIRONMENT}`);
    KnexConnection.instance = this;
    return this;
  }
}
