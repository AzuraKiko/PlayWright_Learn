import BasePage from './BasePage';
import DynamicLocators from '../locators/DynamicLocators';

class CheckoutPage extends BasePage {
    constructor(page) {
        super(page);

        // Locators cơ bản
        this.checkoutForm = '//form[@id="checkout-form"]';
        this.orderSummary = '//div[@class="order-summary"]';
        this.placeOrderButton = '//button[@id="place-order"]';

        // Locators cho thông tin thanh toán
        this.firstNameInput = '//input[@id="first-name"]';
        this.lastNameInput = '//input[@id="last-name"]';
        this.emailInput = '//input[@id="email"]';
        this.phoneInput = '//input[@id="phone"]';
        this.addressInput = '//input[@id="address"]';
        this.cityInput = '//input[@id="city"]';
        this.stateInput = '//input[@id="state"]';
        this.zipInput = '//input[@id="zip"]';
        this.countrySelect = '//select[@id="country"]';

        // Locators cho phương thức thanh toán
        this.paymentMethodRadio = DynamicLocators.create('//input[@name="payment-method" and @value="{0}"]');
        this.cardNumberInput = '//input[@id="card-number"]';
        this.cardNameInput = '//input[@id="card-name"]';
        this.cardExpiryInput = '//input[@id="card-expiry"]';
        this.cardCvvInput = '//input[@id="card-cvv"]';

        // Locators cho tóm tắt đơn hàng
        this.orderItemName = DynamicLocators.create('//div[@class="order-item"][{0}]//div[@class="item-name"]');
        this.orderItemPrice = DynamicLocators.create('//div[@class="order-item"][{0}]//div[@class="item-price"]');
        this.orderItemQuantity = DynamicLocators.create('//div[@class="order-item"][{0}]//div[@class="item-quantity"]');
        this.orderSubtotal = '//div[@class="order-subtotal"]';
        this.orderTax = '//div[@class="order-tax"]';
        this.orderShipping = '//div[@class="order-shipping"]';
        this.orderTotal = '//div[@class="order-total"]';
    }

    /**
     * Mở trang thanh toán
     * @param {string} baseUrl - URL cơ sở của ứng dụng
     */
    async open(baseUrl) {
        await this.navigate(`${baseUrl}/checkout`);
    }

    /**
     * Điền thông tin cá nhân
     * @param {Object} personalInfo - Thông tin cá nhân
     */
    async fillPersonalInfo(personalInfo) {
        await this.fill(this.firstNameInput, personalInfo.firstName);
        await this.fill(this.lastNameInput, personalInfo.lastName);
        await this.fill(this.emailInput, personalInfo.email);
        await this.fill(this.phoneInput, personalInfo.phone);
    }

    /**
     * Điền thông tin địa chỉ
     * @param {Object} addressInfo - Thông tin địa chỉ
     */
    async fillAddressInfo(addressInfo) {
        await this.fill(this.addressInput, addressInfo.address);
        await this.fill(this.cityInput, addressInfo.city);
        await this.fill(this.stateInput, addressInfo.state);
        await this.fill(this.zipInput, addressInfo.zip);
        await this.selectOption(this.countrySelect, addressInfo.country);
    }

    /**
     * Chọn phương thức thanh toán
     * @param {string} method - Phương thức thanh toán (credit-card, paypal, etc.)
     */
    async selectPaymentMethod(method) {
        await this.click(this.paymentMethodRadio(method));
    }

    /**
     * Điền thông tin thẻ tín dụng
     * @param {Object} cardInfo - Thông tin thẻ tín dụng
     */
    async fillCreditCardInfo(cardInfo) {
        await this.fill(this.cardNumberInput, cardInfo.number);
        await this.fill(this.cardNameInput, cardInfo.name);
        await this.fill(this.cardExpiryInput, cardInfo.expiry);
        await this.fill(this.cardCvvInput, cardInfo.cvv);
    }

    /**
     * Lấy tên sản phẩm trong tóm tắt đơn hàng theo vị trí
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     * @returns {Promise<string>} - Tên sản phẩm
     */
    async getOrderItemName(position) {
        return await this.getText(this.orderItemName(position));
    }

    /**
     * Lấy giá sản phẩm trong tóm tắt đơn hàng theo vị trí
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     * @returns {Promise<string>} - Giá sản phẩm
     */
    async getOrderItemPrice(position) {
        return await this.getText(this.orderItemPrice(position));
    }

    /**
     * Lấy số lượng sản phẩm trong tóm tắt đơn hàng theo vị trí
     * @param {number} position - Vị trí của sản phẩm (bắt đầu từ 1)
     * @returns {Promise<string>} - Số lượng sản phẩm
     */
    async getOrderItemQuantity(position) {
        return await this.getText(this.orderItemQuantity(position));
    }

    /**
     * Lấy tổng giá trị sản phẩm
     * @returns {Promise<string>} - Tổng giá trị sản phẩm
     */
    async getOrderSubtotal() {
        return await this.getText(this.orderSubtotal);
    }

    /**
     * Lấy giá trị thuế
     * @returns {Promise<string>} - Giá trị thuế
     */
    async getOrderTax() {
        return await this.getText(this.orderTax);
    }

    /**
     * Lấy phí vận chuyển
     * @returns {Promise<string>} - Phí vận chuyển
     */
    async getOrderShipping() {
        return await this.getText(this.orderShipping);
    }

    /**
     * Lấy tổng giá trị đơn hàng
     * @returns {Promise<string>} - Tổng giá trị đơn hàng
     */
    async getOrderTotal() {
        return await this.getText(this.orderTotal);
    }

    /**
     * Đặt hàng
     * @returns {Promise<void>}
     */
    async placeOrder() {
        await this.click(this.placeOrderButton);
    }

    /**
     * Kiểm tra xem form thanh toán có hiển thị không
     * @returns {Promise<boolean>} - True nếu form thanh toán hiển thị
     */
    async isCheckoutFormDisplayed() {
        return await this.isVisible(this.checkoutForm);
    }

    /**
     * Kiểm tra xem tóm tắt đơn hàng có hiển thị không
     * @returns {Promise<boolean>} - True nếu tóm tắt đơn hàng hiển thị
     */
    async isOrderSummaryDisplayed() {
        return await this.isVisible(this.orderSummary);
    }

    /**
     * Điền toàn bộ thông tin thanh toán
     * @param {Object} checkoutInfo - Thông tin thanh toán đầy đủ
     */
    async fillCheckoutForm(checkoutInfo) {
        await this.fillPersonalInfo(checkoutInfo.personalInfo);
        await this.fillAddressInfo(checkoutInfo.addressInfo);
        await this.selectPaymentMethod(checkoutInfo.paymentMethod);

        if (checkoutInfo.paymentMethod === 'credit-card') {
            await this.fillCreditCardInfo(checkoutInfo.cardInfo);
        }
    }

    /**
     * Hoàn tất quá trình thanh toán
     * @param {Object} checkoutInfo - Thông tin thanh toán đầy đủ
     */
    async completeCheckout(checkoutInfo) {
        await this.fillCheckoutForm(checkoutInfo);
        await this.placeOrder();
    }
}

export default CheckoutPage;
