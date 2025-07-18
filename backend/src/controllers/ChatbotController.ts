import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateChatBotServices from "../services/ChatBotServices/CreateChatBotServices";
import DeleteChatBotServices from "../services/ChatBotServices/DeleteChatBotServices";
import ListChatBotServices from "../services/ChatBotServices/ListChatBotServices";
import ShowChatBotServices from "../services/ChatBotServices/ShowChatBotServices";
import UpdateChatBotServices from "../services/ChatBotServices/UpdateChatBotServices";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const queues = await ListChatBotServices();

  return res.status(200).json(queues);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color, greetingMessage, queueType, optIntegrationId, optQueueId, optUserId, optFileId, closeTicket } = req.body;
  const { companyId } = req.user;

  const chatbot = await CreateChatBotServices({ name, color, greetingMessage, queueType, optIntegrationId, optQueueId, optUserId, optFileId, closeTicket });
  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-chatbot`, {
      action: "update",
      chatbot
    });

  return res.status(200).json(chatbot);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { chatbotId } = req.params;

  const queue = await ShowChatBotServices(chatbotId);
  return res.status(200).json(queue);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { chatbotId } = req.params;
  const { companyId } = req.user;

  const chatbot = await UpdateChatBotServices(chatbotId, req.body);

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-chatbot`, {
      action: "update",
      chatbot
    });

  return res.status(201).json(chatbot);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { chatbotId } = req.params;
  const { companyId } = req.user;

  await DeleteChatBotServices(chatbotId);

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-chatbot`, {
      action: "delete",
      chatbotId: +chatbotId
    });

  return res.status(200).send();
};
