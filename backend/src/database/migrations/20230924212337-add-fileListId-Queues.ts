import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Queues", "fileListId", {
      type: DataTypes.INTEGER,
      references: { model: "Files", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Queues", "fileListId")
  }
};