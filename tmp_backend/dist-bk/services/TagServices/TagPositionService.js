"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ShowService_1 = __importDefault(require("./ShowService"));
const socket_1 = require("../../libs/socket");
/**
 * Serviço para atualizar a posição de uma Lane no Kanban
 * Este serviço foi criado como uma extensão sem modificar os arquivos originais
 */
const TagPositionService = async ({ id, position, companyId }) => {
    // Validação da posição (0-15)
    if (position < 0 || position > 15) {
        position = 0; // Valor padrão caso esteja fora do intervalo
    }
    // Busca a tag pelo ID
    const tag = await (0, ShowService_1.default)(id);
    // Atualiza apenas a posição
    await tag.update({
        position
    });
    // Recarrega a tag para obter os dados atualizados
    await tag.reload();
    // Emite evento via socket para atualização em tempo real
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company${companyId}-tag`, {
        action: "update",
        tag
    });
    return tag;
};
exports.default = TagPositionService;
