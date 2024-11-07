import { KnexConnection } from './Connection';
require('dotenv').config();

const knexInstance = new KnexConnection().knex;

(async () => {
  try {
    //----------- Tabla de usuario  -----------

    let tableExists = await knexInstance.schema.hasTable('user');
    if (!tableExists) {
      await knexInstance.schema.createTable('user', (table) => {
        table.increments('id').primary();
        table.string('user_uuid').unique().notNullable();
        table.string('name');
        table.string('lastname');
        table.string('email').unique();
        table.string('nickname').defaultTo('Anonymous');
        table.string('profile_image').defaultTo(null);
        // .defaultTo(`http://localhost:${process.env.PORT}/profileImgs/defaultProfileImage.jpg);
        table.string('cover_image').defaultTo(null);
        // .defaultTo(`http://localhost:${process.env.PORT}/profileImgs/defaultCoverImage.jpg`);
        table.text('description');
        table.string('gender');
        table.integer('gamification_level').defaultTo(1);
        table.boolean('active').defaultTo(true);
        table.string('auth0_id');
        table.timestamp('created_at').defaultTo(knexInstance.fn.now());
        table.timestamp('updated_at').defaultTo(knexInstance.fn.now());
      });
      console.log('User table created successfully.');
    } else {
      console.log('Table USER already exists.');
    }

    //----------- Tabla de seguimiento  -----------

    tableExists = await knexInstance.schema.hasTable('follower');
    if (!tableExists) {
      await knexInstance.schema.createTable('follower', (table) => {
        table.increments('id').primary();
        table
          .string('follower_uuid')
          .references('user_uuid')
          .inTable('user')
          .onDelete('CASCADE')
          .withKeyName('fk_follower_user');
        table
          .string('followed_uuid')
          .references('user_uuid')
          .inTable('user')
          .onDelete('CASCADE')
          .withKeyName('fk_followed_user');
        table.timestamp('created_at').defaultTo(knexInstance.fn.now());
        table.timestamp('updated_at').defaultTo(knexInstance.fn.now());
      });
      console.log('following/followers table created successfully.');
    } else {
      console.log('Table following/followers already exists.');
    }
  } catch (error) {
    console.error('Error managing the tables:', error);
  } finally {
    knexInstance.destroy();
  }
})();
