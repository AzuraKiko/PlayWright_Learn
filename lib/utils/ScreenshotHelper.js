import path from 'path';
import fs from 'fs';
import { DateTimeHelper, FileHelper, logger } from "./Index";


/**
 * Utility class để quản lý screenshot
 */
class ScreenshotHelper {
    /**
     * Khởi tạo ScreenshotHelper
     * @param {Object} options - Tùy chọn cho screenshot helper
     * @param {string} options.screenshotDir - Thư mục lưu screenshot
     * @param {string} options.fileNamePattern - Mẫu tên file screenshot
     */
    constructor(options = {}) {
        this.options = {
            screenshotDir: './screenshots',
            fileNamePattern: '{testName}_{timestamp}',
            ...options
        };

        // Tạo thư mục screenshots nếu chưa tồn tại
        FileHelper.createDirectory(this.options.screenshotDir);
    }

    /**
     * Tạo tên file screenshot dựa trên mẫu
     * @param {string} testName - Tên test case
     * @returns {string} - Tên file screenshot
     */
    generateFileName(testName) {
        const timestamp = DateTimeHelper.getCurrentDate('YYYYMMDD_HHmmss');

        return this.options.fileNamePattern
            .replace('{testName}', testName.replace(/\s+/g, '_'))
            .replace('{timestamp}', timestamp)
            .replace(/[^\w\-\.]/g, '_') + '.png';
    }

    /**
     * Chụp screenshot
     * @param {Page} page - Đối tượng Page của Playwright
     * @param {string} testName - Tên test case
     * @param {Object} options - Tùy chọn cho screenshot
     * @returns {Promise<string>} - Đường dẫn đến file screenshot
     */
    async takeScreenshot(page, testName, options = {}) {
        try {
            const fileName = this.generateFileName(testName);
            const filePath = path.join(this.options.screenshotDir, fileName);

            logger.debug(`Chụp screenshot: ${filePath}`);

            // Chụp screenshot với Playwright
            await page.screenshot({
                path: filePath,
                fullPage: options.fullPage !== undefined ? options.fullPage : true,
                ...options
            });

            logger.info(`Đã lưu screenshot: ${filePath}`);
            return filePath;
        } catch (error) {
            logger.error(`Lỗi khi chụp screenshot cho test: ${testName}`, error);
            throw error;
        }
    }

    /**
     * Chụp screenshot khi test thất bại
     * @param {Page} page - Đối tượng Page của Playwright
     * @param {string} testName - Tên test case
     * @returns {Promise<string>} - Đường dẫn đến file screenshot
     */
    async takeFailureScreenshot(page, testName) {
        const failureDir = path.join(this.options.screenshotDir, 'failures');
        FileHelper.createDirectory(failureDir);

        const fileName = this.generateFileName(`FAILED_${testName}`);
        const filePath = path.join(failureDir, fileName);

        logger.debug(`Chụp screenshot khi test thất bại: ${filePath}`);

        try {
            // Chụp screenshot với Playwright
            await page.screenshot({
                path: filePath,
                fullPage: true
            });

            logger.info(`Đã lưu screenshot khi test thất bại: ${filePath}`);
            return filePath;
        } catch (error) {
            logger.error(`Lỗi khi chụp screenshot khi test thất bại: ${testName}`, error);
            return null;
        }
    }

    /**
     * Chụp screenshot và thêm vào Allure report
     * @param {Page} page - Đối tượng Page của Playwright
     * @param {string} testName - Tên test case
     * @param {Object} options - Tùy chọn cho screenshot
     * @returns {Promise<string>} - Đường dẫn đến file screenshot
     */
    async takeScreenshotForAllure(page, testName, options = {}) {
        try {
            // Chụp screenshot
            const screenshotPath = await this.takeScreenshot(page, testName, options);

            // Thêm vào Allure report
            const screenshotBuffer = fs.readFileSync(screenshotPath);
            const allure = global.allure;

            if (allure) {
                allure.attachment(
                    `Screenshot - ${testName}`,
                    screenshotBuffer,
                    'image/png'
                );
                logger.debug(`Đã thêm screenshot vào Allure report: ${testName}`);
            } else {
                logger.warn('Allure không khả dụng, không thể thêm screenshot vào report');
            }

            return screenshotPath;
        } catch (error) {
            logger.error(`Lỗi khi chụp screenshot cho Allure: ${testName}`, error);
            return null;
        }
    }

    /**
     * Xóa tất cả screenshot cũ
     * @param {number} olderThanDays - Xóa screenshot cũ hơn số ngày (mặc định: 7)
     * @returns {number} - Số file đã xóa
     */
    cleanupOldScreenshots(olderThanDays = 7) {
        try {
            logger.info(`Xóa screenshot cũ hơn ${olderThanDays} ngày`);

            const screenshotDir = this.options.screenshotDir;
            if (!fs.existsSync(screenshotDir)) {
                logger.debug(`Thư mục screenshot không tồn tại: ${screenshotDir}`);
                return 0;
            }

            const now = new Date();
            const files = fs.readdirSync(screenshotDir);
            let deletedCount = 0;

            for (const file of files) {
                if (!file.endsWith('.png')) continue;

                const filePath = path.join(screenshotDir, file);
                const stats = fs.statSync(filePath);
                const fileDate = new Date(stats.mtime);

                // Tính số ngày giữa ngày hiện tại và ngày tạo file
                const diffDays = Math.floor((now - fileDate) / (1000 * 60 * 60 * 24));

                if (diffDays > olderThanDays) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    logger.debug(`Đã xóa screenshot cũ: ${filePath}`);
                }
            }

            logger.info(`Đã xóa ${deletedCount} screenshot cũ`);
            return deletedCount;
        } catch (error) {
            logger.error('Lỗi khi xóa screenshot cũ', error);
            return 0;
        }
    }

    /**
     * Tạo một instance ScreenshotHelper mới với thư mục tùy chỉnh
     * @param {string} screenshotDir - Thư mục lưu screenshot
     * @returns {ScreenshotHelper} - Instance ScreenshotHelper mới
     */
    static createWithCustomDir(screenshotDir) {
        return new ScreenshotHelper({ screenshotDir });
    }
}

// Export class ScreenshotHelper
export default ScreenshotHelper;
