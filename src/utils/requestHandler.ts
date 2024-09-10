import { Request, Response } from "express";
import { response } from "./responseHelper";
import { StatusCodes } from "http-status-codes";

export class RequestHandler {
  static sendResponse<T>(res: Response, statusCode: number, message: string, data: T | null, error?: string) {
    return response(res, statusCode, message, data, error);
  }

  static async create<T>(req: Request, res: Response, service: { create: (data: any) => Promise<T> }) {
    try {
      const data = req.body;
      const result = await service.create(data);
      return RequestHandler.sendResponse(res, StatusCodes.CREATED, "success", result);
    } catch (error) {
      console.error("Create Error:", error);
      return RequestHandler.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "error", null, (error as Error).message);
    }
  }

  static async getAll<T>(req: Request, res: Response, service: { getAll: () => Promise<T[]> }) {
    try {
      const result = await service.getAll();
      return RequestHandler.sendResponse(res, StatusCodes.OK, "success", result);
    } catch (error) {
      console.error("Get All Error:", error);
      return RequestHandler.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "error", null, (error as Error).message);
    }
  }

  static async getById<T>(req: Request, res: Response, service: { getById: (id: string) => Promise<T | null> }) {
    try {
      const id = req.params.id;
      const result = await service.getById(id);
      if (result) {
        return RequestHandler.sendResponse(res, StatusCodes.OK, "success", result);
      }
      return RequestHandler.sendResponse(res, StatusCodes.NOT_FOUND, "error", null, "Entity not found");
    } catch (error) {
      console.error("Get By ID Error:", error);
      return RequestHandler.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "error", null, (error as Error).message);
    }
  }

  static async getWhere<T>(
    req: Request,
    res: Response,
    service: { getWhere: (condition: Partial<T>) => Promise<T[]> }
  ) {
    try {
      const condition = req.query as Partial<T>;
      const result = await service.getWhere(condition);
      if (result !== null && result.length > 0) {
        return RequestHandler.sendResponse(res, StatusCodes.OK, "success", result);
      }
      return RequestHandler.sendResponse(res, StatusCodes.OK, "NoContent", null, "No entities found matching the criteria");
    } catch (error) {
      console.error("Get Where Error:", error);
      return RequestHandler.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "error", null, (error as Error).message);
    }
  }



  static async update<T>(req: Request, res: Response, service: { update: (id: string, data: any) => Promise<T | null> }) {
    try {
      const id = req.params.id;
      const data = req.body;
      const result = await service.update(id, data);
      if (result) {
        return RequestHandler.sendResponse(res, StatusCodes.OK, "success", result);
      }
      return RequestHandler.sendResponse(res, StatusCodes.NOT_FOUND, "error", null, "Entity not found");
    } catch (error) {
      console.error("Update Error:", error);
      return RequestHandler.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "error", null, (error as Error).message);
    }
  }

  static async delete(req: Request, res: Response, service: { delete: (id: string) => Promise<boolean> }) {
    try {
      const id = req.params.id;
      const result = await service.delete(id);
      if (result) {
        return RequestHandler.sendResponse(res, StatusCodes.OK, "success", null, "Entity deleted");
      }
      return RequestHandler.sendResponse(res, StatusCodes.NOT_FOUND, "error", null, "Entity not found");
    } catch (error) {
      console.error("Delete Error:", error);
      return RequestHandler.sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "error", null, (error as Error).message);
    }
  }
}