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

// Sử dụng thư mục /tmp để lưu file tạm thời trong môi trường serverless như AWS Lambda
const storage = multer.diskStorage({
    destination: '/tmp', // Thư mục /tmp có thể ghi trong môi trường serverless
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Giữ nguyên tên file
    }
});

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
                    const filePath = file.path; // Lấy đường dẫn file tạm
                    const uploadedFile = await this.megaService.uploadFile(filePath); // Gọi MegaService để tải file lên MEGA

                    if (uploadedFile) {
                        uploadedFiles.push(uploadedFile); // Thêm file đã tải lên thành công vào mảng
                    } else {
                        console.warn(`Upload thất bại cho file: ${file.originalname}`);
                    }
                } catch (error) {
                    console.error(`Lỗi khi upload file ${file.originalname}:`, error);
                } finally {
                    // Xóa file tạm sau khi đã upload xong
                    fs.unlinkSync(file.path);

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
            const tempDir = '/tmp';
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
}
