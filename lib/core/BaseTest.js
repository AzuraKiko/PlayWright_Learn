import { chromium, firefox } from 'playwright';
import { test as base, expect } from '@playwright/test';
import BasePage from './BasePage.js';
import PageFactory from '../utils/PageFactory';


class BaseTest extends BasePage {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.basePage = null;
        this.pageFactory = null;
    }

    async setup(options = {}) {
        const {
            url = "https://portal-tradeforgood-dev2.equix.app/login",
            browserType = "chromium",
            headless = false,
            contextOptions = { viewport: null },
            launchOptions = {}
        } = options;

        if (!url) {
            throw new Error('URL is undefined. Please provide a valid URL.');
        }

        console.log(`Setup: Mở trình duyệt ${browserType} và vào trang ${url}`);

        try {
            // Chọn loại trình duyệt
            let browserLauncher;
            // Thêm tham số --start-maximized để mở toàn màn hình
            let launchOpts = {
                headless,
                args: ['--start-maximized'],
                ...launchOptions
            };

            switch (browserType) {
                case 'firefox':
                    browserLauncher = firefox;
                    // Firefox sử dụng tham số khác để maximize
                    launchOpts.args = ['--kiosk'];
                    break;
                case 'edge':
                    browserLauncher = chromium;
                    launchOpts.channel = 'msedge';
                    break;
                case 'chromium':
                default:
                    browserLauncher = chromium;
                    break;
            }

            // Khởi chạy trình duyệt với slowMo để không đóng ngay
            this.browser = await browserLauncher.launch({
                ...launchOpts,
                slowMo: 1000 // Làm chậm các thao tác để dễ quan sát
            });

            // Tạo context với viewport: null để cho phép trình duyệt tự điều chỉnh kích thước
            this.context = await this.browser.newContext({
                ...contextOptions,
                viewport: null
            });

            // Tạo trang mới
            this.page = await this.context.newPage();

            // Khởi tạo PageFactory
            this.pageFactory = new PageFactory(this.page)

            // Điều hướng đến URL
            // await this.page.goto(url);
            await this.navigateTo(url);

            // Thêm bước maximize window sau khi trang đã load
            await this.page.evaluate(() => {
                window.moveTo(0, 0);
                window.resizeTo(screen.width, screen.height);
            });

        } catch (error) {
            console.error('Lỗi trong quá trình setup:', error);
            throw error;
        }
    }

    // async teardown() {
    //     console.log('Teardown: Đóng trình duyệt');
    //     try {
    //         if (this.browser) {
    //             await this.browser.close();
    //             this.browser = null;
    //             this.context = null;
    //             this.page = null;
    //         }
    //     } catch (error) {
    //         console.error('Lỗi trong quá trình teardown:', error);
    //     }
    // }
}

// Tạo test fixture sử dụng cấu hình từ testInfo
const test = base.extend({
    baseTest: async ({ }, use, testInfo) => {
        const baseTest = new BaseTest();

        const options = {
            url: testInfo.project.use?.baseURL,
            browserType: testInfo.project.use?.name,
            headless: testInfo.project.use?.headless,
            contextOptions: {
                viewport: null, // Đảm bảo viewport là null
            },
            launchOptions: {
                ...(testInfo.project.use.launchOptions || {}),
                args: ['--start-maximized'] // Thêm tham số maximize
            }
        };

        await baseTest.setup(options);
        await use(baseTest);

        // // Thêm một bước chờ để trình duyệt không đóng
        // if (!process.env.CI) { // Chỉ thực hiện khi không chạy trong CI
        //     console.log('Giữ trình duyệt mở. Nhấn Ctrl+C để kết thúc.');
        //     await new Promise(() => { }); // Promise không bao giờ resolve để giữ trình duyệt mở
        // }
        // await baseTest.teardown();
    }
});

export { test, expect };
