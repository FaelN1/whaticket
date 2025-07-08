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
exports.startCacheCleanScheduler = exports.cacheCleanQueue = void 0;
const Sentry = __importStar(require("@sentry/node"));
const bull_1 = __importDefault(require("bull"));
const jobs_1 = require("./jobs");
const logger_1 = __importDefault(require("./utils/logger"));
// Configuração da conexão com Redis (mesma usada pelo sistema)
const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    db: Number(process.env.REDIS_DB_SESSION) || 2,
    password: process.env.REDIS_PASSWORD || undefined,
    prefix: process.env.REDIS_PREFIX || "whaticket-cache"
};
// Criação da fila para limpeza de cache
exports.cacheCleanQueue = new bull_1.default("CacheCleanQueue", {
    redis: connection,
    defaultJobOptions: {
        removeOnComplete: true
    }
});
// Configuração do processador da fila
exports.cacheCleanQueue.process(async (job) => {
    try {
        await jobs_1.cleanCacheJob.handle(job);
    }
    catch (e) {
        Sentry.captureException(e);
        logger_1.default.error("Erro ao processar job de limpeza de cache:", e);
    }
});
// Função para iniciar o agendamento da limpeza de cache
const startCacheCleanScheduler = () => {
    logger_1.default.info("✅ Iniciando agendador de limpeza de cache");
    // Limpar jobs existentes
    exports.cacheCleanQueue.clean(0, "delayed");
    exports.cacheCleanQueue.clean(0, "wait");
    exports.cacheCleanQueue.clean(0, "active");
    exports.cacheCleanQueue.clean(0, "completed");
    exports.cacheCleanQueue.clean(0, "failed");
    // Agendar a limpeza para executar a cada hora
    exports.cacheCleanQueue.add({}, {
        repeat: {
            cron: "0 * * * *" // Executar no minuto 0 de cada hora (formato cron)
        }
    });
    // Executar imediatamente na inicialização
    exports.cacheCleanQueue.add({});
    // Log de eventos da fila
    exports.cacheCleanQueue.on("completed", job => {
        logger_1.default.info(`Limpeza de cache concluída: ${job.id}`);
    });
    exports.cacheCleanQueue.on("failed", (job, err) => {
        logger_1.default.error(`Falha na limpeza de cache: ${job?.id}`, err);
    });
};
exports.startCacheCleanScheduler = startCacheCleanScheduler;
// Iniciar o agendador se este arquivo for executado diretamente
if (require.main === module) {
    (0, exports.startCacheCleanScheduler)();
}
