// src/routes/thesisGroupRoutes.ts
import { Router } from 'express';
import { ThesisGroupController } from '../controllers/thesisGroup.controller';
import { AppDataSource } from '../data-source';


const thesisGroupRoute = Router();
const thesisGroupController = new ThesisGroupController(AppDataSource);

thesisGroupRoute.post('/import', thesisGroupController.importThesisGroup);
thesisGroupRoute.get('/', thesisGroupController.getAllThesisGroups);
thesisGroupRoute.get('/checkValidDateCreateThesis', thesisGroupController.checkValidDateCreateThesis);
thesisGroupRoute.put('/updateThesisGroupMulti/:ids', thesisGroupController.updateThesisGroupMulti);
thesisGroupRoute.get('/getWhere', thesisGroupController.getThesisGroupWhere);
thesisGroupRoute.get('/:id', thesisGroupController.getThesisGroupById);
thesisGroupRoute.post('/', thesisGroupController.createThesisGroup);
thesisGroupRoute.put('/:id', thesisGroupController.updateThesisGroup);
thesisGroupRoute.delete('/', thesisGroupController.deleteThesisGroup);


export default thesisGroupRoute;

