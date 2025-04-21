import fs from "fs";
import WaitHelper from "../utils/WaitHelper";
import { logger } from "../utils/Logger";
import DynamicLocators from "../locators/DynamicLocators";

class BasePage {
    constructor(page) {
        this.page = page;
        this.waitHelper = new WaitHelper(page);

        // Locators chung
        this.loadingIndicator = '//div[@class="loading-indicator"]';
        this.toastMessage = '//div[@class="toast-message"]';
        this.errorAlert = '//div[@class="alert alert-danger"]';
    }

    /**
     * Kiểm tra xem selector là XPath hay CSS
     * @param {string} selector - Selector cần kiểm tra
     * @returns {boolean} - True nếu là XPath
     */
    isXPath(selector) {
        return (
            selector.startsWith("//") ||
            selector.startsWith("xpath=") ||
            selector.startsWith("(//")
        );
    }

    /**
     * Chuẩn hóa selector để sử dụng với Playwright
     * @param {string} selector - Selector cần chuẩn hóa
     * @returns {string} - Selector đã chuẩn hóa
     */
    normalizeSelector(selector) {
        if (this.isXPath(selector)) {
            return selector.startsWith("xpath=") ? selector : `xpath=${selector}`;
        }
        return selector;
    }

    /**
     * Lấy locator từ selector
     * @param {string} selector - CSS hoặc XPath selector
     * @returns {Locator} - Playwright locator
     */
    getLocator(selector) {
        return this.page.locator(this.normalizeSelector(selector));
    }

    /**
     * Chờ cho đến khi loading indicator biến mất
     * @param {number} timeout - Thời gian chờ tối đa (ms)
     */
    async waitForLoadingToDisappear(timeout = 30000) {
        await this.waitHelper.waitForElementToBeHidden(
            this.loadingIndicator,
            timeout
        );
    }

    /**
     * Chờ cho đến khi toast message xuất hiện
     * @param {string} message - Nội dung message (tùy chọn)
     * @param {number} timeout - Thời gian chờ tối đa (ms)
     */
    async waitForToastMessage(message = null, timeout = 5000) {
        const locator = message
            ? DynamicLocators.create(
                '//div[@class="toast-message" and contains(text(), "{0}")]',
                message
            )
            : this.toastMessage;

        await this.waitHelper.waitForElementToBeVisible(locator, timeout);
    }

    /**
     * Kiểm tra xem element có hiển thị không
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @returns {Promise<boolean>} - True nếu element hiển thị
     */
    async isElementVisible(selector) {
        try {
            await this.waitHelper.waitForElementToBeVisible(selector);
            const locator = this.getLocator(selector);
            return await locator.isVisible(selector);
        } catch (error) {
            logger.error(`Lỗi khi kiểm tra element hiển thị: ${selector}`, error);
            return false;
        }
    }

    /**
 * Kiểm tra xem element có ẩn không
 * @param {string} selector - CSS hoặc XPath selector của phần tử
 * @returns {Promise<boolean>} - True nếu element ẩn
 */
    async isElementNotVisible(selector) {
        try {
            const locator = this.getLocator(selector);
            const count = await locator.count();

            if (count === 0) {
                return true;
            }

            const isVisible = await locator.isVisible();
            return !isVisible;
        } catch (error) {
            // Element doesn't exist, which means it's not visible
            logger.error(`Lỗi khi kiểm tra element không hiển thị: ${selector}`, error);
            return true;
        }
    }

    /**
     * Kiểm tra xem element có tồn tại không
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @returns {Promise<boolean>} - True nếu element tồn tại
     */
    async isElementExists(selector) {
        try {
            const locator = this.getLocator(selector);
            const count = await locator.count();
            return count > 0;
        } catch (error) {
            logger.error(`Lỗi khi kiểm tra element tồn tại: ${selector}`, error);
            return false;
        }
    }

    /**
     * Kiểm tra xem element có bị disabled không
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @returns {Promise<boolean>} - True nếu element bị disabled
     */
    async isElementDisabled(selector) {
        try {
            await this.waitHelper.waitForElementToBeVisible(selector);
            const locator = this.getLocator(selector);
            return await locator.isDisabled();
        } catch (error) {
            logger.error(`Lỗi khi kiểm tra element disabled: ${selector}`, error);
            return false;
        }
    }

