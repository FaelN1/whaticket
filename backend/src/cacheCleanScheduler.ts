import * as Sentry from "@sentry/node";
import BullQueue from "bull";
import { cleanCacheJob } from "./jobs";
import logger from "./utils/logger";

// Configuração da conexão com Redis (mesma usada pelo sistema)
const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  db: Number(process.env.REDIS_DB_SESSION) || 2,
  password: process.env.REDIS_PASSWORD || undefined,
  prefix: process.env.REDIS_PREFIX || "whaticket-cache"
};

// Criação da fila para limpeza de cache
export const cacheCleanQueue = new BullQueue("CacheCleanQueue", {
  redis: connection,
  defaultJobOptions: {
    removeOnComplete: true
  }
});

// Configuração do processador da fila
cacheCleanQueue.process(async job => {
  try {
    await cleanCacheJob.handle(job);
  } catch (e) {
    Sentry.captureException(e);
    logger.error("Erro ao processar job de limpeza de cache:", e);
  }
});

// Função para iniciar o agendamento da limpeza de cache
export const startCacheCleanScheduler = (): void => {
  logger.info("✅ Iniciando agendador de limpeza de cache");

  // Limpar jobs existentes
  cacheCleanQueue.clean(0, "delayed");
  cacheCleanQueue.clean(0, "wait");
  cacheCleanQueue.clean(0, "active");
  cacheCleanQueue.clean(0, "completed");
  cacheCleanQueue.clean(0, "failed");

  // Agendar a limpeza para executar a cada hora
  cacheCleanQueue.add(
    {},
    {
      repeat: {
        cron: "0 * * * *" // Executar no minuto 0 de cada hora (formato cron)
      }
    }
  );

  // Executar imediatamente na inicialização
  cacheCleanQueue.add({});

  // Log de eventos da fila
  cacheCleanQueue.on("completed", job => {
    logger.info(`Limpeza de cache concluída: ${job.id}`);
  });

  cacheCleanQueue.on("failed", (job, err) => {
    logger.error(`Falha na limpeza de cache: ${job?.id}`, err);
  });
};

// Iniciar o agendador se este arquivo for executado diretamente
if (require.main === module) {
  startCacheCleanScheduler();
}
