// import { test, expect } from '@playwright/test';
// import { PageFactory } from '../lib/pages';
// import DynamicLocators from '../locators/DynamicLocators';

// test.describe('E2E Test Flow', () => {
//     let pageFactory;
//     let loginPage;
//     let productPage;

//     test.beforeEach(async ({ page }) => {
//         pageFactory = new PageFactory(page);
//         loginPage = pageFactory.getLoginPage();
//         productPage = pageFactory.getProductPage();

//         // Mở trang đăng nhập
//         await loginPage.open('https://example.com');
//     });

//     test('should complete end-to-end shopping flow', async ({ page }) => {
//         // 1. Đăng nhập
//         await loginPage.login('testuser', 'password123');

//         // Kiểm tra đã đăng nhập thành công
//         expect(page.url()).toContain('/dashboard');

//         // 2. Chuyển đến trang sản phẩm
//         await productPage.open('https://example.com');

//         // 3. Tìm kiếm sản phẩm
//         await productPage.searchProduct('smartphone');

//         // 4. Thêm sản phẩm vào giỏ hàng
//         await productPage.addToCart(1);

//         // Kiểm tra thông báo thêm vào giỏ hàng
//         const successMessage = DynamicLocators.containsText('Product added to cart');
//         expect(await page.isVisible(successMessage)).toBeTruthy();

//         // 5. Chuyển đến trang giỏ hàng
//         await page.click(DynamicLocators.link('Cart'));

//         // Kiểm tra URL giỏ hàng
//         expect(page.url()).toContain('/cart');

//         // 6. Kiểm tra sản phẩm trong giỏ hàng
//         const productInCart = DynamicLocators.containsText('smartphone');
//         expect(await page.isVisible(productInCart)).toBeTruthy();

//         // 7. Tiến hành thanh toán
//         await page.click(DynamicLocators.button('Checkout'));

//         // Kiểm tra URL thanh toán
//         expect(page.url()).toContain('/checkout');

//         // 8. Điền thông tin thanh toán
//         await page.fill(DynamicLocators.inputByLabel('Card Number'), '4111111111111111');
//         await page.fill(DynamicLocators.inputByLabel('Expiry Date'), '12/25');
//         await page.fill(DynamicLocators.inputByLabel('CVV'), '123');

//         // 9. Hoàn tất đơn hàng
//         await page.click(DynamicLocators.button('Place Order'));

//         // 10. Kiểm tra đơn hàng thành công
//         const orderConfirmation = DynamicLocators.containsText('Order Confirmed');
//         expect(await page.isVisible(orderConfirmation)).toBeTruthy();

//         // Kiểm tra số đơn hàng hiển thị
//         const orderNumber = await page.textContent(DynamicLocators.css('.order-number'));
//         expect(orderNumber).toMatch(/^ORD-\d{6}$/);
//     });
// });
