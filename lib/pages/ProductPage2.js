import BasePage from './BasePage';
import DynamicLocators from '../locators/DynamicLocators';

class ProductPage extends BasePage {
    constructor(page) {
        super(page);
        
        // Locators cơ bản
        this.productList = '//div[@class="product-list"]';
        this.searchInput = '//input[@id="search"]';
        this.searchButton = '//button[@id="search-button"]';
        
        // Locators động
        this.productItem = DynamicLocators.create('//div[@class="product-item" and contains(@data-product-id, "{0}")]');
        this.productName = DynamicLocators.create('//div[@class="product-item"][{0}]//h3[@class="product-name"]');
        this.productPrice = DynamicLocators.create('//div[@class="product-item"][{0}]//span[@class="product-price"]');
        this.addToCartButton = DynamicLocators.create('//div[@class="product-item"][{0}]//button[contains(text(), "Add to Cart")]');
        this.categoryTab = DynamicLocators.create('//ul[@class="category-tabs"]//li[contains(text(), "{0}")]');
        this.ratingStars = DynamicLocators.create('//div[@class="product-item"][{0}]//div[@class="rating"]/span[{1}]');
        
        // Locators cho table
        this.productTableRow = DynamicLocators.tableRowWithText('product-table', '{0}');
        this.productTableCell = DynamicLocators.tableCell('product-table', '{0}', '{1}');
    }
    
    /**
     * Mở trang sản phẩm
     * @param {string} baseUrl - URL cơ sở của ứng dụng
     */
    async open(baseUrl) {
        await this.navigate(`${baseUrl}/products`);
    }
    
    /**
     * Tìm kiếm sản phẩm
     * @param {string} keyword - Từ khóa tìm kiếm
     */
    async searchProduct(keyword) {
        await this.fill(this.searchInput, keyword);
        await this.click(this.searchButton);
        await this.waitForLoadingToDisappear();
    }
    
    /**
     * Nhấp vào sản phẩm theo ID
     * @param {string} productId - ID của sản phẩm
     */
    async clickProduct(productId) {
        await this.click(this.productItem(productId));
    }
    
    /**
     * Lấy tên sản phẩm theo vị trí
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     * @returns {Promise<string>} - Tên sản phẩm
     */
    async getProductName(position) {
        return await this.getText(this.productName(position));
    }
    
    /**
     * Lấy giá sản phẩm theo vị trí
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     * @returns {Promise<string>} - Giá sản phẩm
     */
    async getProductPrice(position) {
        return await this.getText(this.productPrice(position));
    }
    
    /**
     * Thêm sản phẩm vào giỏ hàng theo vị trí
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     */
    async addToCart(position) {
        await this.click(this.addToCartButton(position));
        await this.waitForToastMessage('Product added to cart');
    }
    
    /**
     * Chuyển đến tab danh mục
     * @param {string} categoryName - Tên danh mục
     */
    async switchToCategory(categoryName) {
        await this.click(this.categoryTab(categoryName));
        await this.waitForLoadingToDisappear();
    }
    
    /**
     * Kiểm tra số sao đánh giá của sản phẩm
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     * @param {number} star - Số sao (1-5)
     * @returns {Promise<boolean>} - True nếu sao được chọn
     */
    async isStarSelected(position, star) {
        const starElement = await this.page.$(this.ratingStars(position, star));
        const className = await starElement.getAttribute('class');
        return className.includes('selected');
    }
    
    /**
     * Tìm hàng trong bảng sản phẩm chứa text
     * @param {string} text - Text cần tìm
     * @returns {Promise<boolean>} - True nếu tìm thấy
     */
    async findProductInTable(text) {
        return await this.isElementVisible(this.productTableRow(text));
    }
    
    /**
     * Lấy giá trị ô trong bảng sản phẩm
     * @param {number} row - Số thứ tự hàng (bắt đầu từ 1)
     * @param {number} column - Số thứ tự cột (bắt đầu từ 1)
     * @returns {Promise<string>} - Giá trị ô
     */
    async getTableCellValue(row, column) {
        return await this.getText(this.productTableCell(row, column));
    }
    
    /**
     * Sắp xếp sản phẩm theo tiêu chí
     * @param {string} criteria - Tiêu chí sắp xếp (price, name, rating)
     * @param {string} order - Thứ tự sắp xếp (asc, desc)
     */
    async sortProducts(criteria, order) {
        const sortButton = DynamicLocators.create('//button[@data-sort="{0}"]', criteria);
        await this.click(sortButton);
        
        if (order === 'desc') {
            // Nhấp lần thứ hai để sắp xếp giảm dần
            await this.click(sortButton);
        }
        
        await this.waitForLoadingToDisappear();
    }
    
    /**
     * Lọc sản phẩm theo khoảng giá
     * @param {number} minPrice - Giá tối thiểu
     * @param {number} maxPrice - Giá tối đa
     */
    async filterByPrice(minPrice, maxPrice) {
        const minPriceInput = '//input[@id="min-price"]';
        const maxPriceInput = '//input[@id="max-price"]';
        const applyFilterButton = '//button[@id="apply-filter"]';
        
        await this.fill(minPriceInput, minPrice.toString());
        await this.fill(maxPriceInput, maxPrice.toString());
        await this.click(applyFilterButton);
        
        await this.waitForLoadingToDisappear();
    }
    
    /**
     * Lấy số lượng sản phẩm hiển thị
     * @returns {Promise<number>} - Số lượng sản phẩm
     */
    async getProductCount() {
        const productItems = await this.page.$$('//div[@class="product-item"]');
        return productItems.length;
    }
    
    /**
     * Kiểm tra xem trang sản phẩm đã tải xong chưa
     * @returns {Promise<boolean>} - True nếu trang đã tải xong
     */
    async isPageLoaded() {
        return await this.isElementVisible(this.productList) && 
               await this.isElementVisible(this.searchInput) && 
               await this.isElementVisible(this.searchButton);
    }
}

export default ProductPage;
