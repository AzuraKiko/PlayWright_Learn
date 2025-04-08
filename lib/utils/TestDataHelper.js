import { faker } from "@faker-js/faker";
import { logger } from "./Logger";

/**
 * Utility để tạo dữ liệu test ngẫu nhiên
 */
class testDataHelper {
    constructor() {
        this.faker = faker;
    }

    /**
     * Tạo chuỗi ngẫu nhiên với độ dài xác định
     * @param {number} length - Độ dài chuỗi
     * @param {string} charset - Bộ ký tự sử dụng (mặc định: chữ cái và số)
     * @returns {string} - Chuỗi ngẫu nhiên
     */
    static generateRandomString(
        length,
        charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    ) {
        let result = "";
        const charsetLength = charset.length;

        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charsetLength));
        }

        return result;
    }

    /**
     * Tạo email ngẫu nhiên
     * @param {string} domain - Tên miền email (mặc định: example.com)
     * @returns {string} - Email ngẫu nhiên
     */
    static generateRandomEmail(domain = "example.com") {
        const username = this.generateRandomString(
            8,
            "abcdefghijklmnopqrstuvwxyz0123456789"
        );
        return `${username}@${domain}`;
    }

    /**
     * Tạo số điện thoại ngẫu nhiên
     * @param {string} prefix - Tiền tố số điện thoại (mặc định: 09)
     * @param {number} length - Độ dài phần số (mặc định: 8)
     * @returns {string} - Số điện thoại ngẫu nhiên
     */
    static generateRandomPhone(prefix = "09", length = 8) {
        const numbers = this.generateRandomString(length, "0123456789");
        return `${prefix}${numbers}`;
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
            phone: this.faker.phone.number(),
        };

        logger.debug("Generated random user data", user);
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
            country: this.faker.location.country(),
        };

        logger.debug("Generated random address data", address);
        return address;
    }

}

// Export class testDataHelper để có thể tạo instance tùy chỉnh
export default testDataHelper;
