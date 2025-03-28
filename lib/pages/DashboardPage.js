import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';

/**
 * Page object cho trang dashboard
 */
class DashboardPage extends BasePage {
    /**
     * Khởi tạo DashboardPage
     * @param {Page} page - Đối tượng Page của Playwright
     */
    constructor(page) {
        super(page);
        this.locators = Locators.Dashboard;
    }

    /**
     * Kiểm tra xem trang dashboard đã được tải hoàn toàn chưa
     * @returns {Promise<boolean>} - True nếu trang đã tải hoàn toàn, false nếu không
     */
    async isLoaded() {
        return await this.isElementVisible(this.locators.welcomeMessage);
    }

    /**
     * Lấy nội dung thông báo chào mừng
     * @returns {Promise<string>} - Nội dung thông báo chào mừng
     */
    async getWelcomeMessage() {
        return await this.getElementText(this.locators.welcomeMessage);
    }

    /**
     * Đăng xuất khỏi hệ thống
     */
    async logout() {
        await this.page.click(this.locators.logoutButton);
        await this.waitForPageLoad();
    }

    /**
     * Mở trang profile
     */
    async openProfile() {
        await this.page.click(this.locators.userProfile);
        await this.waitForPageLoad();
    }

    /**
     * Kiểm tra xem có thông báo mới không
     * @returns {Promise<boolean>} - True nếu có thông báo mới, false nếu không
     */
    async hasNewNotifications() {
        const notificationElement = await this.page.$(this.locators.notificationIcon);
        if (!notificationElement) return false;

        // Kiểm tra xem có badge thông báo không
        const hasBadge = await this.page.evaluate(selector => {
            const element = document.querySelector(selector);
            return element.classList.contains('has-notification') ||
                element.getAttribute('data-count') !== '0';
        }, this.locators.notificationIcon);

        return hasBadge;
    }
}

export default DashboardPage;