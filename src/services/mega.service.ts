import { Storage, File } from 'megajs';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { pipeline } from 'stream';
import { promisify } from 'util';

const megaConfig = {
    email: process.env.MEGA_EMAIL,
    password: process.env.MEGA_PASSWORD,
    folder: process.env.MEGA_FOLDER
};

const pipelineAsync = promisify(pipeline);

export class MegaService {
    private storage: Storage | null = null;

    constructor(dataSource: DataSource) {

    }

    private async loginToMega(): Promise<Storage> {
        if (this.storage) {
            return this.storage;
        }

        this.storage = new Storage({
            email: megaConfig.email as string,
            password: megaConfig.password as string,
        });

        return new Promise<Storage>((resolve, reject) => {
            (this.storage as any).on('ready', () => {
                resolve(this.storage!);
            });

            (this.storage as any).on('error', (err: any) => {
                reject(err);
            });
        });
    }

    async uploadFileFromBuffer(fileBuffer: Buffer, fileName: string): Promise<File | undefined> {
        try {
            const storage = await this.loginToMega();
            const folder = storage.root.navigate(megaConfig.folder as string);
            if (!folder) {
                throw new Error(`Thư mục không tồn tại: ${megaConfig.folder}`);
            }

            // Lưu danh sách tên file trong một Set
            const existingFiles = new Set(folder.children?.map(file => file.name).filter((name): name is string => name !== null));
            const newFileName = this.getUniqueFileName(existingFiles, fileName);

            const chunkSize = 5 * 1024 * 1024; // 5MB mỗi phần
            const chunks = Math.ceil(fileBuffer.length / chunkSize);
            const uploadPromises: Promise<File>[] = [];

            for (let i = 0; i < chunks; i++) {
                const start = i * chunkSize;
                const end = Math.min((i + 1) * chunkSize, fileBuffer.length);

                const chunkBuffer = new Uint8Array(fileBuffer.buffer, start, end - start);

                const uploadStream = folder.upload({
                    name: newFileName,
                    size: chunkBuffer.length,
                    maxConnections: 1,
                });

                uploadPromises.push(new Promise<File>((resolve, reject) => {
                    uploadStream.on('complete', (file: File) => {
                        resolve(file);
                    });

                    uploadStream.on('error', (err: any) => {
                        reject(new Error(`Lỗi khi upload file chunk: ${err.message}`));
                    });

                    uploadStream.end(chunkBuffer);
                }));
            }

            // Chờ tất cả các upload hoàn thành
            const uploadedFiles = await Promise.all(uploadPromises);
            return uploadedFiles[0]; // Trả về file đầu tiên (hoặc kết hợp chúng nếu cần)

        } catch (error) {
            console.error('Lỗi khi upload file từ buffer:', error);
            throw error;
        }
    }

    // Hàm kiểm tra và tạo tên file mới
    private getUniqueFileName(existingFiles: Set<string>, fileName: string): string {
        const baseName = path.parse(fileName).name;
        const extName = path.parse(fileName).ext;
        let newFileName = fileName;
        let count = 1;

        // Kiểm tra sự tồn tại và tạo tên file mới nếu cần
        while (existingFiles.has(newFileName)) {
            newFileName = `${baseName} (${count})${extName}`;
            count++;
        }

        return newFileName;
    }

    // Download file từ MEGA
    async downloadFile(fileId: string, destinationPath: string): Promise<void> {
        try {
            const storage = await this.loginToMega();
            const folder = storage.root.navigate(megaConfig.folder as string);

            if (!folder) {
                throw new Error(`Thư mục không tồn tại: ${megaConfig.folder}`);
            }

            // Tìm file dựa trên fileId
            const file = folder.children?.find((child) => child.name === fileId);

            if (!file) {
                throw new Error('File không tìm thấy');
            }

            const downloadStream = file.download({ maxConnections: 10 });
            const writeStream = fs.createWriteStream(destinationPath);

            // Pipe dữ liệu từ downloadStream vào writeStream
            downloadStream.pipe(writeStream);

            return new Promise<void>((resolve, reject) => {
                writeStream.on('finish', () => resolve());
                writeStream.on('error', (err) => reject(new Error(`Lỗi khi tải file: ${err.message}`)));
            });
        } catch (error) {
            console.error(`Lỗi trong quá trình tải file: ${error}`);
            throw error;
        }
    }

}
