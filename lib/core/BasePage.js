import fs from 'fs';

/**
 * Class cơ sở cho tất cả các page object
 */
class BasePage {
    constructor(page) {
        this.page = page;
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
            behavior = 'auto',
            block = 'center',
            inline = 'nearest',
            timeout = 5000
        } = options;

        try {
            // Đợi phần tử xuất hiện trong DOM
            await this.page.waitForSelector(selector, { timeout });

            // Sử dụng scrollIntoView với các tùy chọn
            const isScrolled = await this.page.evaluate(
                ({ selector, behavior, block, inline }) => {
                    const element = document.querySelector(selector);
                    if (!element) return false;

                    element.scrollIntoView({ behavior, block, inline });
                    return true;
                },
                { selector, behavior, block, inline }
            );

            if (!isScrolled) {
                return false;
            }

            // Kiểm tra xem phần tử có thực sự hiển thị không
            return await this.page.evaluate(selector => {
                const element = document.querySelector(selector);
                if (!element) return false;

                const rect = element.getBoundingClientRect();
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
            }, selector);
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
            const element = this.page.locator(selector);
            await element.scrollIntoViewIfNeeded();

            // Kiểm tra lại và thử cuộn thêm nếu cần
            const { maxAttempts = 3, scrollAmount = 200, delay = 300 } = options;

            if (await element.isVisible()) {
                return true;
            }

            for (let i = 0; i < maxAttempts; i++) {
                await this.page.mouse.wheel(0, scrollAmount);
                await this.page.waitForTimeout(delay);

                if (await element.isVisible()) {
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
 * @param {string} locator - XPath hoặc CSS selector
 * @param {Object} options - Tùy chọn bổ sung
 * @returns {Promise<void>}
 */
    async scrollToAllElements(locator, options = {}) {
        const {
            behavior = 'smooth',
            block = 'center',
            delay = 300
        } = options;

        // Xác định loại locator
        const isXPath = locator.startsWith('//') || locator.startsWith('(//');

        // Lấy tất cả các phần tử
        let elements;
        if (isXPath) {
            elements = await this.page.$x(locator);
        } else {
            elements = await this.page.$$(locator);
        }

        // Cuộn đến từng phần tử
        for (const element of elements) {
            await this.page.evaluate(
                ({ element, behavior, block }) => {
                    element.scrollIntoView({ behavior, block });
                },
                { element, behavior, block }
            );

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
        // Đợi phần tử xuất hiện trong DOM
        await this.page.waitForSelector(selector, { state: 'attached', timeout });

        // Đợi phần tử hiển thị
        await this.page.waitForSelector(selector, { state: 'visible', timeout });

        // Đợi phần tử có thể tương tác (không bị disabled)
        await this.page.waitForFunction(
            (selector) => {
                const element = document.querySelector(selector);
                return element &&
                    !element.disabled &&
                    !element.getAttribute('disabled') &&
                    getComputedStyle(element).pointerEvents !== 'none';
            },
            selector,
            { timeout }
        );
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
        const {
            scrollOptions = {},
            clickOptions = {},
            timeout = 10000
        } = options;

        // Cuộn đến phần tử với các tùy chọn được cung cấp
        await this.scrollToElement(selector, scrollOptions);

        // Đợi phần tử có thể click
        await this.waitForElementClickable(selector, timeout);

        // Click vào phần tử với các tùy chọn được cung cấp
        await this.page.click(selector, clickOptions);
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
            timeout = 10000
        } = options;

        try {
            // Cuộn đến phần tử và đợi nó có thể tương tác
            await this.scrollToElement(selector);
            await this.waitForElementClickable(selector, timeout);

            // Kiểm tra nếu cần bỏ qua
            if (skipIfNotEmpty) {
                const currentValue = await this.page.evaluate(selector => {
                    const el = document.querySelector(selector);
                    return el ? (el.value || el.textContent || '') : '';
                }, selector);

                if (currentValue.trim() !== '') {
                    return false; // Đã bỏ qua
                }
            }

            // Xóa nội dung nếu cần
            if (clearFirst) {
                await this.page.fill(selector, '');
            }

            // Điền văn bản
            await this.page.fill(selector, text);
            return true; // Đã điền
        } catch (error) {
            console.error(`Lỗi khi điền văn bản: ${error.message}`);
            return false;
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

        await this.scrollToElement(selector, options.scrollOptions || {});
        await this.waitForElementClickable(selector, timeout);

        // Sử dụng JavaScript để thiết lập giá trị và kích hoạt sự kiện
        await this.page.evaluate(
            ({ selector, text }) => {
                const element = document.querySelector(selector);
                if (!element) return false;

                // Thiết lập giá trị
                element.value = text;

                // Kích hoạt các sự kiện
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));

                return true;
            },
            { selector, text }
        );
    }

    /**
     * Lấy nội dung hoặc giá trị của phần tử
     * @param {string} selector - CSS hoặc XPath selector của phần tử
     * @param {Object} options - Tùy chọn bổ sung
     * @param {boolean} options.waitForElement - Đợi phần tử xuất hiện (mặc định: true)
     * @param {boolean} options.scrollToElement - Cuộn đến phần tử (mặc định: true)
     * @param {boolean} options.preferValue - Ưu tiên lấy value thay vì textContent (mặc định: false)
     * @param {boolean} options.trim - Xóa khoảng trắng thừa (mặc định: true)
     * @param {number} options.timeout - Thời gian chờ tối đa (ms)
     * @returns {Promise<string>} - Nội dung hoặc giá trị của phần tử
     */
    async getText(selector, options = {}) {
        const {
            waitForElement = true,
            scrollToElement = true,
            preferValue = false,
            trim = true,
            timeout = 10000
        } = options;

        try {
            // Cuộn đến phần tử nếu được yêu cầu
            if (scrollToElement) {
                await this.scrollToElement(selector);
            }

            // Đợi phần tử xuất hiện nếu được yêu cầu
            if (waitForElement) {
                await this.page.waitForSelector(selector, { timeout });
            }

            // Lấy nội dung hoặc giá trị của phần tử
            let content;

            if (preferValue) {
                // Ưu tiên lấy value (cho các phần tử form)
                content = await this.page.evaluate(selector => {
                    const element = document.querySelector(selector);
                    if (!element) return '';

                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        return element.value;
                    } else if (element.tagName === 'SELECT') {
                        return element.options[element.selectedIndex]?.value || '';
                    } else {
                        return element.textContent;
                    }
                }, selector);
            } else {
                // Mặc định lấy textContent
                content = await this.page.textContent(selector);
            }

            return trim && content ? content.trim() : (content || '');
        } catch (error) {
            console.error(`Lỗi khi lấy nội dung của phần tử ${selector}:`, error);
            return '';
        }
    }

    /**
 * Điều hướng đến URL
 * @param {string} url - URL cần điều hướng đến
 * @returns {Promise<boolean>} - true nếu thành công, false nếu thất bại
 */
    async navigateTo(url) {
        try {
            await this.page.goto(url, {
                waitUntil: 'load',  // Các giá trị có thể: 'load', 'domcontentloaded', 'networkidle', 'commit'
                timeout: 30000
            });
            return true;
        } catch (error) {
            console.error(`Lỗi khi điều hướng đến ${url}: ${error.message}`);
            return false;
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
            await this.page.dblclick(selector, { force: options.force });
        } catch (error) {
            throw new Error(`Không thể double click vào phần tử "${selector}": ${error.message}`);
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
            await this.page.click(selector, {
                clickCount: 3,
                force: options.force
            });
        } catch (error) {
            throw new Error(`Không thể triple click vào phần tử "${selector}": ${error.message}`);
        }
    }

    /**
 * Chụp ảnh màn hình và lưu vào thư mục screenshots
 * @param fileName - Tên file ảnh (mặc định: 'screenshot.png')
 * @param options - Các tùy chọn chụp ảnh bổ sung
 * @returns Đường dẫn đến file ảnh đã lưu
 */
    async takeScreenshot(fileName = 'screenshot.png', options = { fullPage: true }) {
        try {
            // Tạo thư mục screenshots nếu chưa tồn tại
            const screenshotsDir = 'screenshots';
            if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir, { recursive: true });
            }

            // Thêm timestamp vào tên file để tránh ghi đè
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileNameWithTimestamp = fileName.includes('.png')
                ? fileName.replace('.png', `_${timestamp}.png`)
                : `${fileName}_${timestamp}.png`;

            const screenshotPath = `${screenshotsDir}/${fileNameWithTimestamp}`;

            // Chụp ảnh màn hình với các tùy chọn
            await this.page.screenshot({
                path: screenshotPath,
                fullPage: options.fullPage,
                ...options
            });

            console.log(`Screenshot saved: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            console.error(`Failed to take screenshot: ${error.message}`);
            throw new Error(`Không thể chụp ảnh màn hình: ${error.message}`);
        }
    }


    /**
 * Chờ cho trang web tải xong
 * @param state - Trạng thái tải trang (mặc định: 'networkidle'). networkidle sử dụng để xác định khi nào một trang web đã hoàn tất việc tải.
 * @param timeout - Thời gian chờ tối đa (ms)
 */
    async waitForPageLoad(state = 'networkidle', timeout = 30000) {
        try {
            console.log(`Waiting for page to load with state: ${state}`);
            await this.page.waitForLoadState(state, { timeout });
            console.log(`Page loaded with state: ${state}`);
        } catch (error) {
            console.error(`Page load timeout: ${error.message}`);
            // Chụp ảnh màn hình khi xảy ra lỗi để debug
            // const errorScreenshotPath = await this.takeScreenshot(`page_load_error_${state}.png`);
            throw new Error(`Trang không tải xong với trạng thái "${state}" sau ${timeout}ms. Error screenshot: ${errorScreenshotPath}`);
        }
    }

    /**
 * Thực hiện thao tác kéo và thả từ phần tử nguồn đến phần tử đích
 * @param sourceSelector - Selector của phần tử nguồn
 * @param targetSelector - Selector của phần tử đích
 * @param options - Các tùy chọn bổ sung
 */
    async dragAndDrop(sourceSelector, targetSelector, options = { timeout: 10000 }) {
        try {
            // Tìm các phần tử
            const source = this.page.locator(sourceSelector);
            const target = this.page.locator(targetSelector);

            // Đợi các phần tử hiển thị
            await source.waitFor({ state: 'visible', timeout: options.timeout });
            await target.waitFor({ state: 'visible', timeout: options.timeout });

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
            throw new Error(`Không thể kéo thả từ "${sourceSelector}" đến "${targetSelector}": ${error.message}`);
        }
    }

    /**
 * Tải lên file thông qua hộp thoại chọn file
 * @param buttonSelector - Selector của nút mở hộp thoại chọn file
 * @param filePath - Đường dẫn đến file cần tải lên (có thể là một file hoặc một mảng các file)
 * @param options - Các tùy chọn bổ sung
 */
    async uploadFileWithDialog(buttonSelector, filePath, options = { timeout: 30000 }) {
        try {
            console.log(`Simulating file selection for ${Array.isArray(filePath) ? filePath.join(', ') : filePath}`);

            // Đảm bảo nút hiển thị và có thể click
            await this.waitForElementClickable(buttonSelector, options.timeout);

            // Lắng nghe sự kiện mở hộp thoại file và click vào nút
            const [fileChooser] = await Promise.all([
                this.page.waitForEvent('filechooser', { timeout: options.timeout }),
                this.page.click(buttonSelector),
            ]);

            // Thiết lập file(s) cho hộp thoại
            await fileChooser.setFiles(filePath);

            // Đợi một chút để đảm bảo file đã được xử lý
            await this.page.waitForTimeout(1000);

            console.log(`File uploaded: ${Array.isArray(filePath) ? filePath.join(', ') : filePath}`);
        } catch (error) {
            console.error(`File upload failed: ${error.message}`);
            // Chụp ảnh màn hình khi xảy ra lỗi để debug
            // if (this.takeScreenshot) {
            //     await this.takeScreenshot(`file_upload_error.png`);
            // }
            throw new Error(`Không thể tải lên file thông qua "${buttonSelector}": ${error.message}`);
        }
    }


    /**
 * Tải lên file trực tiếp không qua dialog bằng cách sử dụng file từ thư mục lib
 * @param inputSelector - Selector của phần tử input[type="file"]
 * @param fileName - Tên file trong thư mục lib (hoặc mảng tên file)
 * @param libFolderPath - Đường dẫn đến thư mục lib (mặc định: './lib/testdata/files')
 */
    async uploadFile(inputSelector, fileName, libFolderPath = './lib') {
        try {
            // Xác định đường dẫn đầy đủ đến file
            let filePaths;

            if (Array.isArray(fileName)) {
                // Nếu là mảng tên file, tạo mảng đường dẫn đầy đủ
                filePaths = fileName.map(name => path.resolve(libFolderPath, name));
                console.log(`Uploading multiple files: ${fileName.join(', ')}`);
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
            const fileInput = this.page.locator(inputSelector);

            // Đợi phần tử input file hiển thị
            await fileInput.waitFor({ state: 'attached', timeout: 10000 });

            // Đôi khi input file bị ẩn bởi CSS, cần làm cho nó hiển thị
            await this.page.evaluate((selector) => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.opacity = '1';
                    element.style.display = 'block';
                    element.style.visibility = 'visible';
                }
            }, inputSelector);

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
            throw new Error(`Không thể tải lên file thông qua "${inputSelector}": ${error.message}`);
        }
    }

}

export default BasePage;


