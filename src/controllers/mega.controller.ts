import { Request, Response } from 'express';
import { MegaService } from '../services/mega.service';
import path from 'path';
import fs from 'fs';
import { DataSource, Repository } from 'typeorm';
import multer from 'multer';
import { AttachService } from '../services/attach.service';
import { Attach } from '../entities/Attach';
import { ScientificResearch } from '../entities/ScientificResearch';
import { AppDataSource } from '../data-source';
import { Thesis } from '../entities/Thesis';
import { User } from '../entities/User';

// Sử dụng bộ nhớ tạm cho file thay vì ghi đĩa
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('files');

export class MegaController {
    private megaService: MegaService;
    private attachService: AttachService;
    private scientificResearchRepository: Repository<ScientificResearch>;
    private thesisRepository: Repository<Thesis>;
    private userRepository: Repository<User>;

    constructor(dataSource: DataSource) {
        this.megaService = new MegaService(dataSource);
        this.attachService = new AttachService(dataSource);
        this.scientificResearchRepository = AppDataSource.getRepository(ScientificResearch);
        this.thesisRepository = AppDataSource.getRepository(Thesis);
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Hàm retry để thử lại một hành động (operation) khi gặp lỗi
    private retryOperation = async (operation: any, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                // Thử thực hiện hành động
                return await operation();
            } catch (error) {
                const err = error as Error;
                console.error(`Lần thử thứ ${i + 1} thất bại. Lỗi: ${err.message}`);
                if (i < retries - 1) {
                    // Chờ một khoảng thời gian trước khi thử lại
                    await new Promise((res) => setTimeout(res, delay));
                } else {
                    // Nếu hết số lần thử, ném lỗi
                    throw error;
                }
            }
        }
    }

    // Hàm upload nhiều file
    public uploadFiles = async (req: any, res: Response) => {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi upload file', error: err.message });
            }

            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                return res.status(400).json({ message: 'Không có file nào được tải lên.' });
            }

            const uploadedFiles: any[] = []; // Mảng lưu thông tin các file đã upload

            for (const file of files) {
                try {
                    // Upload trực tiếp từ buffer
                    const uploadedFile = await this.retryOperation(() => this.megaService.uploadFileFromBuffer(file.buffer, file.originalname))

                    if (uploadedFile) {
                        uploadedFiles.push(uploadedFile);
                    } else {
                        console.warn(`Upload thất bại cho file: ${file.originalname}`);
                    }

                    const { scientificResearchId, thesisId, userId } = req.body;
                    const attach = new Attach();
                    const scientificResearch = scientificResearchId && await this.scientificResearchRepository.findOneBy({ scientificResearchId });
                    const thesis = thesisId && await this.thesisRepository.findOneBy({ thesisId });
                    const user = await this.userRepository.findOneBy({ userId });

                    // Kiểm tra nếu không có scientificResearch hoặc thesis thì trả về lỗi
                    if (!scientificResearch && !thesis) {
                        return res.status(404).json({ message: 'Không tìm thấy scientificResearch hoặc thesis' });
                    }

                    // Kiểm tra nếu không tìm thấy user thì trả về lỗi
                    if (!user) {
                        return res.status(404).json({ message: 'Không tìm thấy user' });
                    }

                    // Gán các thông tin file đã tải lên cho thực thể Attach
                    attach.filename = file.originalname;
                    attach.scientificResearch = scientificResearch || null;
                    attach.thesis = thesis || null;
                    attach.createUser = user;

                    // Lưu thông tin file vào database
                    await this.attachService.create(attach);
                } catch (error) {
                    console.error(`Lỗi khi upload file ${file.originalname}:`, error);
                }
            }

            return res.status(200).json({ message: 'Thành công' });
        });
    }

    // Hàm tải file xuống
    public downloadFile = async (req: Request, res: Response) => {
        try {
            const { fileId } = req.params;

            // Tạo đường dẫn tạm thời để lưu file trước khi gửi tới client
            const tempDir = '/tmp';  // Đảm bảo sử dụng /tmp cho lưu trữ có thể ghi
            const destinationPath = path.join(tempDir, `${fileId}`);

            // Kiểm tra và tạo thư mục tạm nếu chưa tồn tại
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Tải file từ MEGA về thư mục tạm trên server
            await this.megaService.downloadFile(fileId, destinationPath);

            // Sử dụng res.download để gửi file tới client
            res.download(destinationPath, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Lỗi khi tải file', error: err.message });
                }

                // Xóa file tạm sau khi đã tải xong
                fs.unlinkSync(destinationPath);
            });
        } catch (error) {
            const err = error as Error;
            return res.status(500).json({ message: 'Lỗi', error: err.message });
        }
    }


    public deleteFiles = async (req: Request, res: Response) => {
        try {
            const { fileNames } = req.body; // Dữ liệu file name cần xóa từ request body

            // Kiểm tra danh sách fileNames
            if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
                return res.status(400).json({ message: 'Danh sách file cần xóa không hợp lệ hoặc rỗng.' });
            }

            // Gọi hàm service deleteFiles
            await this.megaService.deleteFiles(fileNames);
            // Gọi hàm xóa data trong table attach
            await this.attachService.delete(fileNames);
            return res.status(200).json({ message: 'Xóa file thành công.' });
        } catch (error) {
            console.error('Lỗi khi xóa file: ', error);
            return res.status(500).json({ message: 'Có lỗi trong quá trình xóa file.', error: error });
        }
    };


}
