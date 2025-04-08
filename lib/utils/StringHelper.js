/**
 * Utility class để làm việc với chuỗi
 */
class StringHelper {
    /**
     * Kiểm tra chuỗi có phải là email hợp lệ
     * @param {string} email - Chuỗi cần kiểm tra
     * @returns {boolean} - True nếu là email hợp lệ
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Kiểm tra chuỗi có phải là số điện thoại hợp lệ
     * @param {string} phone - Chuỗi cần kiểm tra
     * @returns {boolean} - True nếu là số điện thoại hợp lệ
     */
    static isValidPhone(phone) {
        const phoneRegex = /^\d{10,11}$/;
        return phoneRegex.test(phone.replace(/\D/g, ""));
    }

    /**
     * Cắt chuỗi nếu dài hơn độ dài tối đa và thêm dấu "..."
     * @param {string} str - Chuỗi cần cắt
     * @param {number} maxLength - Độ dài tối đa
     * @returns {string} - Chuỗi đã cắt
     */
    static truncate(str, maxLength) {
        if (!str || str.length <= maxLength) {
            return str;
        }

        return str.substring(0, maxLength) + "...";
    }

    /**
     * Chuyển chuỗi thành slug (URL friendly)
     * @param {string} str - Chuỗi cần chuyển
     * @returns {string} - Slug
     */
    static toSlug(str) {
        return str
            .toLowerCase()
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
            .replace(/[èéẹẻẽêềếệểễ]/g, "e")
            .replace(/[ìíịỉĩ]/g, "i")
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
            .replace(/[ùúụủũưừứựửữ]/g, "u")
            .replace(/[ỳýỵỷỹ]/g, "y")
            .replace(/đ/g, "d")
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "")
            .replace(/\-\-+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");
    }

    /**
     * Chuyển chuỗi thành camelCase
     * @param {string} str - Chuỗi cần chuyển
     * @returns {string} - Chuỗi camelCase
     */
    static toCamelCase(str) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, "");
    }

    /**
     * Chuyển chuỗi thành PascalCase
     * @param {string} str - Chuỗi cần chuyển
     * @returns {string} - Chuỗi PascalCase
     */
    static toPascalCase(str) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
            .replace(/\s+/g, "");
    }

    /**
     * Chuyển chuỗi thành snake_case
     * @param {string} str - Chuỗi cần chuyển
     * @returns {string} - Chuỗi snake_case
     */
    static toSnakeCase(str) {
        return str
            .replace(/\s+/g, "_")
            .replace(/([a-z])([A-Z])/g, "$1_$2")
            .toLowerCase();
    }

    /**
     * Chuyển chuỗi thành kebab-case
     * @param {string} str - Chuỗi cần chuyển
     * @returns {string} - Chuỗi kebab-case
     */
    static toKebabCase(str) {
        return str
            .replace(/\s+/g, "-")
            .replace(/([a-z])([A-Z])/g, "$1-$2")
            .toLowerCase();
    }

    /**
     * Loại bỏ các ký tự đặc biệt khỏi chuỗi
     * @param {string} str - Chuỗi cần xử lý
     * @returns {string} - Chuỗi đã loại bỏ ký tự đặc biệt
     */
    static removeSpecialChars(str) {
        return str.replace(/[^\w\s]/gi, "");
    }

    /**
     * Loại bỏ dấu tiếng Việt
     * @param {string} str - Chuỗi tiếng Việt
     * @returns {string} - Chuỗi không dấu
     */
    static removeVietnameseAccents(str) {
        return str
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
            .replace(/[èéẹẻẽêềếệểễ]/g, "e")
            .replace(/[ìíịỉĩ]/g, "i")
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
            .replace(/[ùúụủũưừứựửữ]/g, "u")
            .replace(/[ỳýỵỷỹ]/g, "y")
            .replace(/đ/g, "d");
    }
}

// Export class StringHelper
export default StringHelper;
