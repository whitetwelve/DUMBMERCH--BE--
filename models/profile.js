'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     static associate(models) {
      profile.belongsTo(models.user, {
        as: "Data User",
        foreignKey: {
          name: "idUser",
        },
      });
    }
  }
  profile.init({
    phone: DataTypes.STRING,
    gender: DataTypes.STRING,
    address: DataTypes.TEXT,
    idUser: DataTypes.INTEGER,
    image : DataTypes.STRING
  }, {
    sequelize,
    modelName: 'profile',
  });
  return profile;
};