"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const logger_1 = __importDefault(require("../utils/logger"));
const readdir = (0, util_1.promisify)(fs_1.default.readdir);
const stat = (0, util_1.promisify)(fs_1.default.stat);
const unlink = (0, util_1.promisify)(fs_1.default.unlink);
// Função para limpar arquivos de cache mais antigos que o tempo especificado
async function cleanCacheFiles(directory, maxAgeHours = 24) {
    try {
        // Verificar se o diretório existe
        if (!fs_1.default.existsSync(directory)) {
            logger_1.default.info(`Diretório de cache não encontrado: ${directory}`);
            return;
        }
        const now = new Date().getTime();
        const files = await readdir(directory);
        let deletedCount = 0;
        let totalSize = 0;
        for (const file of files) {
            const filePath = path_1.default.join(directory, file);
            try {
                // Ignorar diretórios
                const stats = await stat(filePath);
                if (stats.isDirectory())
                    continue;
                // Verificar idade do arquivo
                const fileAge = now - stats.mtime.getTime();
                const fileAgeHours = fileAge / (1000 * 60 * 60);
                // Se o arquivo for mais antigo que o limite, excluir
                if (fileAgeHours > maxAgeHours) {
                    totalSize += stats.size;
                    await unlink(filePath);
                    deletedCount++;
                }
            }
            catch (err) {
                logger_1.default.error(`Erro ao processar arquivo ${filePath}: ${err}`);
            }
        }
        // Converter bytes para MB para o log
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        logger_1.default.info(`Limpeza de cache concluída: ${deletedCount} arquivos removidos (${totalSizeMB} MB)`);
    }
    catch (err) {
        logger_1.default.error(`Erro ao limpar cache: ${err}`);
    }
}
exports.default = {
    key: `${process.env.DB_NAME}-cleanCache`,
    async handle({ data }) {
        try {
            logger_1.default.info("Iniciando limpeza de cache...");
            // Diretórios de cache a serem limpos
            const publicUploadsDir = path_1.default.resolve(__dirname, '..', '..', 'public', 'uploads');
            const tempDir = path_1.default.resolve(__dirname, '..', '..', 'temp');
            // Limpar diretório de uploads (arquivos mais antigos que 24 horas)
            await cleanCacheFiles(publicUploadsDir, 24);
            // Limpar diretório temporário (arquivos mais antigos que 1 hora)
            await cleanCacheFiles(tempDir, 1);
            logger_1.default.info("Limpeza de cache finalizada com sucesso");
        }
        catch (error) {
            logger_1.default.error(`Erro na tarefa de limpeza de cache: ${error}`);
        }
    },
};
