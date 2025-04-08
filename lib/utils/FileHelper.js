import fs from 'fs';
import path from 'path';
import { logger } from './Logger';

/**
 * Utility class để làm việc với file
 */
class FileHelper {
    /**
     * Đọc file JSON
     * @param {string} filePath - Đường dẫn đến file
     * @returns {Object} - Dữ liệu JSON
     */
    static readJsonFile(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            logger.debug(`Đọc file JSON: ${absolutePath}`);

            const data = fs.readFileSync(absolutePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            logger.error(`Lỗi khi đọc file JSON: ${filePath}`, error);
            throw error;
        }
    }

    /**
     * Ghi dữ liệu vào file JSON
     * @param {string} filePath - Đường dẫn đến file
     * @param {Object} data - Dữ liệu cần ghi
     * @param {boolean} pretty - Định dạng JSON đẹp (mặc định: true)
     */
    static writeJsonFile(filePath, data, pretty = true) {
        try {
            const absolutePath = path.resolve(filePath);
            logger.debug(`Ghi file JSON: ${absolutePath}`);

            // Tạo thư mục nếu chưa tồn tại
            const dir = path.dirname(absolutePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const jsonData = pretty
                ? JSON.stringify(data, null, 2)
                : JSON.stringify(data);

            fs.writeFileSync(absolutePath, jsonData, 'utf8');
            logger.debug(`Đã ghi file JSON thành công: ${absolutePath}`);
        } catch (error) {
            logger.error(`Lỗi khi ghi file JSON: ${filePath}`, error);
            throw error;
        }
    }

    /**
     * Đọc file CSV và chuyển đổi thành mảng đối tượng
     * @param {string} filePath - Đường dẫn đến file
     * @param {string} delimiter - Ký tự phân cách (mặc định: ,)
     * @returns {Array<Object>} - Mảng các đối tượng
     */
    static readCsvFile(filePath, delimiter = ',') {
        try {
            const absolutePath = path.resolve(filePath);
            logger.debug(`Đọc file CSV: ${absolutePath}`);

            const data = fs.readFileSync(absolutePath, 'utf8');
            const lines = data.split('\n');

            // Lấy header từ dòng đầu tiên
            const headers = lines[0].split(delimiter).map(header => header.trim());

            // Chuyển đổi các dòng còn lại thành đối tượng
            const result = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const values = line.split(delimiter);
                const obj = {};

                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j]] = values[j] ? values[j].trim() : '';
                }

