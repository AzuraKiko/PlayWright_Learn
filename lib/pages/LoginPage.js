import DynamicLocators from '../locators/DynamicLocators';
import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';
import BrowserHelper from '../utils/BrowserHelper.js';
import WaitHelper from '../utils/WaitHelper.js';

class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.locators = Locators.Login;
        this.browserHelper = new BrowserHelper(page);
        this.waitHelper = new WaitHelper(page);

        // Locators cơ bản
        this.emailInput = this.locators.emailInput;
        this.passwordInput = this.locators.passwordInput;
        this.loginButton = this.locators.loginButton;
        this.errorMessage = this.locators.errorMessage;

        this.toastContainer = this.locators.toastContainer;
        this.toastMessage = this.locators.toastMessage;
        this.toastDismissButton = this.locators.toastDismissButton;

        // Locators động
        this.dynamicEmailInput = DynamicLocators.elementByName('input', 'email');
        this.dynamicPasswordInput = DynamicLocators.elementByName('input', 'password');
        this.dynamicLoginButton = DynamicLocators.elementByAttribute('button', 'type', 'submit');
        this.dynamicErrorMessage = DynamicLocators.create('//*[@id[contains(., "helper-text")] and contains(text(), "{0}")]');
        this.dynamicCode = DynamicLocators.create('input[data-id="{0}"]');
    }


    async open(baseUrl) {
        await this.browserHelper.navigateTo(`${baseUrl}/login`);
    }

    async focusEmailField() {
        await this.page.locator(this.emailInput).focus();
    }

    async focusPasswordField() {
        await this.page.locator(this.passwordInput).focus();
    }

    async blurEmailField() {
        await this.page.locator(this.emailInput).evaluate(el => el.blur());
    }

    async blurPasswordField() {
        await this.page.locator(this.passwordInput).evaluate(el => el.blur());
    }

    async isLoginButtonDisabled() {
        return await this.isElementDisabled(this.loginButton);
    }

    async enterEmail(email) {
        await this.setText(this.emailInput, email);
    }

    async enterPassword(password) {
        await this.setText(this.passwordInput, password);
    }

    async clickLoginButton() {
        await this.click(this.loginButton);
    }


    async login(email, password) {
        await this.enterEmail(email);
        await this.enterPassword(password);
        await this.clickLoginButton();
        await this.waitForLoadingToDisappear();
    }

    // Kiểm tra xem thông báo lỗi có hiển thị không
    async isErrorMessageDisplayed(errorText) {
        const locator = errorText
            ? this.dynamicErrorMessage(errorText)
            : this.errorMessage;

        return await this.isElementVisible(locator);
    }

    // Kiểm tra xem Toast có hiển thị không
    async isToastDisplayed() {
        return await this.isElementVisible(this.toastContainer);
    }

    // Kiểm tra xem Toast có ẩn không
    async isToastGone() {
        return await this.isElementNotVisible(this.toastContainer);
    }


    // Kiểm tra nội dung của Toast message
    async isToastMessageCorrect(expectedMessage) {
        const messages = await this.page.locator(this.toastMessage).allTextContents();
        const message = messages.join(', ').trim();
        return message === expectedMessage;
    }

    // Đóng Toast bằng cách nhấn vào nút Dismiss
    async dismissToast() {
        await this.click(this.toastDismissButton);

        // wait for the toast to be hidden
        await this.waitHelper.waitForElementToBeHidden(this.toastContainer);

    }

    // Nhập mã PIN
    async enterCode(code) {
        const digits = code.toString().split(""); // Tách từng số ra

        for (let i = 0; i < digits.length; i++) {
            const inputLocator = this.dynamicCode(i);
            await this.setText(inputLocator, digits[i]); // Nhập số vào ô input
        }
    }

}

export default LoginPage;
