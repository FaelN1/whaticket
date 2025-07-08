import express from "express";
import isAuth from "../middleware/isAuth";

import * as TagPositionController from "../controllers/TagPositionController";

const tagPositionRoutes = express.Router();

// Rota para atualizar a posição de uma Lane
tagPositionRoutes.put("/tags/:tagId/position", isAuth, TagPositionController.updatePosition);

export default tagPositionRoutes;
