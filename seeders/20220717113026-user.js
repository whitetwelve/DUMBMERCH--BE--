'use strict';

const bcrypt = require('bcrypt')
const pw = bcrypt.hashSync('123456', 10)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

      await queryInterface.bulkInsert('users', [
        {
          "name": "admin",
          "email": "admin@mail.com",
          "password": pw,
          "status": 'admin'
        }
      ], 
    {});

  },

  down: async (queryInterface, Sequelize) => {
    /*
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
