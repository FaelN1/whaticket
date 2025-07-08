"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Tickets", "position", {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Tickets", "position");
    }
};
