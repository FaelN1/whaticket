import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn('Contacts', 'profilePicUrl', {
      type: DataTypes.TEXT,
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn('Contacts', 'profilePicUrl', {
      type: DataTypes.STRING,
    })
  }
};

