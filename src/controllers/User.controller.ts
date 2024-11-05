import { Request, Response } from 'express';
import { UserService } from '../services/User.service';
import { DataSource } from 'typeorm';
import { RequestHandler } from '../utils/requestHandler';
import { User } from '../entities/User';
import { StatusCodes } from 'http-status-codes';

export class UserController {
  private userService: UserService;

  constructor(dataSource: DataSource) {
    this.userService = new UserService(dataSource);
  }

  public getAllUsers = (req: Request, res: Response) => RequestHandler.getAll<User>(req, res, this.userService);

  //lấy user theo id
  public getUserById = (req: Request, res: Response) => RequestHandler.getById<User>(req, res, this.userService);

  //lấy danh sách giảng viên
  public getActiveNonStudents = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getActiveNonStudents(); // Gọi trực tiếp phương thức getActiveNonStudents từ service
      res.status(StatusCodes.OK).json({ message: "success", data: users });
    } catch (error) {
      console.error("Get Active Non-Students Error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "error", error: (error as Error).message });
    }
  };

  //lấy danh sách sinh viên
  public getActiveStudents = (req: Request, res: Response) => {
    this.userService.getActiveStudents()
      .then(users => res.status(200).json({ message: 'success', data: users }))
      .catch(error => res.status(500).json({ message: 'error', error: error.message }));
  };


  public getUsersByFaculty = async (req: Request, res: Response) => {
    const facultyId = req.params.facultyId;
    try {
      const users = await this.userService.getUsersByFaculty(facultyId);
      res.status(StatusCodes.OK).json({ message: "success", data: users });
    } catch (error) {
      console.error("Get Users By Faculty Error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "error", error: (error as Error).message });
    }
  };


  public getUserByUserId = async (req: Request, res: Response) => {
    const userId = req.params.userId;
    try {
      const user = await this.userService.getByUserId(userId);
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      }
      res.status(StatusCodes.OK).json({ message: "success", data: user });
    } catch (error) {
      console.error("Get User By UserId Error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "error", error: (error as Error).message });
    }
  };

  public createUser = (req: Request, res: Response) => RequestHandler.create<User>(req, res, this.userService);
  public updateUser = (req: Request, res: Response) => RequestHandler.update<User>(req, res, this.userService);
  public deleteUser = (req: Request, res: Response) => RequestHandler.delete(req, res, this.userService);

  public addUserFromExcel = async (req: Request, res: Response) => {
    try {
        const users: Partial<User>[] = req.body; // Lấy danh sách người dùng

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No users provided' });
        }

        // Lưu từng người dùng vào db
        for (const user of users) {
            // Kiểm tra xem userId có giá trị hợp lệ hay không trước khi tạo người dùng
            if (!user.userId) {
                continue; // Bỏ qua nếu userId không có
            }
            // Kiểm tra và chuyển đổi ngày tháng
             if (user.dateOfBirth) {
              const date = new Date(user.dateOfBirth);
              user.dateOfBirth = date;
            }

            await this.userService.create(user);
        }

        res.status(StatusCodes.CREATED).json({ message: 'Users imported successfully', data: users });
    } catch (error) {
        console.error('Error importing users:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error importing users', error: (error as Error).message });
    }
  };
}