    /**
     * Kiểm tra xem element có được chọn không
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @returns {Promise<boolean>} - True nếu element được chọn
     */
    async isElementChecked(selector) {
        try {
            await this.waitHelper.waitForElementToBeVisible(selector);
            const locator = this.getLocator(selector);
            return await locator.isChecked();
        } catch (error) {
            logger.error(`Lỗi khi kiểm tra element checked: ${selector}`, error);
            return false;
        }
    }

    /**
     * Cuộn trang để hiển thị phần tử được chỉ định sử dụng JavaScript
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @param {Object} options - Tùy chọn bổ sung
     * @param {string} options.behavior - Hành vi cuộn: 'auto', 'smooth' (mặc định: 'auto')
     * @param {string} options.block - Vị trí dọc: 'start', 'center', 'end', 'nearest' (mặc định: 'center')
     * @param {string} options.inline - Vị trí ngang: 'start', 'center', 'end', 'nearest' (mặc định: 'nearest')
     * @param {number} options.timeout - Thời gian chờ tối đa (ms) (mặc định: 5000)
     * @returns {Promise<boolean>} - True nếu phần tử hiển thị, false nếu không
     */
    async scrollToElementByJS(selector, options = {}) {
        const {
            behavior = "auto",
            block = "center",
            inline = "nearest",
            timeout = 5000,
        } = options;

        try {
            // Đợi phần tử xuất hiện trong DOM
            const locator = this.getLocator(selector);
            await locator.waitFor({ state: 'attached', timeout });

            // Xác định nếu selector là XPath
            const isXPathSelector = this.isXPath(selector);

            // Sử dụng scrollIntoView với các tùy chọn
            const isScrolled = await this.page.evaluate(
                ({ selector, isXPath, behavior, block, inline }) => {
                    let element;
                    if (isXPath) {
                        // Sử dụng document.evaluate cho XPath
                        const result = document.evaluate(
                            selector.replace(/^xpath=/, ''),
                            document,
                            null,
                            XPathResult.FIRST_ORDERED_NODE_TYPE,
                            null
                        );
                        element = result.singleNodeValue;
                    } else {
                        // Sử dụng querySelector cho CSS selector
                        element = document.querySelector(selector);
                    }

                    if (!element) return false;
                    element.scrollIntoView({ behavior, block, inline });
                    return true;
                },
                {
                    selector: isXPathSelector ? selector.replace(/^xpath=/, '') : selector,
                    isXPath: isXPathSelector,
                    behavior,
                    block,
                    inline
                }
            );

            if (!isScrolled) {
                return false;
            }

            // Kiểm tra xem phần tử có thực sự hiển thị không
            return await this.page.evaluate(
                ({ selector, isXPath }) => {
                    let element;
                    if (isXPath) {
                        const result = document.evaluate(
                            selector,
                            document,
                            null,
                            XPathResult.FIRST_ORDERED_NODE_TYPE,
                            null
                        );
                        element = result.singleNodeValue;
                    } else {
                        element = document.querySelector(selector);
                    }

                    if (!element) return false;
                    const rect = element.getBoundingClientRect();
                    return (
                        rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                    );
                },
                {
                    selector: isXPathSelector ? selector.replace(/^xpath=/, '') : selector,
                    isXPath: isXPathSelector
                }
            );
        } catch (error) {
            console.error(`Error scrolling to element ${selector}:`, error);
            return false;
        }
    }

    /**
     * Phương thức thay thế sử dụng cả hai cách
     */
    async scrollToElement(selector, options = {}) {
        try {
            // Đầu tiên thử với executeScript
            const scrolledWithJS = await this.scrollToElementByJS(selector, options);
            if (scrolledWithJS) return true;

            // Nếu không thành công, thử cách tiếp cận thứ hai với Playwright API
            const locator = this.getLocator(selector);
            await locator.scrollIntoViewIfNeeded();

            // Kiểm tra lại và thử cuộn thêm nếu cần
            const { maxAttempts = 3, scrollAmount = 200, delay = 300 } = options;

            if (await locator.isVisible()) {
                return true;
            }

            for (let i = 0; i < maxAttempts; i++) {
                await this.page.mouse.wheel(0, scrollAmount);
                await this.page.waitForTimeout(delay);

                if (await locator.isVisible()) {
                    return true;
                }
                console.log(`Scrolling to reveal ${selector}...`);
            }
            console.log(`Scrolled to element: ${selector}`);

            return false;
        } catch (error) {
            console.error(`Failed to scroll to element ${selector}:`, error);
            return false;
        }
    }

