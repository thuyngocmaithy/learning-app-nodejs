// src/routes/accountRoutes.ts
import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { AppDataSource } from '../data-source';


    const accountRouter = Router();
    const accountController = new AccountController(AppDataSource);

    accountRouter.get('/', accountController.getAllAccounts);
    accountRouter.get('/:id', accountController.getAccountById);
    accountRouter.post('/', accountController.createAccount);
    accountRouter.put('/:id', accountController.updateAccount);
    accountRouter.delete('/:id', accountController.deleteAccount);

    export default accountRouter;
