import { Router } from 'express';
import { ExpectedScoreController } from '../controllers/expectedScore.controller';
import { AppDataSource } from '../data-source';

const expectedScoreRouter = Router();
const expectedScoreController = new ExpectedScoreController(AppDataSource);

// Route riêng cho expected score
expectedScoreRouter.get('/student/:studentId', expectedScoreController.getExpectedScoreByStudentId);
expectedScoreRouter.get('/student/:studentId/subject/:subjectId', expectedScoreController.getExpectedScoreByStudentIdAndSubjectId);

// Các route cho ExpectedScore
expectedScoreRouter.get('/', expectedScoreController.getAllExpectedScores);
expectedScoreRouter.get('/:id', expectedScoreController.getExpectedScoreById);
expectedScoreRouter.post('/', expectedScoreController.createExpectedScore);
expectedScoreRouter.put('/:id', expectedScoreController.updateExpectedScore);
expectedScoreRouter.delete('/', expectedScoreController.deleteExpectedScores);


export default expectedScoreRouter;