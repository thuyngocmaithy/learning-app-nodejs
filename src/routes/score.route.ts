import { Router } from 'express';
import { ScoreController } from '../controllers/score.controller';
import { AppDataSource } from '../data-source';

const scoreRouter = Router();
const scoreController = new ScoreController(AppDataSource);

scoreRouter.get('/student/:studentId', scoreController.getScoreByStudentId);
scoreRouter.get('/', scoreController.getAllScores);
scoreRouter.get('/:id', scoreController.getScoreById);
scoreRouter.get('/student/:studentId/semester/:semesterId', scoreController.getScoreByStudentIdAndSemesterId);
scoreRouter.get('/student/:studentId/subject/:subjectId', scoreController.getScoreByStudentIdAndSubjectId);
scoreRouter.post('/', scoreController.createScore);
scoreRouter.put('/:id', scoreController.updateScore);
scoreRouter.delete('/', scoreController.deleteScore);

export default scoreRouter;