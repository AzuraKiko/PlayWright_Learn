import { logger } from "./Logger";

/** 
 * Utility class để làm việc với trình duyệt 
 */
class BrowserHelper {
    constructor(page) {
        this.page = page;
    }

    /**
     * Xóa tất cả cookie
     * @returns {Promise<void>}
     */
    async clearCookies() {
        try {
            const context = this.page.context();
            await context.clearCookies();
            logger.debug("Đã xóa tất cả cookie");
        } catch (error) {
            logger.error("Lỗi khi xóa cookie", error);
            throw error;
        }
    }

    /**
     * Đặt cookie
     * @param {Object} cookie - Cookie cần đặt
     * @returns {Promise<void>}
     */
    async setCookie(cookie) {
        try {
            const context = this.page.context();
            await context.addCookies([cookie]);
            logger.debug(`Đã đặt cookie: ${cookie.name}`);
        } catch (error) {
            logger.error(`Lỗi khi đặt cookie: ${cookie.name}`, error);
            throw error;
        }
    }

    /**
     * Lấy tất cả cookie
     * @returns {Promise<Array<Object>>} - Danh sách cookie
     */
    async getCookies() {
        try {
            const context = this.page.context();
            const cookies = await context.cookies();
            logger.debug(`Đã lấy ${cookies.length} cookie`);
            return cookies;
        } catch (error) {
            logger.error("Lỗi khi lấy cookie", error);
            throw error;
        }
    }

    /**
     * Xóa localStorage
     * @returns {Promise<void>}
     */
    async clearLocalStorage() {
        try {
            await this.page.evaluate(() => localStorage.clear());
            logger.debug("Đã xóa localStorage");
        } catch (error) {
            logger.error("Lỗi khi xóa localStorage", error);
            throw error;
        }
    }

    /**
     * Đặt giá trị vào localStorage
     * @param {string} key - Khóa
     * @param {string} value - Giá trị
     * @returns {Promise<void>}
     */
    async setLocalStorage(key, value) {
        try {
            await this.page.evaluate(
                ([k, v]) => {
                    localStorage.setItem(k, v);
                },
                [key, value]
            );
            logger.debug(`Đã đặt localStorage: ${key}`);
        } catch (error) {
            logger.error(`Lỗi khi đặt localStorage: ${key}`, error);
            throw error;
        }
    }

    /**
     * Lấy giá trị từ localStorage
     * @param {string} key - Khóa
     * @returns {Promise<string>} - Giá trị
     */
    async getLocalStorage(key) {
        try {
            const value = await this.page.evaluate((k) => localStorage.getItem(k), key);
            logger.debug(`Đã lấy localStorage: ${key}`);
            return value;
        } catch (error) {
            logger.error(`Lỗi khi lấy localStorage: ${key}`, error);
            throw error;
        }
    }

    /**
     * Xóa sessionStorage
     * @returns {Promise<void>}
     */
    async clearSessionStorage() {
        try {
            await this.page.evaluate(() => sessionStorage.clear());
            logger.debug("Đã xóa sessionStorage");
        } catch (error) {
            logger.error("Lỗi khi xóa sessionStorage", error);
            throw error;
        }
    }

    /**
     * Đặt giá trị vào sessionStorage
     * @param {string} key - Khóa
     * @param {string} value - Giá trị
     * @returns {Promise<void>}
     */
    async setSessionStorage(key, value) {
        try {
            await this.page.evaluate(
                ([k, v]) => {
                    sessionStorage.setItem(k, v);
                },
                [key, value]
            );
            logger.debug(`Đã đặt sessionStorage: ${key}`);
        } catch (error) {
            logger.error(`Lỗi khi đặt sessionStorage: ${key}`, error);
            throw error;
        }
    }

    /**
     * Lấy giá trị từ sessionStorage
     * @param {string} key - Khóa
     * @returns {Promise<string>} - Giá trị
     */
    async getSessionStorage(key) {
        try {
            const value = await this.page.evaluate((k) => sessionStorage.getItem(k), key);
            logger.debug(`Đã lấy sessionStorage: ${key}`);
            return value;
        } catch (error) {
            logger.error(`Lỗi khi lấy sessionStorage: ${key}`, error);
            throw error;
        }
    }

