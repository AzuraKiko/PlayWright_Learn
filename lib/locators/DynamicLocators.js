import { logger } from '../utils/Logger';

/**
 * Utility class để tạo và quản lý các locator động
 */
class DynamicLocators {
    /**
     * Tạo locator động với tham số thay thế
     * @param {string} baseLocator - Locator cơ sở chứa placeholder
     * @param {...any} params - Các tham số để thay thế vào placeholder
     * @returns {string} - Locator đã được thay thế tham số
     * 
     * @example
     * // Tạo locator cho button với text động
     * const buttonLocator = DynamicLocators.create('//button[contains(text(), "{0}")]', 'Save');
     * // Kết quả: //button[contains(text(), "Save")]
     * 
     * @example
     * // Tạo locator với nhiều tham số
     * const rowCellLocator = DynamicLocators.create('//table[@id="{0}"]//tr[{1}]/td[{2}]', 'userTable', 3, 2);
     * // Kết quả: //table[@id="userTable"]//tr[3]/td[2]
     */
    static create(baseLocator, ...params) {
        if (!baseLocator) {
            logger.error('Locator cơ sở không được để trống');
            throw new Error('Locator cơ sở không được để trống');
        }

        let result = baseLocator;

        for (let i = 0; i < params.length; i++) {
            const placeholder = `{${i}}`;
            const value = params[i] !== undefined ? params[i] : '';

            // Thay thế tất cả các placeholder trong locator
            result = result.split(placeholder).join(value);
        }

        logger.debug(`Đã tạo locator động: ${result}`);
        return result;
    }

    /**
     * Tạo locator XPath với tham số thay thế
     * @param {string} baseXPath - XPath cơ sở chứa placeholder
     * @param {...any} params - Các tham số để thay thế vào placeholder
     * @returns {string} - XPath đã được thay thế tham số
     */
    static xpath(baseXPath, ...params) {
        return this.create(baseXPath, ...params);
    }

    /**
     * Tạo locator CSS với tham số thay thế
     * @param {string} baseCSS - CSS selector cơ sở chứa placeholder
     * @param {...any} params - Các tham số để thay thế vào placeholder
     * @returns {string} - CSS selector đã được thay thế tham số
     */
    static css(baseCSS, ...params) {
        return this.create(baseCSS, ...params);
    }

    /**
     * Tạo locator text chính xác
     * @param {string} text - Text cần tìm
     * @returns {string} - XPath locator
     */
    static exactText(text) {
        return `//*/text()[normalize-space(.)="${text}"]/parent::*`;
    }

    /**
     * Tạo locator chứa text
     * @param {string} text - Text cần tìm
     * @returns {string} - XPath locator
     */
    static containsText(text) {
        return `//*[contains(text(), "${text}")]`;
    }

    /**
     * Tạo locator cho button với text
     * @param {string} text - Text của button
     * @returns {string} - XPath locator
     */
    static button(text) {
        return `//button[contains(text(), "${text}") or contains(@value, "${text}")]`;
    }

    /**
     * Tạo locator cho input với label
     * @param {string} label - Label của input
     * @returns {string} - XPath locator
     */
    static inputByLabel(label) {
        return `//label[contains(text(), "${label}")]/following::input[1]`;
    }

    /**
     * Tạo locator cho input với placeholder
     * @param {string} placeholder - Placeholder của input
     * @returns {string} - XPath locator
     */
    static inputByPlaceholder(placeholder) {
        return `//input[@placeholder="${placeholder}"]`;
    }

    /**
     * Tạo locator cho link với text
     * @param {string} text - Text của link
     * @returns {string} - XPath locator
     */
    static link(text) {
        return `//a[contains(text(), "${text}")]`;
    }

    /**
     * Tạo locator cho dropdown với label
     * @param {string} label - Label của dropdown
     * @returns {string} - XPath locator
     */
    static dropdownByLabel(label) {
        return `//label[contains(text(), "${label}")]/following::select[1]`;
    }

