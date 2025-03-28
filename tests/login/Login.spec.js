import { test, expect } from '../../lib/core/BaseTest';
import { TestData } from '../../lib/constants/TestData';

test('Check title of Trade for Good', async ({ baseTest }) => {
    const { page } = baseTest;  // Lấy page từ baseTest

    // Log the actual title of the page
    const actualTitle = await page.title();
    console.log('Actual page title:', actualTitle);

    // Kiểm tra tiêu đề trang
    await expect(page).toHaveTitle(/Trade For Good Admin Portal/);

    // await page.waitForTimeout(60000); // Chờ 1 phút

});

test.describe('Kiểm tra chức năng đăng nhập', () => {
    test('Đăng nhập thành công với tài khoản hợp lệ', async ({ baseTest }) => {
        const { page, pageFactory } = baseTest;

        // Lấy LoginPage từ PageFactory
        const loginPage = pageFactory.getPage('login');

        // Đăng nhập với tài khoản hợp lệ
        await loginPage.login(
            TestData.Users.StandardUser.username,
            TestData.Users.StandardUser.password
        );

        // Lấy DashboardPage từ PageFactory
        const dashboardPage = pageFactory.getPage('dashboard');

        // Kiểm tra đã chuyển đến trang dashboard
        expect(page.url()).toContain(UrlConstants.DASHBOARD);

        // Kiểm tra trang dashboard đã được tải
        expect(await dashboardPage.isLoaded()).toBeTruthy();

        // Kiểm tra thông báo chào mừng
        const welcomeMessage = await dashboardPage.getWelcomeMessage();
        expect(welcomeMessage).toContain(TestData.Users.StandardUser.username);
    });

    test('Đăng nhập thất bại với tài khoản không hợp lệ', async ({ baseTest }) => {
        const { pageFactory } = baseTest;

        // Lấy LoginPage từ PageFactory
        const loginPage = pageFactory.getPage('login');

        // Đăng nhập với tài khoản không hợp lệ
        await loginPage.login(
            TestData.Users.InvalidUser.username,
            TestData.Users.InvalidUser.password
        );

        // Kiểm tra thông báo lỗi hiển thị
        expect(await loginPage.isErrorMessageVisible()).toBeTruthy();

        // Kiểm tra nội dung thông báo lỗi
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain(TestData.ErrorMessages.InvalidCredentials);
    });

    test('Đăng nhập thất bại khi không nhập tên đăng nhập', async ({ baseTest }) => {
        const { pageFactory } = baseTest;

        // Lấy LoginPage từ PageFactory
        const loginPage = pageFactory.getPage('login');

        // Đăng nhập với tên đăng nhập trống
        await loginPage.login('', TestData.Users.StandardUser.password);

        // Kiểm tra thông báo lỗi hiển thị
        expect(await loginPage.isErrorMessageVisible()).toBeTruthy();

        // Kiểm tra nội dung thông báo lỗi
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain(TestData.ErrorMessages.EmptyUsername);
    });

    test('Đăng nhập thất bại khi không nhập mật khẩu', async ({ baseTest }) => {
        const { pageFactory } = baseTest;

        // Lấy LoginPage từ PageFactory
        const loginPage = pageFactory.getPage('login');

        // Đăng nhập với mật khẩu trống
        await loginPage.login(TestData.Users.StandardUser.username, '');

        // Kiểm tra thông báo lỗi hiển thị
        expect(await loginPage.isErrorMessageVisible()).toBeTruthy();

        // Kiểm tra nội dung thông báo lỗi
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain(TestData.ErrorMessages.EmptyPassword);
    });

    test('Kiểm tra chức năng "Ghi nhớ đăng nhập"', async ({ baseTest }) => {
        const { page, pageFactory } = baseTest;

        // Lấy LoginPage từ PageFactory
        const loginPage = pageFactory.getPage('login');

        // Đánh dấu vào checkbox "Ghi nhớ đăng nhập"
        await loginPage.setRememberMe(true);

        // Đăng nhập với tài khoản hợp lệ
        await loginPage.login(
            TestData.Users.StandardUser.username,
            TestData.Users.StandardUser.password
        );

        // Lấy DashboardPage từ PageFactory
        const dashboardPage = pageFactory.getPage('dashboard');

        // Kiểm tra đã chuyển đến trang dashboard
        expect(page.url()).toContain(UrlConstants.DASHBOARD);

        // Đăng xuất
        await dashboardPage.logout();

        // Kiểm tra đã quay lại trang đăng nhập
        expect(page.url()).toContain(UrlConstants.LOGIN);

        // Kiểm tra tên đăng nhập đã được điền sẵn
        const username = await page.inputValue(Locators.Login.usernameInput);
        expect(username).toBe(TestData.Users.StandardUser.username);
    });
});