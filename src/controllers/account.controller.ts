// account.controller.ts
import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { Account } from '../entities/Account';

export class AccountController {
  private accountService: AccountService;

  constructor(dataSource: DataSource) {
    this.accountService = new AccountService(dataSource);
  }

  public getAllAccounts = (req: Request, res: Response) => RequestHandler.getAll<Account>(req, res, this.accountService);
  public getAccountWhere = (req: Request, res: Response) => RequestHandler.getWhere<Account>(req, res, this.accountService);
  public getAccountById = (req: Request, res: Response) => RequestHandler.getById<Account>(req, res, this.accountService);
  public createAccount = (req: Request, res: Response) => RequestHandler.create<Account>(req, res, this.accountService);
  public updateAccount = (req: Request, res: Response) => RequestHandler.update<Account>(req, res, this.accountService);
  public deleteAccount = (req: Request, res: Response) => RequestHandler.delete(req, res, this.accountService);

  public getAccountByUsername = (req: Request, res: Response) => {
    const { username } = req.params;
    this.accountService.getByUsername(username)
      .then(account => {
        if (account) {
          res.json(account);
        } else {
          res.status(404).json({ message: 'Account not found' });
        }
      })
      .catch(error => res.status(500).json({ message: error.message }));
  };
}