    /**
     * Tạo locator cho dropdown option
     * @param {string} text - Text của option
     * @returns {string} - XPath locator
     */
    static dropdownOption(text) {
        return `//option[contains(text(), "${text}")]`;
    }

    /**
     * Tạo locator cho checkbox với label
     * @param {string} label - Label của checkbox
     * @returns {string} - XPath locator
     */
    static checkboxByLabel(label) {
        return `//label[contains(text(), "${label}")]/preceding::input[@type="checkbox"][1] | //label[contains(text(), "${label}")]/following::input[@type="checkbox"][1]`;
    }

    /**
     * Tạo locator cho radio button với label
     * @param {string} label - Label của radio button
     * @returns {string} - XPath locator
     */
    static radioByLabel(label) {
        return `//label[contains(text(), "${label}")]/preceding::input[@type="radio"][1] | //label[contains(text(), "${label}")]/following::input[@type="radio"][1]`;
    }

    /**
     * Tạo locator cho table cell
     * @param {string} tableId - ID của table
     * @param {number} row - Số thứ tự hàng (bắt đầu từ 1)
     * @param {number} column - Số thứ tự cột (bắt đầu từ 1)
     * @returns {string} - XPath locator
     */
    static tableCell(tableId, row, column) {
        return `//table[@id="${tableId}"]//tr[${row}]/td[${column}]`;
    }

    /**
     * Tạo locator cho table row chứa text
     * @param {string} tableId - ID của table
     * @param {string} text - Text cần tìm trong hàng
     * @returns {string} - XPath locator
     */
    static tableRowWithText(tableId, text) {
        return `//table[@id="${tableId}"]//tr[contains(., "${text}")]`;
    }

    /**
     * Tạo locator cho element với attribute
     * @param {string} tag - Tên thẻ HTML
     * @param {string} attribute - Tên thuộc tính
     * @param {string} value - Giá trị thuộc tính
     * @returns {string} - XPath locator
     */
    static elementByAttribute(tag, attribute, value) {
        return `//${tag}[@${attribute}="${value}"]`;
    }

    /**
     * Tạo locator cho element với nhiều attribute
     * @param {string} tag - Tên thẻ HTML
     * @param {Object} attributes - Object chứa các cặp key-value của attribute
     * @returns {string} - XPath locator
     */
    static elementByAttributes(tag, attributes) {
        if (!attributes || Object.keys(attributes).length === 0) {
            return `//${tag}`;
        }

        const conditions = Object.entries(attributes)
            .map(([attr, value]) => `@${attr}="${value}"`)
            .join(' and ');

        return `//${tag}[${conditions}]`;
    }

    /**
     * Tạo locator cho element con của một element cha
     * @param {string} parentLocator - Locator của element cha
     * @param {string} childTag - Tên thẻ HTML của element con
     * @param {Object} childAttributes - Object chứa các cặp key-value của attribute của element con
     * @returns {string} - XPath locator
     */
    static childElement(parentLocator, childTag, childAttributes = {}) {
        if (!childAttributes || Object.keys(childAttributes).length === 0) {
            return `${parentLocator}//${childTag}`;
        }

        const conditions = Object.entries(childAttributes)
            .map(([attr, value]) => `@${attr}="${value}"`)
            .join(' and ');

        return `${parentLocator}//${childTag}[${conditions}]`;
    }

    /**
     * Tạo locator cho element anh em kế tiếp
     * @param {string} locator - Locator của element tham chiếu
     * @param {string} siblingTag - Tên thẻ HTML của element anh em
     * @returns {string} - XPath locator
     */
    static nextSibling(locator, siblingTag) {
        return `${locator}/following-sibling::${siblingTag}[1]`;
    }

    /**
     * Tạo locator cho element anh em trước đó
     * @param {string} locator - Locator của element tham chiếu
     * @param {string} siblingTag - Tên thẻ HTML của element anh em
     * @returns {string} - XPath locator
     */
    static previousSibling(locator, siblingTag) {
        return `${locator}/preceding-sibling::${siblingTag}[1]`;
    }

