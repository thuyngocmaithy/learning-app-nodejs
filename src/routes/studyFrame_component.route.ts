import { Router } from 'express';
import { StudyFrame_ComponentController } from '../controllers/studyFrame_component.controller';
import { AppDataSource } from '../data-source';


const studyFrame_ComponentRouter = Router();
const studyFrame_ComponentController = new StudyFrame_ComponentController(AppDataSource);

studyFrame_ComponentRouter.get('/', studyFrame_ComponentController.getAllStudyFrame_Components);
studyFrame_ComponentRouter.get('/getWhere', studyFrame_ComponentController.getStudyFrame_ComponentWhere);
studyFrame_ComponentRouter.get('/:id', studyFrame_ComponentController.getStudyFrame_ComponentById);
studyFrame_ComponentRouter.post('/', studyFrame_ComponentController.createStudyFrame_Component);
studyFrame_ComponentRouter.put('/:id', studyFrame_ComponentController.updateStudyFrame_Component);
studyFrame_ComponentRouter.delete('/', studyFrame_ComponentController.deleteStudyFrame_Component);

export default studyFrame_ComponentRouter;

