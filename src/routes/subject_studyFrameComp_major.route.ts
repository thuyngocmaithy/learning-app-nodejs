import { Router } from 'express';
import { Subject_StudyFrameComp_MajorController } from '../controllers/subject_studyFrameComp_major.controller';
import { AppDataSource } from '../data-source';


const subject_studyFrameComp_majorRouter = Router();
const subject_studyFrameComp_majorController = new Subject_StudyFrameComp_MajorController(AppDataSource);

subject_studyFrameComp_majorRouter.get('/', subject_studyFrameComp_majorController.getAllSubject_StudyFrameComp_Majors);
subject_studyFrameComp_majorRouter.get('/getWhere', subject_studyFrameComp_majorController.getSubject_StudyFrameComp_MajorWhere);
subject_studyFrameComp_majorRouter.post('/createByListSubject', subject_studyFrameComp_majorController.createSSMByListSubject);
subject_studyFrameComp_majorRouter.get('/:id', subject_studyFrameComp_majorController.getSubject_StudyFrameComp_MajorById);
subject_studyFrameComp_majorRouter.post('/', subject_studyFrameComp_majorController.createSubject_StudyFrameComp_Major);
subject_studyFrameComp_majorRouter.put('/:id', subject_studyFrameComp_majorController.updateSubject_StudyFrameComp_Major);
subject_studyFrameComp_majorRouter.delete('/', subject_studyFrameComp_majorController.deleteSubject_StudyFrameComp_Major);

export default subject_studyFrameComp_majorRouter;

