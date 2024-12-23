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
        table
          .string('profile_image')
          .defaultTo(
            'https://res.cloudinary.com/cloudinary0gregorio/image/upload/v1731628197/WonderPeak_Posts/default-profile-image.jpg'
          );
        table
          .string('cover_image')
          .defaultTo(
            'https://res.cloudinary.com/cloudinary0gregorio/image/upload/v1731628197/WonderPeak_Posts/default-profile-image.jpg'
          );
        table.text('description');
        table.string('gender');
        table.integer('gamification_level').defaultTo(1);
        table.boolean('active').defaultTo(true);
        table.string('auth0_id');
        table.string('push_token').defaultTo(null);
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
        table.boolean('favorite').defaultTo(false);
        table.timestamp('created_at').defaultTo(knexInstance.fn.now());
        table.timestamp('updated_at').defaultTo(knexInstance.fn.now());
      });
      console.log('following/followers table created successfully.');
    } else {
      console.log('Table following/followers already exists.');
    }

    //----------- Tabla de posteos  -----------

    tableExists = await knexInstance.schema.hasTable('posts');
    if (!tableExists) {
      await knexInstance.schema.createTable('posts', (table) => {
        table.increments('id').primary();
        table.string('post_uuid').unique().notNullable();
        table
          .string('user_uuid')
          .references('user_uuid')
          .inTable('user')
          .onDelete('CASCADE')
          .withKeyName('fk_user_post');
        table.string('title').notNullable();
        table.text('text').defaultTo('');
        table.string('place_holder').defaultTo(null);
        table.float('latitude').defaultTo(null);
        table.float('longitude').defaultTo(null);
        table.text('mapsUrl').defaultTo(null);
        table.text('multimedia_url').defaultTo(null);
        table.text('media_type').defaultTo('image');
        table.integer('comment_count').defaultTo(0);
        table.integer('likes_count').defaultTo(0);
        table.timestamp('created_at').defaultTo(knexInstance.fn.now());
        table.timestamp('updated_at').defaultTo(knexInstance.fn.now());
      });
      console.log('Table posts created successfully.');
    } else {
      console.log('Table posts already exists.');
    }

    //----------- Tabla de comentarios  -----------
    tableExists = await knexInstance.schema.hasTable('comments');
    if (!tableExists) {
      await knexInstance.schema.createTable('comments', (table) => {
        table.increments('id').primary();
        table.string('comment_uuid').unique().notNullable();
        table
          .string('user_uuid')
          .references('user_uuid')
          .inTable('user')
          .onDelete('CASCADE')
          .withKeyName('fk_comments_user');
        table
          .string('post_uuid')
          .references('post_uuid')
          .inTable('posts')
          .onDelete('CASCADE')
          .withKeyName('fk_comments_post');
        table.text('text').notNullable();
        table.timestamp('created_at').defaultTo(knexInstance.fn.now());
        table.timestamp('updated_at').defaultTo(knexInstance.fn.now());
      });
      console.log('Table comments created successfully.');
    } else {
      console.log('Table comments already exists.');
    }

    //----------- Tabla de Likes  -----------

    tableExists = await knexInstance.schema.hasTable('likes');
    if (!tableExists) {
      await knexInstance.schema.createTable('likes', (table) => {
        table.increments('id').primary();
        table
          .string('user_uuid')
          .references('user_uuid')
          .inTable('user')
          .onDelete('CASCADE')
          .withKeyName('fk_likes_user');
        table
          .string('post_uuid')
          .references('post_uuid')
          .inTable('posts')
          .onDelete('CASCADE')
          .withKeyName('fk_likes_post');
        table.timestamp('created_at').defaultTo(knexInstance.fn.now());
        table.timestamp('updated_at').defaultTo(knexInstance.fn.now());
      });
      console.log('likes table created successfully.');
    } else {
      console.log('Table likes already exists.');
    }

    //----------- Tabla de Favorites  -----------

    tableExists = await knexInstance.schema.hasTable('favorites');
    if (!tableExists) {
      await knexInstance.schema.createTable('favorites', (table) => {
        table.increments('id').primary();
        table
          .string('user_uuid')
          .references('user_uuid')
          .inTable('user')
          .onDelete('CASCADE')
          .withKeyName('fk_favorites_user');
        table
          .string('post_uuid')
          .references('post_uuid')
          .inTable('posts')
          .onDelete('CASCADE')
          .withKeyName('fk_favorites_post');
        table.timestamp('created_at').defaultTo(knexInstance.fn.now());
        table.timestamp('updated_at').defaultTo(knexInstance.fn.now());
      });
      console.log('favorites table created successfully.');
    } else {
      console.log('Table favorites already exists.');
    }
  } catch (error) {
    console.error('Error managing the tables:', error);
  } finally {
    knexInstance.destroy();
  }
})();
