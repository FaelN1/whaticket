import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateQueueIntegrationService from "../services/QueueIntegrationServices/CreateQueueIntegrationService";
import DeleteQueueIntegrationService from "../services/QueueIntegrationServices/DeleteQueueIntegrationService";
import ListQueueIntegrationService from "../services/QueueIntegrationServices/ListQueueIntegrationService";
import ShowQueueIntegrationService from "../services/QueueIntegrationServices/ShowQueueIntegrationService";
import TestSessionIntegrationService from "../services/QueueIntegrationServices/TestSessionDialogflowService";
import UpdateQueueIntegrationService from "../services/QueueIntegrationServices/UpdateQueueIntegrationService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { queueIntegrations, count, hasMore } = await ListQueueIntegrationService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.status(200).json({ queueIntegrations, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { type, name, projectName, jsonContent, language, urlN8N,
    typebotExpires,
    typebotKeywordFinish,
    typebotSlug,
    typebotUnknownMessage,
    typebotDelayMessage,
    typebotKeywordRestart,
    typebotRestartMessage } = req.body;
  const { companyId } = req.user;
  const queueIntegration = await CreateQueueIntegrationService({
    type, name, projectName, jsonContent, language, urlN8N, companyId,
    typebotExpires,
    typebotKeywordFinish,
    typebotSlug,
    typebotUnknownMessage,
    typebotDelayMessage,
    typebotKeywordRestart,
    typebotRestartMessage 
  });

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-queueIntegration`, {
    action: "create",
    queueIntegration
  });

  return res.status(200).json(queueIntegration);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { integrationId } = req.params;
  const { companyId } = req.user;

  const queueIntegration = await ShowQueueIntegrationService(integrationId, companyId);

  return res.status(200).json(queueIntegration);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { integrationId } = req.params;
  const integrationData = req.body;
  const { companyId } = req.user;

  const queueIntegration = await UpdateQueueIntegrationService({ integrationData, integrationId, companyId });

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-queueIntegration`, {
    action: "update",
    queueIntegration
  });

  return res.status(201).json(queueIntegration);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { integrationId } = req.params;
  const { companyId } = req.user;

  await DeleteQueueIntegrationService(integrationId);

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-queueIntegration`, {
    action: "delete",
    integrationId: +integrationId
  });

  return res.status(200).send();
};

export const testSession = async (req: Request, res: Response): Promise<Response> => {
  const { projectName, jsonContent, language } = req.body;
  const { companyId } = req.user;

  const response = await TestSessionIntegrationService({ projectName, jsonContent, language });

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-queueIntegration`, {
    action: "testSession",
    response
  });

  return res.status(200).json(response);
};