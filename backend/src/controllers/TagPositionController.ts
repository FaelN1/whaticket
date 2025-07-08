import { Request, Response } from "express";
import AppError from "../errors/AppError";
import TagPositionService from "../services/TagServices/TagPositionService";

/**
 * Controlador para gerenciar a posição das Lanes no Kanban
 * Este controlador foi criado como uma extensão sem modificar os arquivos originais
 */
export const updatePosition = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Verifica se o usuário tem permissão (apenas admin pode modificar lanes do kanban)
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { tagId } = req.params;
  const { position } = req.body;
  const { companyId } = req.user;

  // Converte position para número
  const positionNumber = parseInt(position);
  
  // Valida se position é um número entre 0 e 15
  if (isNaN(positionNumber) || positionNumber < 0 || positionNumber > 15) {
    throw new AppError("Position must be a number between 0 and 15", 400);
  }

  // Atualiza a posição da tag
  const tag = await TagPositionService({
    id: tagId,
    position: positionNumber,
    companyId
  });

  return res.status(200).json(tag);
};
