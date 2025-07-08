import Tag from "../../models/Tag";
import ShowService from "./ShowService";
import { getIO } from "../../libs/socket";

interface Request {
  id: string | number;
  position: number;
  companyId: number;
}

/**
 * Serviço para atualizar a posição de uma Lane no Kanban
 * Este serviço foi criado como uma extensão sem modificar os arquivos originais
 */
const TagPositionService = async ({
  id,
  position,
  companyId
}: Request): Promise<Tag> => {
  // Validação da posição (0-15)
  if (position < 0 || position > 15) {
    position = 0; // Valor padrão caso esteja fora do intervalo
  }

  // Busca a tag pelo ID
  const tag = await ShowService(id);

  // Atualiza apenas a posição
  await tag.update({
    position
  });

  // Recarrega a tag para obter os dados atualizados
  await tag.reload();

  // Emite evento via socket para atualização em tempo real
  const io = getIO();
  io.of(String(companyId))
    .emit(`company${companyId}-tag`, {
      action: "update",
      tag
    });

  return tag;
};

export default TagPositionService;