                result.push(obj);
            }

            return result;
        } catch (error) {
            logger.error(`Lỗi khi đọc file CSV: ${filePath}`, error);
            throw error;
        }
    }

    /**
     * Ghi mảng đối tượng vào file CSV
     * @param {string} filePath - Đường dẫn đến file
     * @param {Array<Object>} data - Mảng các đối tượng
     * @param {string} delimiter - Ký tự phân cách (mặc định: ,)
     */
    static writeCsvFile(filePath, data, delimiter = ',') {
        try {
            const absolutePath = path.resolve(filePath);
            logger.debug(`Ghi file CSV: ${absolutePath}`);

            // Tạo thư mục nếu chưa tồn tại
            const dir = path.dirname(absolutePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            if (!data || data.length === 0) {
                fs.writeFileSync(absolutePath, '', 'utf8');
                logger.debug(`Đã ghi file CSV trống: ${absolutePath}`);
                return;
            }

            // Lấy headers từ đối tượng đầu tiên
            const headers = Object.keys(data[0]);

            // Tạo dòng header
            let csvContent = headers.join(delimiter) + '\n';

            // Tạo các dòng dữ liệu
            for (const item of data) {
                const values = headers.map(header => {
                    const value = item[header] || '';
                    // Xử lý giá trị có chứa dấu phẩy hoặc dòng mới
                    if (typeof value === 'string' && (value.includes(delimiter) || value.includes('\n'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                });

                csvContent += values.join(delimiter) + '\n';
            }

            fs.writeFileSync(absolutePath, csvContent, 'utf8');
            logger.debug(`Đã ghi file CSV thành công: ${absolutePath}`);
        } catch (error) {
            logger.error(`Lỗi khi ghi file CSV: ${filePath}`, error);
            throw error;
        }
    }

    /**
     * Đọc file text
     * @param {string} filePath - Đường dẫn đến file
     * @returns {string} - Nội dung file
     */
    static readTextFile(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            logger.debug(`Đọc file text: ${absolutePath}`);

            return fs.readFileSync(absolutePath, 'utf8');
        } catch (error) {
            logger.error(`Lỗi khi đọc file text: ${filePath}`, error);
            throw error;
        }
    }

    /**
     * Ghi nội dung vào file text
     * @param {string} filePath - Đường dẫn đến file
     * @param {string} content - Nội dung cần ghi
     * @param {boolean} append - Ghi đè hay thêm vào cuối file (mặc định: false)
     */
    static writeTextFile(filePath, content, append = false) {
        try {
            const absolutePath = path.resolve(filePath);
            logger.debug(`${append ? 'Thêm vào' : 'Ghi'} file text: ${absolutePath}`);

            // Tạo thư mục nếu chưa tồn tại
            const dir = path.dirname(absolutePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            if (append) {
                fs.appendFileSync(absolutePath, content, 'utf8');
            } else {
                fs.writeFileSync(absolutePath, content, 'utf8');
            }

            logger.debug(`Đã ${append ? 'thêm vào' : 'ghi'} file text thành công: ${absolutePath}`);
        } catch (error) {
            logger.error(`Lỗi khi ${append ? 'thêm vào' : 'ghi'} file text: ${filePath}`, error);
            throw error;
        }
    }

    /**
     * Kiểm tra file có tồn tại không
     * @param {string} filePath - Đường dẫn đến file
     * @returns {boolean} - True nếu file tồn tại
     */
    static fileExists(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            return fs.existsSync(absolutePath);
        } catch (error) {
            logger.error(`Lỗi khi kiểm tra file tồn tại: ${filePath}`, error);
            return false;
        }
    }

    /**
     * Xóa file
     * @param {string} filePath - Đường dẫn đến file
     * @returns {boolean} - True nếu xóa thành công
     */
    static deleteFile(filePath) {
        try {
            const absolutePath = path.resolve(filePath);

            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
                logger.debug(`Đã xóa file: ${absolutePath}`);
                return true;
            }

            logger.debug(`File không tồn tại để xóa: ${absolutePath}`);
            return false;
        } catch (error) {
            logger.error(`Lỗi khi xóa file: ${filePath}`, error);
            return false;
        }
    }

    /**
     * Tạo thư mục nếu chưa tồn tại
     * @param {string} dirPath - Đường dẫn đến thư mục
     * @returns {boolean} - True nếu tạo thành công hoặc đã tồn tại
     */
    static createDirectory(dirPath) {
        try {
            const absolutePath = path.resolve(dirPath);

            if (!fs.existsSync(absolutePath)) {
                fs.mkdirSync(absolutePath, { recursive: true });
                logger.debug(`Đã tạo thư mục: ${absolutePath}`);
            } else {
                logger.debug(`Thư mục đã tồn tại: ${absolutePath}`);
            }

            return true;
        } catch (error) {
            logger.error(`Lỗi khi tạo thư mục: ${dirPath}`, error);
            return false;
        }
    }

    /**
     * Liệt kê các file trong thư mục
     * @param {string} dirPath - Đường dẫn đến thư mục
     * @param {string} extension - Phần mở rộng file cần lọc (optional)
     * @returns {Array<string>} - Danh sách đường dẫn file
     */
    static listFiles(dirPath, extension = '') {
        try {
            const absolutePath = path.resolve(dirPath);

            if (!fs.existsSync(absolutePath)) {
                logger.warn(`Thư mục không tồn tại: ${absolutePath}`);
                return [];
            }

            const files = fs.readdirSync(absolutePath);

            if (extension) {
                return files
                    .filter(file => file.endsWith(extension))
                    .map(file => path.join(dirPath, file));
            }

            return files.map(file => path.join(dirPath, file));
        } catch (error) {
            logger.error(`Lỗi khi liệt kê file trong thư mục: ${dirPath}`, error);
            return [];
        }
    }

    /**
     * Lưu screenshot
     * @param {Buffer} screenshotBuffer - Buffer chứa dữ liệu screenshot
     * @param {string} fileName - Tên file (không bao gồm đường dẫn)
     * @param {string} dirPath - Thư mục lưu screenshot (mặc định: ./screenshots)
     * @returns {string} - Đường dẫn đến file screenshot
     */
    static saveScreenshot(screenshotBuffer, fileName, dirPath = './screenshots') {
        try {
            // Tạo thư mục nếu chưa tồn tại
            this.createDirectory(dirPath);

            // Đảm bảo fileName có đuôi .png
            const fileNameWithExt = fileName.endsWith('.png') ? fileName : `${fileName}.png`;

            // Đường dẫn đầy đủ đến file
            const filePath = path.join(dirPath, fileNameWithExt);
            const absolutePath = path.resolve(filePath);

            // Ghi file
            fs.writeFileSync(absolutePath, screenshotBuffer);
            logger.debug(`Đã lưu screenshot: ${absolutePath}`);

            return filePath;
        } catch (error) {
            logger.error(`Lỗi khi lưu screenshot: ${fileName}`, error);
            throw error;
        }
    }

    /**
     * Đọc file Excel và chuyển đổi thành mảng đối tượng
     * @param {string} filePath - Đường dẫn đến file
     * @param {string} sheetName - Tên sheet (optional)
     * @returns {Array<Object>} - Mảng các đối tượng
     */
    static readExcelFile(filePath, sheetName = '') {
        try {
            // Chức năng này yêu cầu thư viện bổ sung như xlsx
            // Cần cài đặt: npm install xlsx
            const xlsx = require('xlsx');

            const absolutePath = path.resolve(filePath);
            logger.debug(`Đọc file Excel: ${absolutePath}`);

            const workbook = xlsx.readFile(absolutePath);

            // Nếu không chỉ định sheet, sử dụng sheet đầu tiên
            const sheet = sheetName
                ? workbook.Sheets[sheetName]
                : workbook.Sheets[workbook.SheetNames[0]];

            // Chuyển đổi sheet thành mảng đối tượng
            const data = xlsx.utils.sheet_to_json(sheet);

            return data;
        } catch (error) {
            logger.error(`Lỗi khi đọc file Excel: ${filePath}`, error);
            throw error;
        }
    }

    /**
     * Ghi mảng đối tượng vào file Excel
     * @param {string} filePath - Đường dẫn đến file
     * @param {Array<Object>} data - Mảng các đối tượng
     * @param {string} sheetName - Tên sheet (mặc định: Sheet1)
     */
    static writeExcelFile(filePath, data, sheetName = 'Sheet1') {
        try {
            // Chức năng này yêu cầu thư viện bổ sung như xlsx
            // Cần cài đặt: npm install xlsx
            const xlsx = require('xlsx');

            const absolutePath = path.resolve(filePath);
            logger.debug(`Ghi file Excel: ${absolutePath}`);

            // Tạo thư mục nếu chưa tồn tại
            const dir = path.dirname(absolutePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Tạo workbook và worksheet
            const workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.json_to_sheet(data);

            // Thêm worksheet vào workbook
            xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

            // Ghi file
            xlsx.writeFile(workbook, absolutePath);
            logger.debug(`Đã ghi file Excel thành công: ${absolutePath}`);
        } catch (error) {
            logger.error(`Lỗi khi ghi file Excel: ${filePath}`, error);
            throw error;
        }
    }
}

// Export class FileHelper
export default FileHelper;