    /**
     * Cuộn đến tất cả các phần tử khớp với locator
     * @param {string} selector - XPath hoặc CSS selector
     * @param {Object} options - Tùy chọn bổ sung
     * @returns {Promise<void>}
     */
    async scrollToAllElements(selector, options = {}) {
        const { behavior = "smooth", block = "center", delay = 300 } = options;

        // Lấy tất cả các phần tử
        const locator = this.getLocator(selector);
        const count = await locator.count();

        // Cuộn đến từng phần tử
        for (let i = 0; i < count; i++) {
            const element = locator.nth(i);
            await element.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(delay);
        }
    }

    /**
     * Đợi cho đến khi phần tử có thể click được
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @param {number} timeout - Thời gian chờ tối đa (ms)
     * @returns {Promise<void>}
     */
    async waitForElementClickable(selector, timeout = 10000) {
        const locator = this.getLocator(selector);

        // Đợi phần tử xuất hiện trong DOM
        await locator.waitFor({ state: "attached", timeout });

        // Đợi phần tử hiển thị
        await locator.waitFor({ state: "visible", timeout });

        // Đợi phần tử có thể tương tác (không bị disabled)
        const isXPathSelector = this.isXPath(selector);

        if (isXPathSelector) {
            const xpathSelector = selector.startsWith("xpath=")
                ? selector.substring(6)
                : selector;

            await this.page.waitForFunction(
                ([xpath]) => {
                    const result = document.evaluate(
                        xpath,
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                    );
                    const element = result.singleNodeValue;
                    return (
                        element &&
                        !element.disabled &&
                        getComputedStyle(element).pointerEvents !== "none"
                    );
                },
                [xpathSelector],
                { timeout }
            );
        } else {
            await this.page.waitForFunction(
                ([cssSelector]) => {
                    const element = document.querySelector(cssSelector);
                    return (
                        element &&
                        !element.disabled &&
                        getComputedStyle(element).pointerEvents !== "none"
                    );
                },
                [selector],
                { timeout }
            );
        }
    }

    /**
     * Click vào phần tử với khả năng tùy chỉnh cuộn và chờ đợi
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @param {Object} options - Tùy chọn bổ sung
     * @param {Object} options.scrollOptions - Tùy chọn cho scrollToElement
     * @param {Object} options.clickOptions - Tùy chọn cho page.click
     * @param {number} options.timeout - Thời gian chờ tối đa cho phần tử có thể click (ms)
     * @returns {Promise<void>}
     */
    async click(selector, options = {}) {
        const { scrollOptions = {}, clickOptions = {}, timeout = 10000 } = options;
        try {
            await this.waitHelper.waitForElementToBeVisible(selector);
            // Cuộn đến phần tử với các tùy chọn được cung cấp
            await this.scrollToElement(selector, scrollOptions);

            // Đợi phần tử có thể click
            await this.waitForElementClickable(selector, timeout);

            // Click vào phần tử với các tùy chọn được cung cấp
            const locator = this.getLocator(selector);
            await locator.click(clickOptions);
        } catch (error) {
            logger.error(`Lỗi khi nhấp vào element: ${selector}`, error);
            throw error;
        }
    }

    /**
     * Điền văn bản vào phần tử
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @param {string} text - Văn bản cần điền vào phần tử
     * @param {Object} options - Tùy chọn bổ sung
     * @returns {Promise<boolean>} - true nếu đã điền, false nếu đã bỏ qua
     */
    async setText(selector, text, options = {}) {
        const {
            clearFirst = false,
            skipIfNotEmpty = true,
            timeout = 10000,
        } = options;

        try {
            await this.waitHelper.waitForElementToBeVisible(selector);

            // Cuộn đến phần tử và đợi nó có thể tương tác
            await this.scrollToElement(selector);
            await this.waitForElementClickable(selector, timeout);

            const locator = this.getLocator(selector);

            // Kiểm tra nếu cần bỏ qua
            if (skipIfNotEmpty) {
                const isXPathSelector = this.isXPath(selector);
                let currentValue;

                if (isXPathSelector) {
                    // Sử dụng evaluateHandle cho XPath
                    const handle = await this.page.evaluateHandle((xpath) => {
                        const result = document.evaluate(
                            xpath,
                            document,
                            null,
                            XPathResult.FIRST_ORDERED_NODE_TYPE,
                            null
                        );
                        const element = result.singleNodeValue;
                        return element ? element.value || element.textContent || "" : "";
                    }, selector.replace(/^xpath=/, ""));
                    currentValue = await handle.jsonValue();
                    await handle.dispose();
                } else {
                    // Sử dụng evaluate cho CSS selector
                    currentValue = await this.page.evaluate((cssSelector) => {
                        const el = document.querySelector(cssSelector);
                        return el ? el.value || el.textContent || "" : "";
                    }, selector);
                }

                if (currentValue.trim() !== "") {
                    return false; // Đã bỏ qua
                }
            }

            // Xóa nội dung nếu cần
            if (clearFirst) {
                await locator.fill("");
            }

            // Điền văn bản
            await locator.fill(text);
            return true; // Đã điền
        } catch (error) {
            logger.error(`Lỗi khi điền text vào input: ${selector}`, error);
            throw error;
        }
    }

