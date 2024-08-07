import { Request, Response } from 'express';
import { UserService } from '../services/User.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { User } from '../entities/User';

export class UserController {
    private userService: UserService;
  
    constructor(dataSource: DataSource) {
      this.userService = new UserService(dataSource);
    }
  
    public getAllUsers = (req: Request, res: Response) => RequestHandler.getAll<User>(req, res, this.userService);
    public getUserById = (req: Request, res: Response) => RequestHandler.getById<User>(req, res, this.userService);
    public createUser = (req: Request, res: Response) => RequestHandler.create<User>(req, res, this.userService);
    public updateUser = (req: Request, res: Response) => RequestHandler.update<User>(req, res, this.userService);
    public deleteUser = (req: Request, res: Response) => RequestHandler.delete(req, res, this.userService);
  }