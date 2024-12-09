import { Request, Response } from "express";
import { ExpectedScoreService } from "../services/expectedScore.service";
import { DataSource } from "typeorm";
import { RequestHandler } from "../utils/requestHandler";
import { ExpectedScore } from "../entities/ExpectedScore";

export class ExpectedScoreController {
  private expectedScoreService: ExpectedScoreService;

  constructor(dataSource: DataSource) {
    this.expectedScoreService = new ExpectedScoreService(dataSource);
  }

  public getAllExpectedScores = (req: Request, res: Response) =>
    RequestHandler.getAll<ExpectedScore>(req, res, this.expectedScoreService);

  public getExpectedScoreById = (req: Request, res: Response) =>
    RequestHandler.getById<ExpectedScore>(req, res, this.expectedScoreService);

  public createExpectedScore = async (req: Request, res: Response) => {
    try {
      const expectedScore = await this.expectedScoreService.create(req.body);
      return res.status(201).json(expectedScore);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Student and Subject information are required') {
          return res.status(400).json({ message: error.message });
        }
      }
      console.error('[createExpectedScore] Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  public updateExpectedScore = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedExpectedScore = await this.expectedScoreService.update(id, updateData);

      if (!updatedExpectedScore) {
        return res.status(404).json({ message: 'Không tìm thấy bản ghi để cập nhật' });
      }

      return res.status(200).json(updatedExpectedScore);
    } catch (error) {
      if (error instanceof Error && error.message === 'Đã tồn tại bản ghi với student và subject này') {
        return res.status(400).json({ message: error.message });
      }
      console.error('[updateExpectedScore] Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  public deleteExpectedScores = async (req: Request, res: Response) => {
    try {
      const { subjectIds, studentId } = req.query;

      if (!subjectIds || !studentId) {
        return res.status(400).json({ message: 'Missing subjectIds or studentId' });
      }

      const result = await this.expectedScoreService.deleteBySubjectsAndStudent(subjectIds as string, studentId as string);
      if (result) {
        return res.status(200).json({ message: 'Expected scores deleted successfully' });
      } else {
        return res.status(404).json({ message: 'No expected scores found for given subjectIds and studentId' });
      }
    } catch (error) {
      console.error('[deleteExpectedScores] Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  public getExpectedScoreByStudentId = async (req: Request, res: Response) => {
    const { studentId } = req.params;
    try {
      const expectedScores = await this.expectedScoreService.getExpectedScoreByStudentId(studentId);
      res.status(200).json(expectedScores);
    } catch (error) {
      console.error('Error fetching expected scores:', error);
      res.status(500).json({ message: 'Không thể lấy điểm dự kiến' });
    }
  };

  public getExpectedScoreByStudentIdAndSubjectId = async (
    req: Request,
    res: Response
  ) => {
    const { studentId, subjectId } = req.params;
    try {
      const expectedScore = await this.expectedScoreService.getExpectedScoreByStudentIdAndSubjectId(
        studentId,
        subjectId
      );
      res.status(200).json(expectedScore);
    } catch (error) {
      console.error('Error fetching expected score:', error);
      res.status(500).json({ message: 'Không thể lấy điểm dự kiến' });
    }
  };

}