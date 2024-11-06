import { Router } from 'express';
import { Subject_StudyFrameCompController } from '../controllers/subject_studyFrameComp.controller';
import { AppDataSource } from '../data-source';


const subject_studyFrameCompRouter = Router();
const subject_studyFrameCompController = new Subject_StudyFrameCompController(AppDataSource);

subject_studyFrameCompRouter.get('/', subject_studyFrameCompController.getAllSubject_StudyFrameComps);
subject_studyFrameCompRouter.get('/getWhere', subject_studyFrameCompController.getSubject_StudyFrameCompWhere);
subject_studyFrameCompRouter.post('/createByListSubject', subject_studyFrameCompController.createSSMByListSubject);
subject_studyFrameCompRouter.post('/updateByListSubject', subject_studyFrameCompController.updateSSMByListSubject);
subject_studyFrameCompRouter.get('/:id', subject_studyFrameCompController.getSubject_StudyFrameCompById);
subject_studyFrameCompRouter.post('/', subject_studyFrameCompController.createSubject_StudyFrameComp);
subject_studyFrameCompRouter.put('/:id', subject_studyFrameCompController.updateSubject_StudyFrameComp);
subject_studyFrameCompRouter.delete('/', subject_studyFrameCompController.deleteSubject_StudyFrameComp);

export default subject_studyFrameCompRouter;

