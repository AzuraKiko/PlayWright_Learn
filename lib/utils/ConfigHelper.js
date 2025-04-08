import fs from 'fs';
import path from 'path';
import { logger } from './Logger';

/**
 * Utility class để quản lý cấu hình
 */
class ConfigHelper {
    /**
     * Khởi tạo ConfigHelper
     * @param {string} configPath - Đường dẫn đến file cấu hình (mặc định: config.json)
     */
    constructor(configPath = 'config.json') {
        this.configPath = configPath;
        this.config = {};
        this.loadConfig();
    }

    /**
     * Đọc file cấu hình
     */
    loadConfig() {
        try {
            const absolutePath = path.resolve(this.configPath);

            if (fs.existsSync(absolutePath)) {
                const configData = fs.readFileSync(absolutePath, 'utf8');
                this.config = JSON.parse(configData);
                logger.debug(`Đã đọc cấu hình từ: ${absolutePath}`);
            } else {
                logger.warn(`File cấu hình không tồn tại: ${absolutePath}`);
            }
        } catch (error) {
            logger.error(`Lỗi khi đọc file cấu hình: ${this.configPath}`, error);
            throw error;
        }
    }

    /**
     * Lưu cấu hình vào file
     */
    saveConfig() {
        try {
            const absolutePath = path.resolve(this.configPath);

            // Tạo thư mục nếu chưa tồn tại
            const dir = path.dirname(absolutePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const configData = JSON.stringify(this.config, null, 2);
            fs.writeFileSync(absolutePath, configData, 'utf8');
            logger.debug(`Đã lưu cấu hình vào: ${absolutePath}`);
        } catch (error) {
            logger.error(`Lỗi khi lưu file cấu hình: ${this.configPath}`, error);
            throw error;
        }
    }

    /**
     * Lấy giá trị cấu hình
     * @param {string} key
     * @param {any} defaultValue - Giá trị mặc định nếu không tìm thấy
     * @returns {any} - Giá trị cấu hình
     */
    get(key, defaultValue = null) {
        // Hỗ trợ nested keys (vd: 'database.host')
        const keys = key.split('.');
        let value = this.config;

        for (const k of keys) {
            if (value === undefined || value === null || typeof value !== 'object') {
                return defaultValue;
            }
            value = value[k];
        }

        return value !== undefined ? value : defaultValue;
    }

    /**
     * Đặt giá trị cấu hình
     * @param {string} key
     * @param {any} value - Giá trị cấu hình
     * @param {boolean} save - Lưu vào file sau khi đặt giá trị (mặc định: false)
     */
    set(key, value, save = false) {
        // Hỗ trợ nested keys (vd: 'database.host')
        const keys = key.split('.');
        let current = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!current[k] || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }

        current[keys[keys.length - 1]] = value;

        if (save) {
            this.saveConfig();
        }
    }

    /**
     * Lấy toàn bộ cấu hình
     * @returns {Object} - Đối tượng cấu hình
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Đặt nhiều giá trị cấu hình cùng lúc
     * @param {Object} configObject - Đối tượng chứa các cấu hình
     * @param {boolean} save - Lưu vào file sau khi đặt giá trị (mặc định: false)
     */
    setMultiple(configObject, save = false) {
        this.config = {
            ...this.config,
            ...configObject
        };

        if (save) {
            this.saveConfig();
        }
    }

    /**
     * Xóa một khóa cấu hình
     * @param {string} key
     * @param {boolean} save - Lưu vào file sau khi xóa (mặc định: false)
     * @returns {boolean} - True nếu xóa thành công
     */
    remove(key, save = false) {
        // Hỗ trợ nested keys (vd: 'database.host')
        const keys = key.split('.');
        let current = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!current[k] || typeof current[k] !== 'object') {
                return false;
            }
            current = current[k];
        }

        const lastKey = keys[keys.length - 1];
        if (!(lastKey in current)) {
            return false;
        }

        delete current[lastKey];

        if (save) {
            this.saveConfig();
        }

        return true;
    }

    /**
     * Đặt lại cấu hình về mặc định
     * @param {Object} defaultConfig - Cấu hình mặc định
     * @param {boolean} save - Lưu vào file sau khi đặt lại (mặc định: true)
     */
    reset(defaultConfig = {}, save = true) {
        this.config = { ...defaultConfig };

        if (save) {
            this.saveConfig();
        }
    }

    /**
     * Lấy cấu hình cho môi trường cụ thể
     * @param {string} env - Tên môi trường (vd: 'dev', 'test', 'prod')
     * @returns {Object} - Cấu hình cho môi trường
     */
    getEnvConfig(env) {
        const envConfig = this.get(`environments.${env}`);

        if (!envConfig) {
            logger.warn(`Không tìm thấy cấu hình cho môi trường: ${env}`);
            return {};
        }

        // Kết hợp cấu hình chung và cấu hình môi trường
        return {
            ...this.getAll(),
            ...envConfig
        };
    }

    /**
     * Lấy cấu hình dựa trên biến môi trường NODE_ENV
     * @returns {Object} - Cấu hình cho môi trường hiện tại
     */
    getCurrentEnvConfig() {
        const env = process.env.NODE_ENV || 'development';
        return this.getEnvConfig(env);
    }

    /**
     * Tạo một instance ConfigHelper mới với đường dẫn file cấu hình
     * @param {string} configPath - Đường dẫn đến file cấu hình
     * @returns {ConfigHelper} - Instance ConfigHelper mới
     */
    static createWithPath(configPath) {
        return new ConfigHelper(configPath);
    }

    /**
     * Tạo một instance ConfigHelper mới với cấu hình mặc định
     * @param {Object} defaultConfig - Cấu hình mặc định
     * @param {string} configPath - Đường dẫn đến file cấu hình
     * @returns {ConfigHelper} - Instance ConfigHelper mới
     */
    static createWithDefaults(defaultConfig, configPath = 'config.json') {
        const configHelper = new ConfigHelper(configPath);

        // Nếu file cấu hình không tồn tại hoặc rỗng, sử dụng cấu hình mặc định
        if (Object.keys(configHelper.config).length === 0) {
            configHelper.config = { ...defaultConfig };
            configHelper.saveConfig();
        }

        return configHelper;
    }
}

// Export class ConfigHelper
export default ConfigHelper;
