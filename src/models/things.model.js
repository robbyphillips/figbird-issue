// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
const { Model } = require('objection');

class Things extends Model {
  static get tableName() {
    return 'things';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['text'],

      properties: {
        text: { type: 'string' },
      },
    };
  }

  $beforeInsert() {
    this.createdAt = this.updatedAt = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = function (app) {
  const db = app.get('knex');

  db.schema
    .hasTable('things')
    .then((exists) => {
      if (!exists) {
        db.schema
          .createTable('things', (table) => {
            table.increments('id');
            table.string('text');
            table.timestamp('createdAt');
            table.timestamp('updatedAt');
          })
          .then(() => console.log('Created things table')) // eslint-disable-line no-console
          .catch((e) => console.error('Error creating things table', e)); // eslint-disable-line no-console
      }
    })
    .then(() => db('things').del())
    .then(() =>
      db('things').insert([
        { text: 'this a thing that has the number one spelled out' },
        { text: 'this thing has number two' },
        { text: 'a third thing has the number three' },
      ])
    )
    .catch((e) => console.error('Error creating things table', e)); // eslint-disable-line no-console

  return Things;
};
