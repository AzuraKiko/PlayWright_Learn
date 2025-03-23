import { chromium, firefox } from 'playwright';
import { test as base, expect } from '@playwright/test';

class BaseTest {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    /**
     * Thiết lập trình duyệt và trang
     * @param {Object} options - Tùy chọn thiết lập
     * @param {string} options.url - URL để điều hướng đến
     * @param {string} options.browserType - Loại trình duyệt ('chromium', 'firefox', 'edge')
     * @param {boolean} options.headless - Chạy ở chế độ headless
     * @param {Object} options.contextOptions - Tùy chọn cho browser context
     * @param {Object} options.launchOptions - Tùy chọn bổ sung cho việc khởi chạy trình duyệt
     * @returns {Promise<void>}
     */
    async setup(options = {}) {
        const {
            url = 'https://wts.finavi.com.vn/',
            browserType = 'chromium',
            headless = false,
            contextOptions = { viewport: null },
            launchOptions = {}
        } = options;

        console.log(`Setup: Mở trình duyệt ${browserType} và vào trang ${url}`);

        try {
            // Chọn loại trình duyệt
            let browserLauncher;
            let launchOpts = { headless, ...launchOptions };

            switch (browserType.toLowerCase()) {
                case 'firefox':
                    browserLauncher = firefox;
                    break;
                case 'edge':
                    browserLauncher = chromium;
                    launchOpts.channel = 'msedge'; // Sử dụng channel msedge cho Edge
                    break;
                case 'chromium':
                default:
                    browserLauncher = chromium;
                    break;
            }

            // Khởi chạy trình duyệt
            this.browser = await browserLauncher.launch(launchOpts);

            // Tạo context
            this.context = await this.browser.newContext(contextOptions);

            // Tạo trang mới
            this.page = await this.context.newPage();

            // Điều hướng đến URL
            await this.page.goto(url);
        } catch (error) {
            console.error('Lỗi trong quá trình setup:', error);
            // Đảm bảo dọn dẹp tài nguyên nếu có lỗi
            await this.teardown();
            throw error;
        }
    }

    /**
     * Dọn dẹp tài nguyên
     * @returns {Promise<void>}
     */
    async teardown() {
        console.log('Teardown: Đóng trình duyệt');
        try {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
                this.context = null;
                this.page = null;
            }
        } catch (error) {
            console.error('Lỗi trong quá trình teardown:', error);
        }
    }
}

// Tạo test fixture linh hoạt hơn
const test = base.extend({
    baseTest: async ({ }, use, testInfo) => {
        const baseTest = new BaseTest();

        // Lấy tùy chọn từ project config hoặc sử dụng giá trị mặc định
        const options = {
            url: testInfo.project.use?.baseURL || 'https://wts.finavi.com.vn/',
            browserType: testInfo.project.use?.browserName || 'chromium',
            headless: testInfo.project.use?.headless || false,
            contextOptions: {
                viewport: null,
                // Có thể thêm các tùy chọn khác như geolocation, permissions, v.v.
            }
        };

        await baseTest.setup(options);
        await use(baseTest);
        await baseTest.teardown();
    }
});

export { test, expect };