    /**
     * Điền văn bản vào trường input có xử lý sự kiện JavaScript
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @param {string} text - Văn bản cần điền vào phần tử
     * @returns {Promise<void>}
     */
    async setTextWithEvents(selector, text, options = {}) {
        const { timeout = 10000 } = options;

        await this.waitHelper.waitForElementToBeVisible(selector);
        await this.scrollToElement(selector, options.scrollOptions || {});
        await this.waitForElementClickable(selector, timeout);

        const isXPathSelector = this.isXPath(selector);

        // Sử dụng JavaScript để thiết lập giá trị và kích hoạt sự kiện
        await this.page.evaluate(
            ({ selector, text, isXPath }) => {
                let element;

                if (isXPath) {
                    const result = document.evaluate(
                        selector,
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                    );
                    element = result.singleNodeValue;
                } else {
                    element = document.querySelector(selector);
                }

                if (!element) return false;

                // Thiết lập giá trị
                element.value = text;

                // Kích hoạt các sự kiện
                element.dispatchEvent(new Event("input", { bubbles: true }));
                element.dispatchEvent(new Event("change", { bubbles: true }));

                return true;
            },
            {
                selector: isXPathSelector ? selector.replace(/^xpath=/, '') : selector,
                text,
                isXPath: isXPathSelector
            }
        );
    }

