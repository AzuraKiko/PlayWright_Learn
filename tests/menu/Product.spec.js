// import { test, expect } from '@playwright/test';
// import ProductPage from '../lib/pages/ProductPage';
// import DynamicLocators from '../locators/DynamicLocators';

// test.describe('Product Page Functionality', () => {
//     let productPage;

//     test.beforeEach(async ({ page }) => {
//         productPage = new ProductPage(page);
//         await productPage.open('https://example.com');
//     });

//     test('should search for products', async ({ page }) => {
//         await productPage.searchProduct('laptop');

//         // Kiểm tra kết quả tìm kiếm
//         const firstProductName = await productPage.getProductName(1);
//         expect(firstProductName.toLowerCase()).toContain('laptop');
//     });

//     test('should add product to cart', async ({ page }) => {
//         // Thêm sản phẩm đầu tiên vào giỏ hàng
//         await productPage.addToCart(1);

//         // Kiểm tra thông báo thêm vào giỏ hàng
//         const successMessage = DynamicLocators.containsText('Product added to cart');
//         expect(await page.isVisible(successMessage)).toBeTruthy();

//         // Kiểm tra số lượng sản phẩm trong giỏ hàng
//         const cartCount = await page.textContent(DynamicLocators.css('.cart-count'));
//         expect(cartCount).toBe('1');
//     });

//     test('should filter products by category', async ({ page }) => {
//         // Chuyển đến danh mục "Electronics"
//         await productPage.switchToCategory('Electronics');

//         // Kiểm tra URL đã thay đổi
//         expect(page.url()).toContain('category=electronics');

//         // Kiểm tra sản phẩm đầu tiên thuộc danh mục Electronics
//         const categoryLabel = DynamicLocators.create('//div[@class="product-item"][1]//span[@class="category-label"]');
//         const categoryText = await page.textContent(categoryLabel);
//         expect(categoryText).toBe('Electronics');
//     });

//     test('should display product ratings correctly', async ({ page }) => {
//         // Kiểm tra sản phẩm đầu tiên có 4 sao
//         const hasRating = await productPage.isStarSelected(1, 4);
//         expect(hasRating).toBeTruthy();

//         // Kiểm tra sản phẩm đầu tiên không có 5 sao
//         const hasNoRating = await productPage.isStarSelected(1, 5);
//         expect(hasNoRating).toBeFalsy();
//     });

//     test('should find product in table', async ({ page }) => {
//         // Tìm sản phẩm "MacBook Pro" trong bảng
//         const found = await productPage.findProductInTable('MacBook Pro');
//         expect(found).toBeTruthy();

//         // Lấy giá của sản phẩm từ bảng (giả sử ở hàng 2, cột 3 là giá)
//         const price = await productPage.getTableCellValue(2, 3);
//         expect(price).toContain('$1299');
//     });

//     test('should navigate to product details page', async ({ page }) => {
//         // Nhấp vào sản phẩm có ID "prod-123"
//         await productPage.clickProduct('prod-123');

//         // Kiểm tra URL chứa ID sản phẩm
//         expect(page.url()).toContain('product/prod-123');

//         // Kiểm tra tiêu đề trang chi tiết sản phẩm
//         const productTitle = DynamicLocators.elementByClass('h1', 'product-title');
//         expect(await page.isVisible(productTitle)).toBeTruthy();
//     });
// });