    /**
     * Tạo locator cho element cha
     * @param {string} locator - Locator của element con
     * @param {string} parentTag - Tên thẻ HTML của element cha (optional)
     * @returns {string} - XPath locator
     */
    static parent(locator, parentTag = '*') {
        return `${locator}/parent::${parentTag}`;
    }

    /**
     * Tạo locator cho element theo vị trí
     * @param {string} tag - Tên thẻ HTML
     * @param {number} position - Vị trí (bắt đầu từ 1)
     * @returns {string} - XPath locator
     */
    static elementByPosition(tag, position) {
        return `//${tag}[${position}]`;
    }

    /**
     * Tạo locator cho element có class
     * @param {string} tag - Tên thẻ HTML
     * @param {string} className - Tên class
     * @returns {string} - XPath locator
     */
    static elementByClass(tag, className) {
        return `//${tag}[contains(@class, "${className}")]`;
    }

    /**
     * Tạo locator cho element có ID
     * @param {string} tag - Tên thẻ HTML
     * @param {string} id - Giá trị ID
     * @returns {string} - XPath locator
     */
    static elementById(tag, id) {
        return `//${tag}[@id="${id}"]`;
    }

    /**
     * Tạo locator cho element có name
     * @param {string} tag - Tên thẻ HTML
     * @param {string} name - Giá trị name
     * @returns {string} - XPath locator
     */
    static elementByName(tag, name) {
        return `//${tag}[@name="${name}"]`;
    }

    /**
     * Tạo CSS selector cho element có ID
     * @param {string} id - Giá trị ID
     * @returns {string} - CSS selector
     */
    static cssById(id) {
        return `#${id}`;
    }

    /**
     * Tạo CSS selector cho element có class
     * @param {string} className - Tên class
     * @returns {string} - CSS selector
     */
    static cssByClass(className) {
        return `.${className}`;
    }

    /**
     * Tạo CSS selector cho element có attribute
     * @param {string} attribute - Tên thuộc tính
     * @param {string} value - Giá trị thuộc tính
     * @returns {string} - CSS selector
     */
    static cssByAttribute(attribute, value) {
        return `[${attribute}="${value}"]`;
    }


    /**
     * Create a function that returns a formatted locator string
     * @param {string} template - Locator template with {0}, {1}, etc. placeholders
     * @returns {Function} - Function that accepts parameters and returns formatted locator
     */
    static create(template) {
        return (...args) => {
            let result = template;
            for (let i = 0; i < args.length; i++) {
                const regex = new RegExp(`\\{${i}\\}`, 'g');
                result = result.replace(regex, args[i]);
            }
            return result;
        };
    }

    /**
     * Create a locator for an element with a specific text
     * @param {string} baseXPath - Base XPath expression
     * @returns {Function} - Function that accepts text parameter
     */
    static withText(baseXPath) {
        return (text) => `${baseXPath}[contains(text(), '${text}')]`;
    }

    /**
     * Create a locator for an element with a specific attribute value
     * @param {string} baseXPath - Base XPath expression
     * @param {string} attribute - Attribute name
     * @returns {Function} - Function that accepts attribute value parameter
     */
    static withAttribute(baseXPath, attribute) {
        return (value) => `${baseXPath}[@${attribute}='${value}']`;
    }

    /**
     * Create a locator for an element containing a specific class
     * @param {string} baseXPath - Base XPath expression
     * @returns {Function} - Function that accepts class name parameter
     */
    static withClass(baseXPath) {
        return (className) => `${baseXPath}[contains(@class, '${className}')]`;
    }

    /**
     * Create a locator for an element with a specific ID
     * @param {string} baseXPath - Base XPath expression
     * @returns {Function} - Function that accepts ID parameter
     */
    static withId(baseXPath) {
        return (id) => `${baseXPath}[@id='${id}']`;
    }

    /**
     * Create a locator for the nth element matching a selector
     * @param {string} baseXPath - Base XPath expression
     * @returns {Function} - Function that accepts position parameter (1-based)
     */
    static nthElement(baseXPath) {
        return (position) => `(${baseXPath})[${position}]`;
    }
}

// Export class DynamicLocators
export default DynamicLocators;
