import { test, expect } from '@playwright/test';
import { TestData } from '../../lib/constants/TestData';
import PageFactory from '../../lib/pages/PageFactory';
import config from '../../config/playwright.config.js';

test.describe('Login Functionality', () => {
    let loginPage;
    let pageFactory;

    test.beforeEach(async ({ page }) => {
        // Access the baseURL directly from the config
        const baseURL = config.use?.baseURL;

        pageFactory = new PageFactory(page);
        // Lấy LoginPage từ PageFactory
        loginPage = pageFactory.getLoginPage();
        await loginPage.open(baseURL);
    });

    // Teardown after each test
    test.afterEach(async ({ page }) => {
        await page.close();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        await loginPage.login(TestData.Users.ValidUser.email, TestData.Users.ValidUser.password);

        // Kiểm tra đã chuyển hướng đến trang nhập PIN
        await expect(page.locator('body')).toContainText('Enter Pin Code');

        await loginPage.enterCode(TestData.Users.ValidUser.code);

        await expect(page.locator('body')).toContainText('Dashboard');
    });

    test('should show error message with invalid credentials', async ({ page }) => {
        await loginPage.login(TestData.Users.InvalidUser.email, TestData.Users.InvalidUser.password);

        // Kiểm tra toast thông báo lỗi hiển thị
        expect(await loginPage.isToastDisplayed()).toBeTruthy();

        // Kiểm tra nội dung của toast message
        expect(await loginPage.isToastMessageCorrect('Error, Incorrect Password or User Login. Please make sure your details are correct and try again')).toBeTruthy();

        await loginPage.dismissToast();

        expect(await loginPage.isToastGone()).toBeTruthy();

        await loginPage.clickLoginButton();

        expect(await loginPage.isToastDisplayed()).toBeTruthy();

        expect(await loginPage.isToastMessageCorrect('Error, You have tried too many times. Please try again later.')).toBeTruthy();

        await loginPage.dismissToast();

        // Kiểm tra nội dung toast message đã bị xóa
        expect(await loginPage.isToastGone()).toBeTruthy();
    });

    test('login button should be disabled when both email and password are empty', async ({ page }) => {
        // Verify login button is disabled
        expect(await loginPage.isLoginButtonDisabled()).toBeTruthy();
    });


    test('login button should be disabled when email is empty', async ({ page }) => {
        // Enter only password
        await loginPage.enterPassword(TestData.Users.ValidUser.password);

        // Verify login button is still disabled
        expect(await loginPage.isLoginButtonDisabled()).toBeTruthy();

        await loginPage.focusEmailField();

        await loginPage.blurEmailField();

        // Verify error message for email is displayed (if your form shows errors before submission)
        expect(await loginPage.isErrorMessageDisplayed('Email is required')).toBeTruthy();
    });

    test('login button should be disabled when password is empty', async ({ page }) => {
        // Enter only email
        await loginPage.enterEmail(TestData.Users.ValidUser.email);

        // Verify login button is still disabled
        expect(await loginPage.isLoginButtonDisabled()).toBeTruthy();

        await loginPage.focusPasswordField();

        await loginPage.blurPasswordField();

        // Verify error message for password is displayed (if your form shows errors before submission)
        expect(await loginPage.isErrorMessageDisplayed('Password is required')).toBeTruthy();
    });

    test('login button should be disabled when email format is invalid', async ({ page }) => {
        // Enter invalid email format and valid password
        await loginPage.enterEmail((TestData.Users.InvalidUser.invalidFormatEmail));
        await loginPage.enterPassword(TestData.Users.ValidUser.password);

        // Verify login button is disabled
        expect(await loginPage.isLoginButtonDisabled()).toBeTruthy();

        // Verify error message for invalid email is displayed
        expect(await loginPage.isErrorMessageDisplayed('Email is invalid')).toBeTruthy();
    });

});

