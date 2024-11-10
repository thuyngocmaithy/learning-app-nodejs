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




    async uploadFile(filePath: string): Promise<File | undefined> {
        const storage = await this.loginToMega();
        const fileName = path.basename(filePath);
        const fileSize = fs.statSync(filePath).size; // Lấy kích thước file

        // Lấy thư mục đích
        const folder = storage.root.navigate(megaConfig.folder as string);
        if (folder) {
            // Lưu danh sách tên file trong một Set
            const existingFiles = new Set(folder.children?.map(file => file.name).filter((name): name is string => name !== null));

            // Kiểm tra và tạo tên file mới nếu đã tồn tại
            const newFileName = this.getUniqueFileName(existingFiles, fileName);

            // Tạo upload stream cho file trong thư mục đã chọn
            const uploadStream = folder.upload({
                name: newFileName,
                size: fileSize,
                maxConnections: 10, // Có thể điều chỉnh tùy thuộc vào băng thông
            });

            // Biến để lưu thông tin file sau khi upload
            return new Promise<File | undefined>((resolve, reject) => {
                // Lắng nghe sự kiện complete để lấy thông tin file
                uploadStream.on('complete', (file: File) => {
                    resolve(file); // Gọi resolve khi upload hoàn tất
                });

                // Lắng nghe sự kiện error để xử lý lỗi
                uploadStream.on('error', (error) => {
                    console.error("Lỗi trong quá trình upload:", error);
                    reject(error); // Gọi reject khi có lỗi
                });

                // Sử dụng pipeline để đọc file và upload
                pipelineAsync(
                    fs.createReadStream(filePath),
                    uploadStream
                ).catch((err) => {
                    console.error("Lỗi trong quá trình upload:", err);
                    reject(err); // Gọi reject nếu pipeline có lỗi
                });
            });
        } else {
            console.error("Thư mục không tồn tại:", megaConfig.folder);
            return undefined;
        }
    }
    async uploadFileFromBuffer(fileBuffer: Buffer, fileName: string): Promise<File | undefined> {
        const storage = await this.loginToMega();
        const fileSize = fileBuffer.length; // Lấy kích thước của buffer

        // Lấy thư mục đích
        const folder = storage.root.navigate(megaConfig.folder as string);
        if (folder) {
            // Lưu danh sách tên file trong một Set
            const existingFiles = new Set(folder.children?.map(file => file.name).filter((name): name is string => name !== null));

            // Kiểm tra và tạo tên file mới nếu đã tồn tại
            const newFileName = this.getUniqueFileName(existingFiles, fileName);

            // Tạo upload stream cho file trong thư mục đã chọn
            const uploadStream = folder.upload({
                name: newFileName,
                size: fileSize,
                maxConnections: 10, // Có thể điều chỉnh tùy thuộc vào băng thông
            });

            return new Promise<File | undefined>((resolve, reject) => {
                // Lắng nghe sự kiện complete để lấy thông tin file
                uploadStream.on('complete', (file: File) => {
                    resolve(file); // Gọi resolve khi upload hoàn tất
                });

                // Lắng nghe sự kiện error để xử lý lỗi
                uploadStream.on('error', (error) => {
                    console.error("Lỗi trong quá trình upload:", error);
                    reject(error); // Gọi reject khi có lỗi
                });

                // Sử dụng pipeline để đọc buffer và upload
                pipelineAsync(
                    // Tạo stream từ buffer
                    fs.createReadStream(fileBuffer),
                    uploadStream
                ).catch((err) => {
                    console.error("Lỗi trong quá trình upload:", err);
                    reject(err); // Gọi reject nếu pipeline có lỗi
                });
            });
        } else {
            console.error("Thư mục không tồn tại:", megaConfig.folder);
            return undefined;
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
