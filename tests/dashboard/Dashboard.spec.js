import { test, expect } from '../../lib/core/BaseTest';
import { TestData } from '../../lib/constants/TestData';
import { UrlConstants } from '../../lib/constants/UrlConstants';

test.describe('Kiểm tra chức năng dashboard', () => {
    // Đăng nhập trước mỗi test case
    test.beforeEach(async ({ baseTest }) => {
        const { pageFactory } = baseTest;
        
        // Lấy LoginPage từ PageFactory
        const loginPage = pageFactory.getPage('login');
        
        // Đăng nhập với tài khoản hợp lệ
        await loginPage.login(
            TestData.Users.StandardUser.username, 
            TestData.Users.StandardUser.password
        );
        
        // Lấy DashboardPage từ PageFactory
        const dashboardPage = pageFactory.getPage('dashboard');
        
        // Kiểm tra trang dashboard đã được tải
        expect(await dashboardPage.isLoaded()).toBeTruthy();
    });
    
    test('Kiểm tra hiển thị thông tin dashboard', async ({ baseTest }) => {
        const { pageFactory } = baseTest;
        
        // Lấy DashboardPage từ PageFactory
        const dashboardPage = pageFactory.getPage('dashboard');
        
        // Kiểm tra thông báo chào mừng
        const welcomeMessage = await dashboardPage.getWelcomeMessage();
        expect(welcomeMessage).toContain(TestData.Users.StandardUser.username);
        
        // Kiểm tra các phần tử khác trên dashboard
        // ...
    });
    
    test('Kiểm tra chức năng đăng xuất', async ({ baseTest }) => {
        const { page, pageFactory } = baseTest;
        
        // Lấy DashboardPage từ PageFactory
        const dashboardPage = pageFactory.getPage('dashboard');
        
        // Đăng xuất
        await dashboardPage.logout();
        
        // Kiểm tra đã quay lại trang đăng nhập
        expect(page.url()).toContain(UrlConstants.LOGIN);
    });
    
    test('Kiểm tra chức năng mở trang profile', async ({ baseTest }) => {
        const { page, pageFactory } = baseTest;
        
        // Lấy DashboardPage từ PageFactory
        const dashboardPage = pageFactory.getPage('dashboard');
        
        // Mở trang profile
        await dashboardPage.openProfile();
        
        // Kiểm tra đã chuyển đến trang profile
        expect(page.url()).toContain(UrlConstants.PROFILE);
        
        // Lấy ProfilePage từ PageFactory
        const profilePage = pageFactory.getPage('profile');
        
        // Kiểm tra thông tin profile
        const name = await profilePage.getCurrentName();
        const email = await profilePage.getCurrentEmail();
        
        // Kiểm tra thông tin hiển thị đúng
        expect(name).toBeTruthy();
        expect(email).toBeTruthy();
    });
});