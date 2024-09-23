// src/routes/accountRoutes.ts
import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { AppDataSource } from '../data-source';

const accountRouter = Router();
const accountController = new AccountController(AppDataSource);

accountRouter.get('/', accountController.getAllAccounts);
accountRouter.get('/:id', accountController.getAccountById);
accountRouter.get('/username/:username', accountController.getAccountByUsername);
accountRouter.post('/', accountController.createAccount);
accountRouter.put('/:id', accountController.updateAccount);
accountRouter.delete('/', accountController.deleteAccount);

export default accountRouter;
