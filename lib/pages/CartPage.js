import BasePage from './BasePage';
import DynamicLocators from '../locators/DynamicLocators';

class CartPage extends BasePage {
    constructor(page) {
        super(page);

        // Locators cơ bản
        this.cartItems = '//div[@class="cart-items"]';
        this.emptyCartMessage = '//div[@class="empty-cart-message"]';
        this.checkoutButton = '//button[@id="checkout-button"]';
        this.totalAmount = '//div[@class="total-amount"]';

        // Locators động
        this.cartItem = DynamicLocators.create('//div[@class="cart-item" and contains(@data-product-id, "{0}")]');
        this.cartItemName = DynamicLocators.create('//div[@class="cart-item"][{0}]//div[@class="item-name"]');
        this.cartItemPrice = DynamicLocators.create('//div[@class="cart-item"][{0}]//div[@class="item-price"]');
        this.cartItemQuantity = DynamicLocators.create('//div[@class="cart-item"][{0}]//input[@class="item-quantity"]');
        this.cartItemRemove = DynamicLocators.create('//div[@class="cart-item"][{0}]//button[@class="remove-item"]');
        this.cartItemSubtotal = DynamicLocators.create('//div[@class="cart-item"][{0}]//div[@class="item-subtotal"]');
        this.quantityInput = DynamicLocators.create('//div[@class="cart-item" and contains(@data-product-id, "{0}")]//input[@class="item-quantity"]');
        this.updateQuantityButton = DynamicLocators.create('//div[@class="cart-item" and contains(@data-product-id, "{0}")]//button[@class="update-quantity"]');
    }

    /**
     * Mở trang giỏ hàng
     * @param {string} baseUrl - URL cơ sở của ứng dụng
     */
    async open(baseUrl) {
        await this.navigate(`${baseUrl}/cart`);
    }

    /**
     * Kiểm tra xem giỏ hàng có trống không
     * @returns {Promise<boolean>} - True nếu giỏ hàng trống
     */
    async isCartEmpty() {
        return await this.isElementVisible(this.emptyCartMessage);
    }

    /**
     * Lấy số lượng sản phẩm trong giỏ hàng
     * @returns {Promise<number>} - Số lượng sản phẩm
     */
    async getCartItemCount() {
        const cartItems = await this.page.$$('//div[@class="cart-item"]');
        return cartItems.length;
    }

    /**
     * Lấy tên sản phẩm theo vị trí
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     * @returns {Promise<string>} - Tên sản phẩm
     */
    async getItemName(position) {
        return await this.getText(this.cartItemName(position));
    }

    /**
     * Lấy giá sản phẩm theo vị trí
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     * @returns {Promise<string>} - Giá sản phẩm
     */
    async getItemPrice(position) {
        return await this.getText(this.cartItemPrice(position));
    }

    /**
     * Lấy số lượng sản phẩm theo vị trí
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     * @returns {Promise<number>} - Số lượng sản phẩm
     */
    async getItemQuantity(position) {
        const quantityText = await this.getInputValue(this.cartItemQuantity(position));
        return parseInt(quantityText, 10);
    }

    /**
     * Lấy tổng giá của sản phẩm theo vị trí
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     * @returns {Promise<string>} - Tổng giá sản phẩm
     */
    async getItemSubtotal(position) {
        return await this.getText(this.cartItemSubtotal(position));
    }

    /**
     * Cập nhật số lượng sản phẩm theo ID
     * @param {string} productId - ID của sản phẩm
     * @param {number} quantity - Số lượng mới
     */
    async updateQuantity(productId, quantity) {
        await this.fill(this.quantityInput(productId), quantity.toString());
        await this.click(this.updateQuantityButton(productId));
        await this.waitForLoadingToDisappear();
        await this.waitForToastMessage('Cart updated');
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng theo vị trí
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     */
    async removeItem(position) {
        await this.click(this.cartItemRemove(position));
        await this.waitForLoadingToDisappear();
        await this.waitForToastMessage('Item removed from cart');
    }

    /**
     * Lấy tổng giá trị giỏ hàng
     * @returns {Promise<string>} - Tổng giá trị giỏ hàng
     */
    async getTotalAmount() {
        return await this.getText(this.totalAmount);
    }

    /**
     * Tiến hành thanh toán
     */
    async proceedToCheckout() {
        await this.click(this.checkoutButton);
        await this.waitForLoadingToDisappear();
    }

    /**
     * Xóa tất cả sản phẩm khỏi giỏ hàng
     */
    async clearCart() {
        const clearCartButton = DynamicLocators.button('Clear Cart');
        if (await this.isElementVisible(clearCartButton)) {
            await this.click(clearCartButton);
            await this.waitForLoadingToDisappear();
            await this.waitForToastMessage('Cart cleared');
        }
    }

    /**
     * Áp dụng mã giảm giá
     * @param {string} couponCode - Mã giảm giá
     */
    async applyCoupon(couponCode) {
        const couponInput = '//input[@id="coupon-code"]';
        const applyCouponButton = '//button[@id="apply-coupon"]';

        await this.fill(couponInput, couponCode);
        await this.click(applyCouponButton);
        await this.waitForLoadingToDisappear();
    }

    /**
     * Kiểm tra xem mã giảm giá có được áp dụng không
     * @returns {Promise<boolean>} - True nếu mã giảm giá được áp dụng
     */
    async isCouponApplied() {
        const couponAppliedMessage = DynamicLocators.containsText('Coupon applied');
        return await this.isElementVisible(couponAppliedMessage);
    }

    /**
     * Kiểm tra xem sản phẩm có trong giỏ hàng không
     * @param {string} productName - Tên sản phẩm
     * @returns {Promise<boolean>} - True nếu sản phẩm có trong giỏ hàng
     */
    async isProductInCart(productName) {
        const productNameLocator = DynamicLocators.create('//div[@class="item-name" and contains(text(), "{0}")]', productName);
        return await this.isElementVisible(productNameLocator);
    }

    /**
     * Kiểm tra xem trang giỏ hàng đã tải xong chưa
     * @returns {Promise<boolean>} - True nếu trang đã tải xong
     */
    async isPageLoaded() {
        return await this.isElementVisible(this.cartItems) ||
            await this.isElementVisible(this.emptyCartMessage);
    }
}

export default CartPage;