    /**
     * Lấy nội dung hoặc giá trị của phần tử
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @param {Object} options - Tùy chọn bổ sung
     * @param {boolean} options.preferValue - Ưu tiên lấy value thay vì textContent (mặc định: false)
     * @param {boolean} options.trim - Xóa khoảng trắng thừa (mặc định: true)
     * @param {number} options.timeout - Thời gian chờ tối đa (ms)
     * @returns {Promise<string>} - Nội dung hoặc giá trị của phần tử
     */
    async getText(selector, options = {}) {
        const { preferValue = false, trim = true, timeout = 10000 } = options;

        try {
            await this.waitHelper.waitForElementToBeVisible(selector);
            // Cuộn đến phần tử và đợi nó có thể tương tác
            await this.scrollToElement(selector);

            const isXPathSelector = this.isXPath(selector);

            // Lấy nội dung hoặc giá trị của phần tử
            let content;

            if (preferValue) {
                // Ưu tiên lấy value (cho các phần tử form)
                content = await this.page.evaluate(
                    ({ selector, isXPath }) => {
                        let element;

                        if (isXPath) {
                            const result = document.evaluate(
                                selector,
                                document,
                                null,
                                XPathResult.FIRST_ORDERED_NODE_TYPE,
                                null
                            );
                            element = result.singleNodeValue;
                        } else {
                            element = document.querySelector(selector);
                        }

                        if (!element) return "";

                        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                            return element.value;
                        } else if (element.tagName === "SELECT") {
                            return element.options[element.selectedIndex]?.value || "";
                        } else {
                            return element.textContent;
                        }
                    },
                    {
                        selector: isXPathSelector ? selector.replace(/^xpath=/, '') : selector,
                        isXPath: isXPathSelector
                    }
                );
            } else {
                // Mặc định lấy textContent
                const locator = this.getLocator(selector);
                content = await locator.textContent();
            }

            return trim && content ? content.trim() : content || "";
        } catch (error) {
            console.error(`Lỗi khi lấy nội dung của phần tử ${selector}:`, error);
            return "";
        }
    }

    /**
     * Lấy giá trị của input
     * @param {string} selector - Selector của input
     * @returns {Promise<string>} - Giá trị của input
     */
    async getInputValue(selector) {
        try {
            await this.waitHelper.waitForElementToBeVisible(selector);
            const locator = this.getLocator(selector);
            return await locator.inputValue();;
        } catch (error) {
            logger.error(`Lỗi khi lấy giá trị input: ${selector}`, error);
            throw error;
        }
    }

    /**
     * Hover chuột trên element
     * @param {string} selector - Selector của phần tử
     */
    async hover(selector) {
        try {
            await this.waitHelper.waitForElementToBeVisible(selector);
            const locator = this.getLocator(selector);
            await locator.hover();
        } catch (error) {
            logger.error(`Lỗi khi hover chuột: ${selector}`, error);
            throw error;
        }
    }

    /**
     * Nhấn phím
     * @param {string} selector - Selector của phần tử
     * @param {string} key - Phím cần nhấn
     */
    async pressKey(selector, key) {
        try {
            await this.waitHelper.waitForElementToBeVisible(selector);
            const locator = this.getLocator(selector);
            await locator.press(key);
        } catch (error) {
            logger.error(`Lỗi khi nhấn phím: ${selector}, ${key}`, error);
            throw error;
        }
    }

    /**
     * Thực hiện double click vào phần tử được xác định bởi selector
     * @param selector - Selector của phần tử
     * @param options - Các tùy chọn bổ sung
     */
    async doubleClick(selector, options = { timeout: 10000, force: false }) {
        try {
            await this.scrollToElement(selector);
            await this.waitForElementClickable(selector, options.timeout);
            const locator = this.getLocator(selector);
            await locator.dblclick({ force: options.force });
        } catch (error) {
            throw new Error(
                `Không thể double click vào phần tử "${selector}": ${error.message}`
            );
        }
    }

    /**
     * Thực hiện triple click vào phần tử được xác định bởi selector
     * @param selector - Selector của phần tử
     * @param options - Các tùy chọn bổ sung
     */
    async tripleClick(selector, options = { timeout: 10000, force: false }) {
        try {
            await this.scrollToElement(selector);
            await this.waitForElementClickable(selector, options.timeout);
            const locator = this.getLocator(selector);
            await locator.click({
                clickCount: 3,
                force: options.force,
            });
        } catch (error) {
            throw new Error(
                `Không thể triple click vào phần tử "${selector}": ${error.message}`
            );
        }
    }

    /**
     * Chụp ảnh màn hình và lưu vào thư mục screenshots
     * @param fileName - Tên file ảnh (mặc định: 'screenshot.png')
     * @param options - Các tùy chọn chụp ảnh bổ sung
     * @returns Đường dẫn đến file ảnh đã lưu
     */
    async takeScreenshot(
        fileName = "screenshot.png",
        options = { fullPage: true }
    ) {
        try {
            // Tạo thư mục screenshots nếu chưa tồn tại
            const screenshotsDir = "screenshots";
            if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir, { recursive: true });
            }

            // Thêm timestamp vào tên file để tránh ghi đè
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const fileNameWithTimestamp = fileName.includes(".png")
                ? fileName.replace(".png", `_${timestamp}.png`)
                : `${fileName}_${timestamp}.png`;

            const screenshotPath = `${screenshotsDir}/${fileNameWithTimestamp}`;

            // Chụp ảnh màn hình với các tùy chọn
            await this.page.screenshot({
                path: screenshotPath,
                fullPage: options.fullPage,
                ...options,
            });

            logger.debug(`Screenshot saved: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            logger.error(`Failed to take screenshot: ${error.message}`);
            throw error;
        }
    }

    /**
     * Thực hiện thao tác kéo và thả từ phần tử nguồn đến phần tử đích
     * @param sourceSelector - Selector của phần tử nguồn
     * @param targetSelector - Selector của phần tử đích
     * @param options - Các tùy chọn bổ sung
     */
    async dragAndDrop(
        sourceSelector,
        targetSelector,
        options = { timeout: 10000 }
    ) {
        try {
            // Tìm các phần tử
            const source = this.getLocator(sourceSelector);
            const target = this.getLocator(targetSelector);

            // Đợi các phần tử hiển thị
            await source.waitFor({ state: "visible", timeout: options.timeout });
            await target.waitFor({ state: "visible", timeout: options.timeout });

            // Cuộn đến phần tử nguồn nếu cần
            await source.scrollToElement();

            console.log(`Dragging ${sourceSelector} to ${targetSelector}...`);

            // Thực hiện kéo và thả
            await source.dragTo(target);

            // Đợi một chút để đảm bảo hiệu ứng kéo thả hoàn tất
            await this.page.waitForTimeout(500);

            console.log(`Drag and drop completed.`);
        } catch (error) {
            console.error(`Drag and drop failed: ${error.message}`);
            // Chụp ảnh màn hình khi xảy ra lỗi để debug
            // if (this.takeScreenshot) {
            //     await this.takeScreenshot(`drag_drop_error.png`);
            // }
            throw new Error(
                `Không thể kéo thả từ "${sourceSelector}" đến "${targetSelector}": ${error.message}`
            );
        }
    }

    /**
     * Tải lên file thông qua hộp thoại chọn file
     * @param buttonSelector - Selector của nút mở hộp thoại chọn file
     * @param filePath - Đường dẫn đến file cần tải lên (có thể là một file hoặc một mảng các file)
     * @param options - Các tùy chọn bổ sung
     */
    async uploadFileWithDialog(
        buttonSelector,
        filePath,
        options = { timeout: 30000 }
    ) {
        try {
            console.log(
                `Simulating file selection for ${Array.isArray(filePath) ? filePath.join(", ") : filePath
                }`
            );

            // Đảm bảo nút hiển thị và có thể click
            await this.waitForElementClickable(buttonSelector, options.timeout);

            // Lắng nghe sự kiện mở hộp thoại file và click vào nút
            const [fileChooser] = await Promise.all([
                this.page.waitForEvent("filechooser", { timeout: options.timeout }),
                this.click(buttonSelector),
            ]);

            // Thiết lập file(s) cho hộp thoại
            await fileChooser.setFiles(filePath);

            // Đợi một chút để đảm bảo file đã được xử lý
            await this.page.waitForTimeout(1000);

            console.log(
                `File uploaded: ${Array.isArray(filePath) ? filePath.join(", ") : filePath
                }`
            );
        } catch (error) {
            console.error(`File upload failed: ${error.message}`);
            // Chụp ảnh màn hình khi xảy ra lỗi để debug
            // if (this.takeScreenshot) {
            //     await this.takeScreenshot(`file_upload_error.png`);
            // }
            throw new Error(
                `Không thể tải lên file thông qua "${buttonSelector}": ${error.message}`
            );
        }
    }

    /**
     * Tải lên file trực tiếp không qua dialog bằng cách sử dụng file từ thư mục lib
     * @param inputSelector - Selector của phần tử input[type="file"]
     * @param fileName - Tên file trong thư mục lib (hoặc mảng tên file)
     * @param libFolderPath - Đường dẫn đến thư mục lib (mặc định: './lib/testdata/files')
     */
    async uploadFile(inputSelector, fileName, libFolderPath = "./lib") {
        try {
            // Xác định đường dẫn đầy đủ đến file
            let filePaths;

            if (Array.isArray(fileName)) {
                // Nếu là mảng tên file, tạo mảng đường dẫn đầy đủ
                filePaths = fileName.map((name) => path.resolve(libFolderPath, name));
                console.log(`Uploading multiple files: ${fileName.join(", ")}`);
            } else {
                // Nếu là một file, tạo đường dẫn đầy đủ
                filePaths = path.resolve(libFolderPath, fileName);
                console.log(`Uploading file: ${fileName}`);
            }

            // Kiểm tra xem file có tồn tại không
            if (!Array.isArray(filePaths)) {
                if (!fs.existsSync(filePaths)) {
                    throw new Error(`File không tồn tại: ${filePaths}`);
                }
            } else {
                for (const filePath of filePaths) {
                    if (!fs.existsSync(filePath)) {
                        throw new Error(`File không tồn tại: ${filePath}`);
                    }
                }
            }

            // Tìm phần tử input file
            const fileInput = this.getLocator(inputSelector);

            // Đợi phần tử input file hiển thị
            await fileInput.waitFor({ state: "attached", timeout: 10000 });

            // Đôi khi input file bị ẩn bởi CSS, cần làm cho nó hiển thị
            const isXPathSelector = this.isXPath(inputSelector);
            await this.page.evaluate(
                ({ selector, isXPath }) => {
                    let element;

                    if (isXPath) {
                        const result = document.evaluate(
                            selector,
                            document,
                            null,
                            XPathResult.FIRST_ORDERED_NODE_TYPE,
                            null
                        );
                        element = result.singleNodeValue;
                    } else {
                        element = document.querySelector(selector);
                    }

                    if (element) {
                        element.style.opacity = "1";
                        element.style.display = "block";
                        element.style.visibility = "visible";
                    }
                },
                {
                    selector: isXPathSelector ? inputSelector.replace(/^xpath=/, '') : inputSelector,
                    isXPath: isXPathSelector
                }
            );

            // Thiết lập file(s) cho input
            await fileInput.setInputFiles(filePaths);

            // Đợi một chút để đảm bảo file đã được xử lý
            await this.page.waitForTimeout(1000);

            console.log(`File upload completed.`);
        } catch (error) {
            console.error(`File upload failed: ${error.message}`);
            // Chụp ảnh màn hình khi xảy ra lỗi để debug
            // if (this.takeScreenshot) {
            //     await this.takeScreenshot(`direct_upload_error.png`);
            // }
            throw new Error(
                `Không thể tải lên file thông qua "${inputSelector}": ${error.message}`
            );
        }
    }

    /**
     * Tạo locator động
     * @param {string} baseLocator - Locator cơ sở chứa placeholder
     * @param {...any} params - Các tham số để thay thế vào placeholder
     * @returns {string} - Locator đã được thay thế tham số
     */
    createLocator(baseLocator, ...params) {
        return DynamicLocators.create(baseLocator, ...params);
    }

    /**
     * Tạo XPath locator với text chính xác
     * @param {string} text - Text cần tìm
     * @returns {string} - XPath locator
     */
    getExactTextLocator(text) {
        return DynamicLocators.exactText(text);
    }

    /**
     * Tạo XPath locator chứa text
     * @param {string} text - Text cần tìm
     * @returns {string} - XPath locator
     */
    getContainsTextLocator(text) {
        return DynamicLocators.containsText(text);
    }

    /**
     * Tạo XPath locator cho button với text
     * @param {string} text - Text của button
     * @returns {string} - XPath locator
     */
    getButtonLocator(text) {
        return DynamicLocators.button(text);
    }

    /**
     * Tạo XPath locator cho link với text
     * @param {string} text - Text của link
     * @returns {string} - XPath locator
     */
    getLinkLocator(text) {
        return DynamicLocators.link(text);
    }

    /**
     * Tạo XPath locator cho input với label
     * @param {string} label - Label của input
     * @returns {string} - XPath locator
     */
    getInputByLabelLocator(label) {
        return DynamicLocators.inputByLabel(label);
    }

    /**
     * Lấy giá trị của attribute
     * @param {string} selector - Selector của element
     * @param {string} attributeName - Tên attribute
     * @returns {Promise<string>} - Giá trị của attribute
     */
    async getAttribute(selector, attributeName) {
        try {
            await this.waitHelper.waitForElementToBeVisible(selector);
            const locator = this.getLocator(selector);
            return await locator.getAttribute(attributeName);
        } catch (error) {
            logger.error(
                `Lỗi khi lấy attribute: ${selector}, ${attributeName}`,
                error
            );
            throw error;
        }
    }

    /**
     * Chọn option trong dropdown
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @param {string} value - Giá trị cần chọn
     */
    async selectOption(selector, value) {
        try {
            await this.waitHelper.waitForElementToBeVisible(selector);
            const locator = this.getLocator(selector);

            // Kiểm tra nếu là thẻ <select> -> dùng selectOption
            const isNativeDropdown = await locator.evaluate(el => el.tagName === 'SELECT');

            if (isNativeDropdown) {
                await locator.selectOption(value); // Dùng cách Playwright cho <select>
            } else {
                // Xử lý custom dropdown (ví dụ: click mở dropdown -> chọn option)
                await locator.click(); // Mở dropdown
                await this.page.click(`text=${value}`); // Chọn option bằng text
            }
        } catch (error) {
            logger.error(`Lỗi khi chọn option "${value}" trong dropdown: ${selector}`, error);
            throw error;
        }
    }

    /**
     * Select a random value from a dropdown
     * @param {string} dropdownSelector - Selector for the dropdown element
     * @param {string} optionsSelector - Selector for the dropdown options
     * @returns {Promise<string>} - The text of the randomly selected option
     */
    async selectRandomValueFromDropdown(dropdownSelector, optionsSelector) {
        const dropdownLocator = this.getLocator(dropdownSelector);
        const optionsLocator = this.getLocator(optionsSelector);

        await this.waitHelper.waitForElementToBeVisible(dropdownSelector);
        await dropdownLocator.scrollIntoViewIfNeeded();
        await dropdownLocator.click();

        await this.waitHelper.waitForElementToBeVisible(optionsSelector);

        const count = await optionsLocator.count();
        if (count === 0) throw new Error("Dropdown is empty!");

        const randomIndex = Math.floor(Math.random() * count);
        const randomOption = optionsLocator.nth(randomIndex);
        const randomValue = await randomOption.textContent();

        await this.page.waitForTimeout(500);
        await randomOption.click();
        await this.page.waitForTimeout(500);

        return randomValue.trim();
    }

    /**
     * Select a value from dropdown by index
     * @param {string} dropdownSelector - Selector for the dropdown element
     * @param {string} optionsSelector - Selector for the dropdown options
     * @param {number} index - Index of the option to select (0-based)
     * @returns {Promise<string>} - The text of the selected option
     */
    async selectValueFromDropdownByIndex(
        dropdownSelector,
        optionsSelector,
        index
    ) {
        const dropdownLocator = this.getLocator(dropdownSelector);
        const optionsLocator = this.getLocator(optionsSelector);

        await this.waitHelper.waitForElementToBeVisible(dropdownSelector);
        await dropdownLocator.scrollIntoViewIfNeeded();
        await dropdownLocator.click();

        await this.waitHelper.waitForElementToBeVisible(optionsSelector);

        const count = await optionsLocator.count();
        if (count === 0) throw new Error("Dropdown is empty!");
        if (index >= count)
            throw new Error(`Index out of range! Max index: ${count - 1}`);

        const selectedOption = optionsLocator.nth(index);
        const selectedValue = await selectedOption.textContent();

        await this.page.waitForTimeout(500);
        await selectedOption.click();

        return selectedValue.trim();
    }

    /**
     * Select a fixed value from dropdown
     * @param {string} dropdownSelector - Selector for the dropdown element
     * @param {string} valueSelector - Selector for the specific value to select
     */
    async selectFixedValueFromDropdown(dropdownSelector, valueSelector) {
        const dropdownLocator = this.getLocator(dropdownSelector);
        const valueLocator = this.getLocator(valueSelector);

        await this.waitHelper.waitForElementToBeVisible(dropdownSelector);
        await dropdownLocator.scrollIntoViewIfNeeded();
        await dropdownLocator.click();

        await this.waitHelper.waitForElementToBeVisible(valueSelector);

        await this.page.waitForTimeout(500);
        await valueLocator.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Select a value from dropdown by searching through options
     * @param {string} dropdownSelector - Selector for the dropdown element
     * @param {string} valueDisplaySelector - Selector for the element showing current value
     * @param {string} expectedValue - Value to select
     */
    async selectValueFromDropdown(
        dropdownSelector,
        valueDisplaySelector,
        expectedValue
    ) {
        const dropdownLocator = this.getLocator(dropdownSelector);
        const valueDisplayLocator = this.getLocator(valueDisplaySelector);

        await dropdownLocator.click();
        await this.page.waitForTimeout(500);

        let currentValue = await this.getText(valueDisplaySelector);
        let attempts = 0;
        const maxAttempts = 20; // Prevent infinite loops

        while (!currentValue.includes(expectedValue) && attempts < maxAttempts) {
            await dropdownLocator.press("ArrowDown");
            await dropdownLocator.press("Enter");
            await this.page.waitForTimeout(200);

            currentValue = await this.getText(valueDisplaySelector);
            attempts++;
        }

        if (!currentValue.includes(expectedValue)) {
            throw new Error(
                `Could not find value "${expectedValue}" in dropdown after ${maxAttempts} attempts`
            );
        }

        await valueDisplayLocator.click();
    }

    // Get all list value from dropdown
    async getListValueFromDropdown(dropdownSelector, optionsSelector) {
        const dropdownLocator = this.getLocator(dropdownSelector);
        const optionsLocator = this.getLocator(optionsSelector);

        await this.waitHelper.waitForElementToBeVisible(dropdownSelector);
        await dropdownLocator.scrollIntoViewIfNeeded();
        await dropdownLocator.click();

        await this.waitHelper.waitForElementToBeVisible(optionsSelector);

        const count = await optionsLocator.count();
        if (count === 0) throw new Error("Dropdown is empty!");

        const listValue = [];
        for (let i = 0; i < count; i++) {
            const option = optionsLocator.nth(i);
            const value = await option.textContent();
            listValue.push(value.trim());
        }

        return listValue;
    }
}

export default BasePage;
