import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "allowGroup", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }),
    queryInterface.addColumn("Users", "defaultTheme", {
      type: DataTypes.STRING,
      defaultValue: "light",
      allowNull: false
    }),
    queryInterface.addColumn("Users", "defaultMenu", {
      type: DataTypes.STRING,
      defaultValue: "closed",
      allowNull: false
    }),
    queryInterface.addColumn("Users", "language", {
      type: DataTypes.STRING,
      defaultValue: "pt-BR",
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "allowGroup"),
      queryInterface.removeColumn("Users", "defaultTheme"),
      queryInterface.removeColumn("Users", "defaultMenu"),
      queryInterface.removeColumn("Users", "language"),
    ])
  }
};