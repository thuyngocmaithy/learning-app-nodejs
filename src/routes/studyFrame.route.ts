import { Router } from 'express';
import { StudyFrameController } from '../controllers/studyFrame.controller';
import { AppDataSource } from '../data-source';


    const studyFrameRouter = Router();
    const studyFrameController = new StudyFrameController(AppDataSource);

    studyFrameRouter.get('/', studyFrameController.getAllStudyFrames);
    studyFrameRouter.get('/:id', studyFrameController.getStudyFrameById);
    studyFrameRouter.post('/', studyFrameController.createStudyFrame);
    studyFrameRouter.put('/:id', studyFrameController.updateStudyFrame);
    studyFrameRouter.delete('/:id', studyFrameController.deleteStudyFrame);

    export default studyFrameRouter;

