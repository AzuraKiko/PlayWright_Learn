/**
 * Utility class để ghi log trong quá trình thực thi test
 */
class Logger {
    /**
     * Khởi tạo Logger với các tùy chọn
     * @param {Object} options - Tùy chọn cho logger
     * @param {boolean} options.showTimestamp - Hiển thị timestamp trong log
     * @param {boolean} options.showLogLevel - Hiển thị log level trong log
     * @param {string} options.logLevel - Log level tối thiểu ('debug', 'info', 'warn', 'error')
     */
    constructor(options = {}) {
        this.options = {
            showTimestamp: true,
            showLogLevel: true,
            logLevel: 'info',
            ...options
        };

        // Định nghĩa các log level và thứ tự ưu tiên
        this.logLevels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };

        // Định nghĩa màu cho các log level
        this.colors = {
            reset: '\x1b[0m',
            debug: '\x1b[36m', // Cyan
            info: '\x1b[32m',  // Green
            warn: '\x1b[33m',  // Yellow
            error: '\x1b[31m', // Red
            timestamp: '\x1b[90m' // Gray
        };
    }

    /**
     * Kiểm tra xem log level có đủ cao để hiển thị không
     * @param {string} level - Log level cần kiểm tra
     * @returns {boolean} - True nếu log level đủ cao để hiển thị
     */
    shouldLog(level) {
        return this.logLevels[level] >= this.logLevels[this.options.logLevel];
    }

    /**
     * Lấy timestamp hiện tại
     * @returns {string} - Timestamp dạng chuỗi
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString();
    }

    /**
     * Định dạng message log
     * @param {string} level - Log level
     * @param {string} message - Nội dung log
     * @returns {string} - Message đã được định dạng
     */
    formatMessage(level, message) {
        let formattedMessage = '';

        // Thêm timestamp nếu được cấu hình
        if (this.options.showTimestamp) {
            formattedMessage += `${this.colors.timestamp}[${this.getTimestamp()}]${this.colors.reset} `;
        }

        // Thêm log level nếu được cấu hình
        if (this.options.showLogLevel) {
            formattedMessage += `${this.colors[level]}[${level.toUpperCase()}]${this.colors.reset} `;
        }

        // Thêm nội dung log
        formattedMessage += message;

        return formattedMessage;
    }

    /**
     * Ghi log với level debug
     * @param {string} message - Nội dung log
     * @param {Object} data - Dữ liệu bổ sung (optional)
     */
    debug(message, data) {
        if (!this.shouldLog('debug')) return;

        let logMessage = this.formatMessage('debug', message);

        if (data) {
            console.debug(logMessage);
            console.debug(data);
        } else {
            console.debug(logMessage);
        }
    }

    /**
     * Ghi log với level info
     * @param {string} message - Nội dung log
     * @param {Object} data - Dữ liệu bổ sung (optional)
     */
    info(message, data) {
        if (!this.shouldLog('info')) return;

        let logMessage = this.formatMessage('info', message);

        if (data) {
            console.info(logMessage);
            console.info(data);
        } else {
            console.info(logMessage);
        }
    }

    /**
     * Ghi log với level warn
     * @param {string} message - Nội dung log
     * @param {Object} data - Dữ liệu bổ sung (optional)
     */
    warn(message, data) {
        if (!this.shouldLog('warn')) return;

        let logMessage = this.formatMessage('warn', message);

        if (data) {
            console.warn(logMessage);
            console.warn(data);
        } else {
            console.warn(logMessage);
        }
    }

    /**
     * Ghi log với level error
     * @param {string} message - Nội dung log
     * @param {Error|Object} error - Đối tượng lỗi hoặc dữ liệu bổ sung (optional)
     */
    error(message, error) {
        if (!this.shouldLog('error')) return;

        let logMessage = this.formatMessage('error', message);

        if (error) {
            console.error(logMessage);
            if (error instanceof Error) {
                console.error(`${this.colors.error}${error.stack || error.message}${this.colors.reset}`);
            } else {
                console.error(error);
            }
        } else {
            console.error(logMessage);
        }
    }

    /**
     * Ghi log cho bước test
     * @param {string} stepName - Tên của bước test
     * @param {string} description - Mô tả chi tiết (optional)
     */
    step(stepName, description) {
        if (!this.shouldLog('info')) return;

        const stepMessage = `${this.colors.info}[STEP]${this.colors.reset} ${stepName}`;
        console.info(this.formatMessage('info', stepMessage));

        if (description) {
            console.info(`       ${description}`);
        }
    }

    /**
     * Ghi log cho kết quả test
     * @param {string} testName - Tên của test case
     * @param {boolean} passed - Kết quả test (pass/fail)
     * @param {Object} details - Chi tiết bổ sung (optional)
     */
    testResult(testName, passed, details) {
        const level = passed ? 'info' : 'error';
        const status = passed ? 'PASSED' : 'FAILED';
        const color = passed ? this.colors.info : this.colors.error;

        const resultMessage = `${color}[${status}]${this.colors.reset} ${testName}`;
        console[level](this.formatMessage(level, resultMessage));

        if (details) {
            console[level](details);
        }
    }

    /**
     * Ghi log cho thông tin hiệu suất
     * @param {string} operation - Tên của thao tác
     * @param {number} timeInMs - Thời gian thực hiện (ms)
     */
    performance(operation, timeInMs) {
        if (!this.shouldLog('debug')) return;

        const perfMessage = `${this.colors.debug}[PERF]${this.colors.reset} ${operation}: ${timeInMs}ms`;
        console.debug(this.formatMessage('debug', perfMessage));
    }

    /**
     * Tạo một instance Logger mới với cấu hình mặc định
     * @returns {Logger} - Instance Logger mới
     */
    static createDefaultLogger() {
        return new Logger();
    }

    /**
     * Tạo một instance Logger mới với log level debug
     * @returns {Logger} - Instance Logger mới
     */
    static createDebugLogger() {
        return new Logger({ logLevel: 'debug' });
    }

    /**
     * Tạo một instance Logger mới với log level error
     * @returns {Logger} - Instance Logger mới
     */
    static createErrorOnlyLogger() {
        return new Logger({ logLevel: 'error' });
    }
}

// Tạo và export một instance Logger mặc định
export const logger = new Logger();

// Export class Logger để có thể tạo instance tùy chỉnh
export default Logger;
