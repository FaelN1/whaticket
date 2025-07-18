"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Users", "wpp", {
            type: sequelize_1.DataTypes.STRING,
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Users", "wpp");
    }
};
