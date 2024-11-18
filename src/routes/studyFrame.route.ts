import { Router } from 'express';
import { StudyFrameController } from '../controllers/studyFrame.controller';
import { AppDataSource } from '../data-source';


const studyFrameRouter = Router();
const studyFrameController = new StudyFrameController(AppDataSource);

studyFrameRouter.get('/major/:userId', studyFrameController.GetSubjectByMajor);
// studyFrameRouter.get('/listSubjectToFrame', studyFrameController.callKhungCTDT);
studyFrameRouter.get('/findKhungCTDTByUserId', studyFrameController.findKhungCTDTByUserId);
// studyFrameRouter.get('/findFrameDepartment', studyFrameController.findKhungCTDTDepartment);
studyFrameRouter.get('/findKhungCTDTDepartment', studyFrameController.findKhungCTDTDepartment);
studyFrameRouter.get('/callKhungCTDT', studyFrameController.callKhungCTDT);
studyFrameRouter.get('/components', studyFrameController.getAllStudyFrameComponents);
studyFrameRouter.get('/', studyFrameController.getAllStudyFrames);
studyFrameRouter.get('/:id', studyFrameController.getStudyFrameById);
studyFrameRouter.post('/', studyFrameController.createStudyFrame);
studyFrameRouter.put('/:id', studyFrameController.updateStudyFrame);
studyFrameRouter.delete('/', studyFrameController.deleteStudyFrame);

export default studyFrameRouter;

