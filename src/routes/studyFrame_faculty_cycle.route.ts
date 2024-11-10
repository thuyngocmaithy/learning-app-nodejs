import { Router } from 'express';
import { StudyFrame_Faculty_CycleController } from '../controllers/studyFrame_faculty_cycle.controller';
import { AppDataSource } from '../data-source';


const studyFrame_faculty_cycleRouter = Router();
const studyFrame_faculty_cycleController = new StudyFrame_Faculty_CycleController(AppDataSource);

studyFrame_faculty_cycleRouter.get('/', studyFrame_faculty_cycleController.getAllStudyFrame_Faculty_Cycles);
studyFrame_faculty_cycleRouter.post('/saveApplyFrame', studyFrame_faculty_cycleController.saveApplyFrame);
studyFrame_faculty_cycleRouter.get('/getWhere', studyFrame_faculty_cycleController.getStudyFrame_Faculty_CycleWhere);
studyFrame_faculty_cycleRouter.get('/:id', studyFrame_faculty_cycleController.getStudyFrame_Faculty_CycleById);
studyFrame_faculty_cycleRouter.post('/', studyFrame_faculty_cycleController.createStudyFrame_Faculty_Cycle);
studyFrame_faculty_cycleRouter.put('/:id', studyFrame_faculty_cycleController.updateStudyFrame_Faculty_Cycle);
studyFrame_faculty_cycleRouter.delete('/', studyFrame_faculty_cycleController.deleteStudyFrame_Faculty_Cycle);

export default studyFrame_faculty_cycleRouter;

