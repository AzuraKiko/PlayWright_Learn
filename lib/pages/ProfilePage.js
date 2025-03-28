import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';

/**
 * Page object cho trang profile
 */
class ProfilePage extends BasePage {
    /**
     * Khởi tạo ProfilePage
     * @param {Page} page - Đối tượng Page của Playwright
     */
    constructor(page) {
        super(page);
        this.locators = Locators.Profile;
    }

    /**
     * Cập nhật thông tin profile
     * @param {Object} profileData - Dữ liệu profile cần cập nhật
     * @param {string} profileData.name - Tên người dùng
     * @param {string} profileData.email - Email người dùng
     */
    async updateProfile(profileData) {
        const { name, email } = profileData;

        if (name) {
            await this.page.fill(this.locators.nameInput, name);
        }

        if (email) {
            await this.page.fill(this.locators.emailInput, email);
        }

        await this.scrollToElementByJS(this.locators.saveButton);
        await this.page.click(this.locators.saveButton);

        // Đợi cho đến khi trang được tải lại sau khi lưu
        await this.waitForPageLoad();
    }

    /**
     * Tải lên avatar mới
     * @param {string} filePath - Đường dẫn đến file ảnh
     */
    async uploadAvatar(filePath) {
        await this.page.setInputFiles(this.locators.avatarUpload, filePath);

        // Đợi cho đến khi tải lên hoàn tất
        await this.page.waitForSelector('.avatar-preview', { state: 'visible' });
    }

    /**
     * Lấy giá trị hiện tại của trường tên
     * @returns {Promise<string>} - Giá trị hiện tại của trường tên
     */
    async getCurrentName() {
        return await this.page.inputValue(this.locators.nameInput);
    }

    /**
     * Lấy giá trị hiện tại của trường email
     * @returns {Promise<string>} - Giá trị hiện tại của trường email
     */
    async getCurrentEmail() {
        return await this.page.inputValue(this.locators.emailInput);
    }
}

export default ProfilePage;