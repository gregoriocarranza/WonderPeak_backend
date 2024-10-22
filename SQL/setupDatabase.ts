import { KnexConnection } from './Connection';
require('dotenv').config();

const knexInstance = new KnexConnection().knex;

(async () => {
  try {
    let tableExists = await knexInstance.schema.hasTable('user');
    if (!tableExists) {
      await knexInstance.schema.createTable('user', (table) => {
        table.increments('id').primary();
        table.string('user_uuid').unique();
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
        table.timestamp('created_at').defaultTo(knexInstance.fn.now());
        table.timestamp('updated_at').defaultTo(knexInstance.fn.now());
      });
      console.log('User table created successfully.');
    } else {
      console.log('Table USER already exists.');
    }
  } catch (error) {
    console.error('Error managing the user table:', error);
  } finally {
    knexInstance.destroy();
  }
})();
