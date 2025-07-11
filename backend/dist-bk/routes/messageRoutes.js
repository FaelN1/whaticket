"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const upload_1 = __importDefault(require("../config/upload"));
const MessageController = __importStar(require("../controllers/MessageController"));
const messageRoutes = (0, express_1.Router)();
const upload = (0, multer_1.default)(upload_1.default);
messageRoutes.get("/messages/:ticketId", isAuth_1.default, MessageController.index);
messageRoutes.post("/messages/:ticketId", isAuth_1.default, upload.array("medias"), MessageController.store);
// messageRoutes.post("/forwardmessage",isAuth,MessageController.forwardmessage);
messageRoutes.delete("/messages/:messageId", isAuth_1.default, MessageController.remove);
messageRoutes.post("/messages/edit/:messageId", isAuth_1.default, MessageController.edit);
messageRoutes.get("/messages-allMe", isAuth_1.default, MessageController.allMe);
// Nova rota para transcrição
messageRoutes.get("/messages/transcribeAudio/:fileName", isAuth_1.default, MessageController.transcribeAudioMessage);
// Rota para adicionar uma reação a uma mensagem
messageRoutes.post('/messages/:messageId/reactions', isAuth_1.default, MessageController.addReaction);
messageRoutes.post('/message/forward', isAuth_1.default, MessageController.forwardMessage);
// Adicionando novas rotas para novas funções
messageRoutes.post("/messages/lista/:ticketId", isAuth_1.default, MessageController.sendListMessage);
messageRoutes.post("/messages/copy/:ticketId", isAuth_1.default, MessageController.sendCopyMessage);
messageRoutes.post("/messages/call/:ticketId", isAuth_1.default, MessageController.sendCALLMessage);
messageRoutes.post("/messages/url/:ticketId", isAuth_1.default, MessageController.sendURLMessage);
messageRoutes.post("/messages/PIX/:ticketId", isAuth_1.default, MessageController.sendPIXMessage);
exports.default = messageRoutes;
