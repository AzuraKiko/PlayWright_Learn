import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';

/**
 * Factory để quản lý các page object
 */
class PageFactory {
    /**
     * Khởi tạo PageFactory
     * @param {Page} page - Đối tượng Page của Playwright
     */
    constructor(page) {
        this.page = page;
        this.pages = {};
    }

    /**
     * Lấy instance của một Page Object
     * @param {string} pageType - Loại Page Object cần lấy
     * @returns {BasePage} - Instance của Page Object
     */
    getPage(pageType) {
        if (!this.pages[pageType]) {
            switch (pageType) {
                case 'login':
                    this.pages[pageType] = new LoginPage(this.page);
                    break;
                case 'dashboard':
                    this.pages[pageType] = new DashboardPage(this.page);
                    break;
                case 'profile':
                    this.pages[pageType] = new ProfilePage(this.page);
                    break;
                // Thêm các loại Page Object khác
                default:
                    throw new Error(`Page type "${pageType}" is not supported`);
            }
        }

        return this.pages[pageType];
    }
}

export default PageFactory;