    /**
     * Chờ cho trang web tải xong
     * @param state - Trạng thái tải trang (mặc định: 'networkidle')
     * @param timeout - Thời gian chờ tối đa (ms)
     */
    async waitForPageLoad(state = "networkidle", timeout = 30000) {
        try {
            console.log(`Waiting for page to load with state: ${state}`);
            await this.page.waitForLoadState(state, { timeout });
            console.log(`Page loaded with state: ${state}`);
        } catch (error) {
            console.error(`Page load timeout: ${error.message}`);
            throw new Error(
                `Trang không tải xong với trạng thái "${state}" sau ${timeout}ms.`
            );
        }
    }

    /**
     * Điều hướng đến URL
     * @param {string} url - URL cần điều hướng đến
     * @returns {Promise<boolean>} - true nếu thành công, false nếu thất bại
     */
    async navigateTo(url) {
        try {
            logger.debug(`Chuyển hướng đến: ${url}`);
            await this.page.goto(url, {
                waitUntil: "networkidle",
                timeout: 30000,
            });
            return true;
        } catch (error) {
            console.error(`Lỗi khi điều hướng đến ${url}: ${error.message}`);
            return false;
        }
    }

    /**
     * Làm mới trang
     * @param {number} timeout - Thời gian chờ tối đa (ms)
     * @returns {Promise<void>}
     */
    async refreshPage(timeout = 30000) {
        try {
            logger.debug("Làm mới trang...");
            await this.page.reload({ timeout, waitUntil: "networkidle" });
            await this.waitForPageLoad();
        } catch (error) {
            logger.error("Lỗi khi làm mới trang", error);
            throw error;
        }
    }

    /**
     * Lấy URL hiện tại
     * @returns {string} - URL hiện tại
     */
    getCurrentUrl() {
        return this.page.url();
    }

    /**
     * Lấy tiêu đề trang
     * @returns {Promise<string>} - Tiêu đề trang
     */
    async getTitle() {
        return await this.page.title();
    }

    /**
     * Chuyển đến tab mới
     * @returns {Promise<Page>} - Đối tượng Page mới
     */
    async switchToNewTab(url) {
        try {
            const pagePromise = this.page.context().waitForEvent("page");
            const newPage = await pagePromise;
            await newPage.waitForLoadState("networkidle");

            if (url) {
                // Đợi cho đến khi URL của trang mới khớp với URL mong đợi
                await newPage.waitForURL(url, { timeout: 30000 });
                logger.debug(`Đã chuyển đến tab mới với URL: ${url}`);
            } else {
                logger.debug("Đã chuyển đến tab mới");
            }

            return newPage;
        } catch (error) {
            logger.error("Lỗi khi chuyển đến tab mới", error);
            throw error;
        }
    }


    /**
     * Đóng tab hiện tại
     * @returns {Promise<void>}
     */
    async closeCurrentTab() {
        try {
            await this.page.close();
            logger.debug("Đã đóng tab hiện tại");
        } catch (error) {
            logger.error("Lỗi khi đóng tab hiện tại", error);
            throw error;
        }
    }

    /**
     * Thực thi JavaScript trên trang
     * @param {string|Function} script - Script cần thực thi
     * @param {Array} args - Tham số cho script
     * @returns {Promise<any>} - Kết quả thực thi
     */
    async executeScript(script, args = []) {
        try {
            logger.debug("Thực thi JavaScript...");
            const result = await this.page.evaluate(script, ...args);
            logger.debug("Đã thực thi JavaScript");
            return result;
        } catch (error) {
            logger.error("Lỗi khi thực thi JavaScript", error);
            throw error;
        }
    }

    /**
     * Lấy kích thước cửa sổ trình duyệt
     * @returns {Promise<Object>} - Kích thước cửa sổ {width, height}
     */
    async getWindowSize() {
        try {
            const size = await this.page.evaluate(() => {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            });
            logger.debug(`Kích thước cửa sổ: ${size.width}x${size.height}`);
            return size;
        } catch (error) {
            logger.error("Lỗi khi lấy kích thước cửa sổ", error);
            throw error;
        }
    }

    /**
     * Đặt kích thước cửa sổ trình duyệt
     * @param {number} width - Chiều rộng
     * @param {number} height - Chiều cao
     * @returns {Promise<void>}
     */
    async setWindowSize(width, height) {
        try {
            await this.page.setViewportSize({ width, height });
            logger.debug(`Đã đặt kích thước cửa sổ: ${width}x${height}`);
        } catch (error) {
            logger.error(`Lỗi khi đặt kích thước cửa sổ: ${width}x${height}`, error);
            throw error;
        }
    }
}

export default BrowserHelper;
