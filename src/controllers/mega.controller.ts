import { Request, Response } from 'express';
import { MegaService } from '../services/mega.service'; // Nhập MegaService
import path from 'path';
import fs from 'fs';
import { DataSource, Repository } from 'typeorm';
import multer from 'multer'; // Nhập multer để xử lý upload file
import { AttachService } from '../services/attach.service';
import { Attach } from '../entities/Attach';
import { ScientificResearch } from '../entities/ScientificResearch';
import { AppDataSource } from '../data-source';
import { Thesis } from '../entities/Thesis';
import { User } from '../entities/User';

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../temp'),
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Tên file giữ nguyên
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
                return res.status(500).json({ message: 'Upload error', error: err.message });
            }

            const files = req.files as Express.Multer.File[]; // Chuyển đổi kiểu

            if (!files || files.length === 0) {
                return res.status(400).json({ message: 'No files uploaded.' });
            }

            const uploadedFiles: any[] = []; // Mảng lưu thông tin file đã tải lên

            // Tải lên từng file
            for (const file of files) {
                try {
                    const filePath = file.path; // Lấy đường dẫn file tạm trên server
                    const uploadedFile = await this.megaService.uploadFile(filePath); // Tải lên MEGA

                    // Kiểm tra kết quả upload
                    if (uploadedFile) {
                        uploadedFiles.push(uploadedFile); // Thêm file đã tải lên vào mảng
                    } else {
                        console.log(uploadedFile)
                        console.warn(`Upload failed for file: ${file.originalname}`);
                    }
                } catch (error) {
                    console.error(`Error uploading file ${file.originalname}:`, error);
                } finally {
                    // Xóa file tạm sau khi upload
                    fs.unlinkSync(file.path);

                    const scientificResearchId = req.body.scientificResearchId;
                    const thesisId = req.body.thesisId;
                    const userId = req.body.userId;
                    // Lưu thông tin file vào db
                    const attach = new Attach();
                    const scientificResearch = scientificResearchId && await this.scientificResearchRepository.findOneBy({ scientificResearchId: scientificResearchId });
                    const thesis = req.thesis && await this.thesisRepository.findOneBy({ thesisId: thesisId });
                    const user = await this.userRepository.findOneBy({ userId: userId });

                    if (!scientificResearch && !thesis) {
                        return res.status(404).json({ message: 'Maga.controller - upload file: Not found scientificResearch or thesis' });
                    }

                    if (!user) {
                        return res.status(404).json({ message: 'Maga.controller - upload file: Not found user' });
                    }

                    attach.filename = file.originalname;
                    attach.scientificResearch = scientificResearch || null; // Cho phép scientificResearch null
                    attach.thesis = thesis || null; // Cho phép thesis null
                    attach.createUser = user;

                    await this.attachService.create(attach);
                }
            }

            return res.status(200).json({ message: 'success' });
        });
    }

    // Hàm download file
    public downloadFile = async (req: Request, res: Response) => {
        try {
            const { fileId } = req.params;

            // Tạo đường dẫn tạm thời trên server để lưu file trước khi gửi tới client
            const tempDir = path.join(__dirname, '../../temp');
            const destinationPath = path.join(tempDir, `${fileId}`);

            // Kiểm tra và tạo thư mục tạm thời nếu chưa tồn tại
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Tải file từ MEGA về thư mục tạm trên server
            await this.megaService.downloadFile(fileId, destinationPath);

            // Sử dụng res.download để gửi file về cho client
            res.download(destinationPath, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error downloading file', error: err.message });
                }

                // Xóa file tạm sau khi tải xong
                fs.unlinkSync(destinationPath);
            });
        } catch (error) {
            const err = error as Error;
            return res.status(500).json({ message: 'Error', error: err.message });
        }
        finally {

        }
    }
}
