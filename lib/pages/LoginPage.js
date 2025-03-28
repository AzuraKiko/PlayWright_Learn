import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';
import { timeout } from '../constants/Constants';


/**
 * Page object cho trang đăng nhập
 */
class LoginPage extends BasePage {
    /**
     * Khởi tạo LoginPage
     * @param {Page} page - Đối tượng Page của Playwright
     */
    constructor(page) {
        super(page);
        this.locators = Locators.Login;
    }

    /**
     * Đăng nhập vào hệ thống
     * @param {string} username - Tên đăng nhập
     * @param {string} password - Mật khẩu
     */
    async login(username, password) {
        await this.page.fill(this.locators.usernameInput, username);
        await this.page.fill(this.locators.passwordInput, password);

        // Sử dụng phương thức từ BasePage để cuộn đến nút đăng nhập
        await this.scrollToElementByJS(this.loginButton, { timeout: timeout.MEDIUM });

        await this.page.click(this.locators.loginButton);

        // Đợi cho đến khi trang được tải hoàn toàn sau khi đăng nhập
        await this.waitForPageLoad();
    }

    /**
     * Kiểm tra xem thông báo lỗi có hiển thị không
     * @returns {Promise<boolean>} - True nếu thông báo lỗi hiển thị, false nếu không
     */
    async isErrorMessageVisible() {
        return await this.isElementVisible(this.locators.errorMessage);
    }

    /**
     * Lấy nội dung thông báo lỗi
     * @returns {Promise<string>} - Nội dung thông báo lỗi
     */
    async getErrorMessage() {
        return await this.getElementText(this.locators.errorMessage);
    }

    /**
     * Nhấp vào liên kết quên mật khẩu
     */
    async clickForgotPassword() {
        await this.page.click(this.locators.forgotPasswordLink);
        await this.waitForPageLoad();
    }

    /**
     * Đánh dấu vào checkbox "Ghi nhớ đăng nhập"
     * @param {boolean} check - True để đánh dấu, false để bỏ đánh dấu
     */
    async setRememberMe(check = true) {
        const isChecked = await this.page.isChecked(this.locators.rememberMeCheckbox);

        if ((check && !isChecked) || (!check && isChecked)) {
            await this.page.click(this.locators.rememberMeCheckbox);
        }
    }
}

export default LoginPage;