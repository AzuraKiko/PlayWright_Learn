import { test, expect } from '../lib/BaseTest.js';
F
test('Kiểm tra trang chủ Financial Navigator', async ({ baseTest }) => {
    const { page } = baseTest;  // Lấy page từ baseTest

    // Kiểm tra tiêu đề trang
    await expect(page).toHaveTitle(/Financial Navigator/);

    // // Kiểm tra các phần tử trên trang
    // await expect(page.locator('#nava')).toBeVisible();
    // await expect(page.locator('#navbarExample')).toBeVisible();
});

// test('Kiểm tra chức năng đăng nhập', async ({ baseTest }) => {

//     const { page } = baseTest;

// Nhấp vào liên kết đăng nhập

//     await page.click('#login2');

// Đợi form đăng nhập hiển thị

//     await page.waitForSelector('#logInModal');

// Điền thông tin đăng nhập

//     await page.fill('#loginusername', 'testuser');
//     await page.fill('#loginpassword', 'password');

// console.log('Clicking the login button...');
// await page.click('#logInModal button.btn-primary');


//     await page.click('#logInModal button.btn-primary');

//     console.log('Checking if login was successful...');


//     await expect(page.locator('#nameofuser')).toBeVisible();
// });
