import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';

/**
 * Component cho header
 */
class Header extends BasePage {
    /**
     * Khởi tạo Header
     * @param {Page} page - Đối tượng Page của Playwright
     */
    constructor(page) {
        super(page);
        this.locators = Locators.Common;
    }

    /**
     * Nhấp vào logo để về trang chủ
     */
    async clickLogo() {
        await this.page.click(this.locators.logo);
        await this.waitForPageLoad();
    }

    /**
     * Kiểm tra xem header có hiển thị không
     * @returns {Promise<boolean>} - True nếu header hiển thị, false nếu không
     */
    async isVisible() {
        return await this.isElementVisible(this.locators.header);
    }
}

export default Header;