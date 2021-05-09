let Sequelize = require('sequelize');

let sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

const db = {
  Paragraph: sequelize.define('paragraph', {
    id: {
      type: Sequelize.DataTypes.UUID,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.DataTypes.STRING,
      field: 'name',
      allowNull: false,
      unique: true,
    },
    numSentences: {
      type: Sequelize.DataTypes.INTEGER,
      field: 'num_sentences',
      allowNull: false,
    },
    complete: {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'complete',
      allowNull: false,
    },
    sentences: {
      type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.TEXT),
      defaultValue: [],
    },
  })
};

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;