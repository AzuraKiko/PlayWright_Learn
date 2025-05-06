import { test, expect } from '@playwright/test';
import { TestData } from '../../lib/constants/TestData.js';
import PageFactory from '../../lib/pages/PageFactory.js';
import config from '../../config/playwright.config.js';

test.describe('Users Page Tests', () => {
    let loginPage;
    let pageFactory;
    let usersPage;

    // Đăng nhập trước mỗi test case
    test.beforeEach(async ({ page }) => {
        // Access the baseURL directly from the config
        const baseURL = config.use?.baseURL;


        pageFactory = new PageFactory(page);
        // Lấy LoginPage từ PageFactory
        loginPage = pageFactory.getLoginPage();
        await loginPage.open(baseURL);
        await loginPage.login(TestData.Users.ValidUser.email, TestData.Users.ValidUser.password);
        await loginPage.enterCode(TestData.Users.ValidUser.code);

        // Lấy DashboardPage từ PageFactory
        usersPage = pageFactory.getUsersPage();

        await usersPage.goto();
    });

    // Teardown after each test
    test.afterEach(async () => {
        await page.close();
    });


    // Test Case 1: Verify the Users table is displayed with data
    test('should display the users table with data', async () => {
        const rowCount = await usersPage.getUserRowCount();
        expect(rowCount).toBeGreaterThan(0); // Ensure there are rows in the table

        // Verify the first row's data (based on the image)
        const firstUser = await usersPage.getUserData(0);
        expect(firstUser.userLoginId).toBe('doanxxx995@gmail.com');
        expect(firstUser.fullName).toBe('Tien Doan');
        expect(firstUser.apiAccess).toBe('RETAIL');
        expect(firstUser.role).toBe('RETAIL');
        expect(firstUser.userGroup).toBe('Others');
        expect(firstUser.accessMethod).toBe('Internal ONLY');
        expect(firstUser.status).toBe('Active');
        expect(firstUser.emailTemplate).toBe('Retail English');
    });

    // Test Case 2: Verify the "NEW USER" button is clickable
    test('should allow clicking the NEW USER button', async () => {
        await usersPage.clickNewUserButton();
        // Add assertions for what happens after clicking (e.g., a modal or new page)
        // For now, just verify the button is clickable (no errors thrown)
        expect(true).toBe(true); // Placeholder assertion
    });

    // Test Case 3: Verify the "EDIT USERS" button is clickable
    test('should allow clicking the EDIT USERS button', async () => {
        await usersPage.clickEditUsersButton();
        // Add assertions for what happens after clicking
        expect(true).toBe(true); // Placeholder assertion
    });

    // Test Case 4: Verify pagination functionality
    test('should navigate through pages using pagination', async () => {
        // Check initial state
        const initialRowCount = await usersPage.getUserRowCount();
        expect(initialRowCount).toBe(15); // Based on "Rows per page: 15" in the image

        // Go to the next page
        await usersPage.goToNextPage();
        const newRowCount = await usersPage.getUserRowCount();
        expect(newRowCount).toBeGreaterThan(0); // Ensure there are rows on the next page

        // Verify the previous page button is now enabled
        const isPreviousEnabled = !(await usersPage.isPreviousPageButtonDisabled());
        expect(isPreviousEnabled).toBe(true);

        // Go back to the previous page
        await usersPage.goToPreviousPage();
        const finalRowCount = await usersPage.getUserRowCount();
        expect(finalRowCount).toBe(15); // Should be back to the original number of rows
    });

    // Test Case 5: Verify changing rows per page
    test('should change the number of rows per page', async () => {
        await usersPage.setRowsPerPage('10'); // Change to 10 rows per page
        const rowCount = await usersPage.getUserRowCount();
        expect(rowCount).toBe(10); // Verify the table now shows 10 rows

        // Change back to 15 rows per page
        await usersPage.setRowsPerPage('15');
        const newRowCount = await usersPage.getUserRowCount();
        expect(newRowCount).toBe(15); // Verify the table shows 15 rows again
    });

    // Test Case 6: Verify searching for a user by login ID
    test('should find a user by login ID', async () => {
        const userLoginId = 'doanxxx995@gmail.com';
        const rowIndex = await usersPage.findUserRowIndex(userLoginId);
        expect(rowIndex).toBe(0); // Should be the first row based on the image

        const userData = await usersPage.getUserData(rowIndex);
        expect(userData.userLoginId).toBe(userLoginId);
    });

    // Test Case 7: Verify clicking the API Access button for a user
    test('should click the API Access button for a user', async () => {
        const rowIndex = 0; // First user
        await usersPage.clickApiAccessForUser(rowIndex);
        // Add assertions for what happens after clicking (e.g., a dropdown or change in text)
        expect(true).toBe(true); // Placeholder assertion
    });

    // Test Case 8: Verify total number of users
    test('should verify the total number of users', async () => {
        // The image shows "1-15 of 26", so total should be 26
        const totalUsersText = await usersPage.getText('//div[contains(text(), "of")]');
        const totalUsers = parseInt(totalUsersText.match(/\d+$/)[0], 10);
        expect(totalUsers).toBe(26);
    });
});