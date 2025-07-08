"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePosition = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const TagPositionService_1 = __importDefault(require("../services/TagServices/TagPositionService"));
/**
 * Controlador para gerenciar a posição das Lanes no Kanban
 * Este controlador foi criado como uma extensão sem modificar os arquivos originais
 */
const updatePosition = async (req, res) => {
    // Verifica se o usuário tem permissão (apenas admin pode modificar lanes do kanban)
    if (req.user.profile !== "admin") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { tagId } = req.params;
    const { position } = req.body;
    const { companyId } = req.user;
    // Converte position para número
    const positionNumber = parseInt(position);
    // Valida se position é um número entre 0 e 15
    if (isNaN(positionNumber) || positionNumber < 0 || positionNumber > 15) {
        throw new AppError_1.default("Position must be a number between 0 and 15", 400);
    }
    // Atualiza a posição da tag
    const tag = await (0, TagPositionService_1.default)({
        id: tagId,
        position: positionNumber,
        companyId
    });
    return res.status(200).json(tag);
};
exports.updatePosition = updatePosition;
