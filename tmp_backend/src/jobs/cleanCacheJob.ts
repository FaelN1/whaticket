import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import logger from "../utils/logger";

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

// Função para limpar arquivos de cache mais antigos que o tempo especificado
async function cleanCacheFiles(directory: string, maxAgeHours: number = 24): Promise<void> {
  try {
    // Verificar se o diretório existe
    if (!fs.existsSync(directory)) {
      logger.info(`Diretório de cache não encontrado: ${directory}`);
      return;
    }

    const now = new Date().getTime();
    const files = await readdir(directory);
    
    let deletedCount = 0;
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(directory, file);
      
      try {
        // Ignorar diretórios
        const stats = await stat(filePath);
        if (stats.isDirectory()) continue;
        
        // Verificar idade do arquivo
        const fileAge = now - stats.mtime.getTime();
        const fileAgeHours = fileAge / (1000 * 60 * 60);
        
        // Se o arquivo for mais antigo que o limite, excluir
        if (fileAgeHours > maxAgeHours) {
          totalSize += stats.size;
          await unlink(filePath);
          deletedCount++;
        }
      } catch (err) {
        logger.error(`Erro ao processar arquivo ${filePath}: ${err}`);
      }
    }

    // Converter bytes para MB para o log
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    logger.info(
      `Limpeza de cache concluída: ${deletedCount} arquivos removidos (${totalSizeMB} MB)`
    );
  } catch (err) {
    logger.error(`Erro ao limpar cache: ${err}`);
  }
}

export default {
  key: `${process.env.DB_NAME}-cleanCache`,

  async handle({ data }): Promise<void> {
    try {
      logger.info("Iniciando limpeza de cache...");
      
      // Diretórios de cache a serem limpos
      const publicUploadsDir = path.resolve(__dirname, '..', '..', 'public', 'uploads');
      const tempDir = path.resolve(__dirname, '..', '..', 'temp');
      
      // Limpar diretório de uploads (arquivos mais antigos que 24 horas)
      await cleanCacheFiles(publicUploadsDir, 24);
      
      // Limpar diretório temporário (arquivos mais antigos que 1 hora)
      await cleanCacheFiles(tempDir, 1);
      
      logger.info("Limpeza de cache finalizada com sucesso");
    } catch (error) {
      logger.error(`Erro na tarefa de limpeza de cache: ${error}`);
    }
  },
};
