import axios from 'axios';
import { logger } from './Logger';

/**
 * Utility class để thực hiện các request API
 */
class ApiHelper {
    /**
     * Khởi tạo ApiHelper với các tùy chọn
     * @param {Object} options - Tùy chọn cho API helper
     * @param {string} options.baseUrl - URL cơ sở cho API
     * @param {Object} options.headers - Headers mặc định cho request
     * @param {number} options.timeout - Timeout cho request (ms)
     */
    constructor(options = {}) {
        this.options = {
            baseUrl: '',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            ...options
        };

        // Khởi tạo axios instance với các tùy chọn
        this.api = axios.create({
            baseURL: this.options.baseUrl,
            headers: this.options.headers,
            timeout: this.options.timeout
        });

        // Thêm interceptor để log request và response
        this.setupInterceptors();
    }

    /**
     * Thiết lập interceptors để log request và response
     */
    setupInterceptors() {
        // Request interceptor
        this.api.interceptors.request.use(
            config => {
                logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
                    headers: config.headers,
                    data: config.data
                });
                return config;
            },
            error => {
                logger.error('API Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            response => {
                logger.debug(`API Response: ${response.status} ${response.statusText}`, {
                    data: response.data,
                    headers: response.headers
                });
                return response;
            },
            error => {
                if (error.response) {
                    logger.error(`API Error Response: ${error.response.status}`, {
                        data: error.response.data,
                        headers: error.response.headers
                    });
                } else if (error.request) {
                    logger.error('API No Response:', error.request);
                } else {
                    logger.error('API Request Setup Error:', error.message);
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Thêm token xác thực vào headers
     * @param {string} token - Token xác thực
     */
    setAuthToken(token) {
        this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        logger.debug('Auth token set for API requests');
    }

    /**
     * Xóa token xác thực khỏi headers
     */
    clearAuthToken() {
        delete this.api.defaults.headers.common['Authorization'];
        logger.debug('Auth token cleared from API requests');
    }

    /**
     * Thực hiện GET request
     * @param {string} url - URL endpoint
     * @param {Object} params - Query parameters
     * @param {Object} config - Cấu hình bổ sung cho request
     * @returns {Promise<Object>} - Response data
     */
    async get(url, params = {}, config = {}) {
        try {
            const response = await this.api.get(url, { ...config, params });
            return response.data;
        } catch (error) {
            logger.error(`GET request failed: ${url}`, error);
            throw error;
        }
    }

    /**
     * Thực hiện POST request
     * @param {string} url - URL endpoint
     * @param {Object} data - Request body
     * @param {Object} config - Cấu hình bổ sung cho request
     * @returns {Promise<Object>} - Response data
     */
    async post(url, data = {}, config = {}) {
        try {
            const response = await this.api.post(url, data, config);
            return response.data;
        } catch (error) {
            logger.error(`POST request failed: ${url}`, error);
            throw error;
        }
    }

    /**
     * Thực hiện PUT request
     * @param {string} url - URL endpoint
     * @param {Object} data - Request body
     * @param {Object} config - Cấu hình bổ sung cho request
     * @returns {Promise<Object>} - Response data
     */
    async put(url, data = {}, config = {}) {
        try {
            const response = await this.api.put(url, data, config);
            return response.data;
        } catch (error) {
            logger.error(`PUT request failed: ${url}`, error);
            throw error;
        }
    }

    /**
     * Thực hiện PATCH request
     * @param {string} url - URL endpoint
     * @param {Object} data - Request body
     * @param {Object} config - Cấu hình bổ sung cho request
     * @returns {Promise<Object>} - Response data
     */
    async patch(url, data = {}, config = {}) {
        try {
            const response = await this.api.patch(url, data, config);
            return response.data;
        } catch (error) {
            logger.error(`PATCH request failed: ${url}`, error);
            throw error;
        }
    }

    /**
     * Thực hiện DELETE request
     * @param {string} url - URL endpoint
     * @param {Object} config - Cấu hình bổ sung cho request
     * @returns {Promise<Object>} - Response data
     */
    async delete(url, config = {}) {
        try {
            const response = await this.api.delete(url, config);
            return response.data;
        } catch (error) {
            logger.error(`DELETE request failed: ${url}`, error);
            throw error;
        }
    }

    /**
     * Tạo một instance ApiHelper mới với URL cơ sở
     * @param {string} baseUrl - URL cơ sở cho API
     * @returns {ApiHelper} - Instance ApiHelper mới
     */
    static createWithBaseUrl(baseUrl) {
        return new ApiHelper({ baseUrl });
    }
}

// Export class ApiHelper
export default ApiHelper;
