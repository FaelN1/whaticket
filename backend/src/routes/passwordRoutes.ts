import express from "express";
import * as PasswordResetController from "../controllers/PasswordResetController";
import isAuth from "../middleware/isAuth";

const passwordRoutes = express.Router();

// Rota para envio de e-mails
passwordRoutes.post("/enviar-email", PasswordResetController.sendCodeVerifycation);

passwordRoutes.get("/verificar-code/:email", PasswordResetController.getVerificationData);
// Exporte as rotas

// Rota para obter todos os usuários
passwordRoutes.get("/obter-usuarios", PasswordResetController.getAllUsers);

// Rota para atualizar a senha
passwordRoutes.put("/atualizar-senha", PasswordResetController.updatePassword);

export default passwordRoutes;
