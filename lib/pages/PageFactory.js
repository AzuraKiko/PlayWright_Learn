
import { LoginPage, UsersPage } from './Index';
import { logger } from '../utils/Index';
import Sidebar from '../../lib/components/Sidebar';
import Paging from '../../lib/components/Paging';

/**
 * Factory class để quản lý và khởi tạo các Page Objects
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
     * @param {string} pageName - Tên của Page Object
     * @returns {Object} - Instance của Page Object
     */
    getPage(pageName) {
        // Nếu page đã được khởi tạo, trả về instance đã có
        if (this.pages[pageName]) {
            return this.pages[pageName];
        }

        // Khởi tạo page mới dựa trên tên
        switch (pageName.toLowerCase()) {
            case 'login':
                this.pages[pageName] = new LoginPage(this.page);
                break;
            case 'users':
                this.pages[pageName] = new UsersPage(this.page);
                break;
            case 'sidebar':
                this.pages[pageName] = new Sidebar(this.page);
                break;
            case 'paging':
                this.pages[pageName] = new Paging(this.page);
                break;
            default:
                logger.error(`Page không được hỗ trợ: ${pageName}`);
                throw new Error(`Page không được hỗ trợ: ${pageName}`);
        }

        logger.debug(`Đã khởi tạo page: ${pageName}`);
        return this.pages[pageName];
    }

    /**
     * Lấy LoginPage
     * @returns {LoginPage} - Instance của LoginPage
     */
    getLoginPage() {
        return this.getPage('login');
    }

    /**
 * Lấy UsersPage
 * @returns {UsersPage} - Instance của UsersPage
 */
    getUsersPage() {
        return this.getPage('users');
    }

    /**
     * Lấy Sidebar
     * @returns {Sidebar} - Instance của Sidebar
     */
    getSidebar() {
        return this.getPage('sidebar');
    }

    /**
     * Lấy Paging
     * @returns {Paging} - Instance của Paging
     */
    getPaging() {
        return this.getPage('paging');
    }
}

export default PageFactory;
