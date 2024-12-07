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

            const chunkSize = 1 * 1024 * 1024; // 1MB mỗi phần
            const chunks = Math.ceil(fileBuffer.length / chunkSize);
            const uploadPromises: Promise<File>[] = [];

            for (let i = 0; i < chunks; i++) {
                const start = i * chunkSize;
                const end = Math.min((i + 1) * chunkSize, fileBuffer.length);

                const chunkBuffer = new Uint8Array(fileBuffer.buffer, start, end - start);

                const uploadStream = folder.upload({
                    name: newFileName,
                    size: chunkBuffer.length,
                    maxConnections: 10, // Tăng kết nối song song
                });

                uploadPromises.push(
                    new Promise<File>((resolve, reject) => {
                        uploadStream.on('complete', (file: File) => resolve(file));
                        uploadStream.on('error', (err: any) => reject(err));
                        uploadStream.end(chunkBuffer);
                    })
                );
            }

            // Chờ tất cả các promise hoàn thành (bỏ qua các chunk thất bại)
            const results = await Promise.allSettled(uploadPromises);
            const uploadedFiles = results
                .filter((result) => result.status === 'fulfilled')
                .map((result) => (result as PromiseFulfilledResult<File>).value);

            if (uploadedFiles.length === 0) {
                throw new Error('Không thể tải lên bất kỳ chunk nào.');
            }

            return uploadedFiles[0]; // Trả về file đầu tiên 

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

    // Thêm phương thức deleteFiles để xóa nhiều file dựa trên danh sách tên file hoặc ID
    async deleteFiles(fileNames: string[]): Promise<void> {
        try {
            const storage = await this.loginToMega();
            const folder = storage.root.navigate(megaConfig.folder as string);

            if (!folder) {
                throw new Error(`Thư mục không tồn tại: ${megaConfig.folder}`);
            }

            // An toàn lọc các file hợp lệ
            const filesToDelete = folder.children?.filter((child) =>
                child.name !== null && fileNames.includes(child.name)
            );

            if (!filesToDelete || filesToDelete.length === 0) {
                throw new Error('Không tìm thấy file nào để xóa.');
            }

            const deletePromises = filesToDelete.map((file) => {
                return new Promise<void>((resolve, reject) => {
                    try {
                        if (file && file.delete) {
                            // Thay thế bằng logic promise phù hợp
                            file.delete().then(() => {
                                resolve();
                            }).catch((error) => {
                                reject(new Error(`Không thể xóa file ${file.name}: ${error.message}`));
                            });
                        } else {
                            reject(new Error('File hoặc delete() không hợp lệ.'));
                        }
                    } catch (error) {
                        reject(new Error(`Có lỗi trong quá trình xóa file: ${error}`));
                    }
                });
            });

            await Promise.allSettled(deletePromises);
        } catch (error) {
            console.error(`Lỗi khi xóa file: ${error}`);
            throw error;
        }
    }



}
