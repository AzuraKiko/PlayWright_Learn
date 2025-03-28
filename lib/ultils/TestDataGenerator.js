import { faker } from '@faker-js/faker';
import { logger } from './Logger';

/**
 * Utility để tạo dữ liệu test ngẫu nhiên
 */
class TestDataGenerator {
    constructor() {
        this.faker = faker;
    }

    /**
     * Tạo thông tin người dùng ngẫu nhiên
     * @returns {Object} - Thông tin người dùng
     */
    generateUser() {
        const firstName = this.faker.person.firstName();
        const lastName = this.faker.person.lastName();
        const user = {
            username: this.faker.internet.userName({ firstName, lastName }),
            password: this.faker.internet.password({ length: 10 }),
            email: this.faker.internet.email({ firstName, lastName }),
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            phone: this.faker.phone.number()
        };

        logger.debug('Generated random user data', user);
        return user;
    }

    /**
     * Tạo địa chỉ ngẫu nhiên
     * @returns {Object} - Thông tin địa chỉ
     */
    generateAddress() {
        const address = {
            street: this.faker.location.streetAddress(),
            city: this.faker.location.city(),
            state: this.faker.location.state(),
            zipCode: this.faker.location.zipCode(),
            country: this.faker.location.country()
        };

        logger.debug('Generated random address data', address);
        return address;
    }

    /**
     * Tạo thông tin sản phẩm ngẫu nhiên
     * @returns {Object} - Thông tin sản phẩm
     */
    generateProduct() {
        const product = {
            name: this.faker.commerce.productName(),
            price: parseFloat(this.faker.commerce.price()),
            description: this.faker.commerce.productDescription(),
            category: this.faker.commerce.department(),
            color: this.faker.commerce.color()
        };

        logger.debug('Generated random product data', product);
        return product;
    }

    /**
     * Tạo thông tin thanh toán ngẫu nhiên
     * @returns {Object} - Thông tin thanh toán
     */
    generatePayment() {
        const payment = {
            cardNumber: this.faker.finance.creditCardNumber(),
            cardType: this.faker.finance.creditCardIssuer(),
            expiryDate: this.faker.date.future().toISOString().split('T')[0],
            cvv: this.faker.finance.creditCardCVV()
        };

        logger.debug('Generated random payment data', payment);
        return payment;
    }
}

// Tạo và export một instance TestDataGenerator mặc định
export const testDataGenerator = new TestDataGenerator();

// Export class TestDataGenerator để có thể tạo instance tùy chỉnh
export default TestDataGenerator;
