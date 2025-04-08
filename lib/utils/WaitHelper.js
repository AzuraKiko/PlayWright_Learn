/**
 * Helper class for handling waits in page interactions
 */
class WaitHelper {
    constructor(page) {
        this.page = page;
        this.defaultTimeout = 30000; // Default timeout in milliseconds
    }

    /**
     * Wait for an element to be visible
     * @param {string} selector - XPath or CSS selector
     * @param {Object} options - Options for waiting
     * @returns {Promise<ElementHandle>} - Element handle
     */
    async waitForElementToBeVisible(selector, options = {}) {
        const timeout = options.timeout || this.defaultTimeout;
        const isXPath = selector.startsWith('//') || selector.startsWith('(//');

        if (isXPath) {
            await this.page.waitForSelector(`xpath=${selector}`, {
                state: 'visible',
                timeout
            });
            return await this.page.$(`xpath=${selector}`);
        } else {
            await this.page.waitForSelector(selector, {
                state: 'visible',
                timeout
            });
            return await this.page.$(selector);
        }
    }

    /**
     * Wait for an element to be hidden
     * @param {string} selector - XPath or CSS selector
     * @param {Object} options - Options for waiting
     */
    async waitForElementToBeHidden(selector, options = {}) {
        const timeout = options.timeout || this.defaultTimeout;
        const isXPath = selector.startsWith('//') || selector.startsWith('(//');

        if (isXPath) {
            await this.page.waitForSelector(`xpath=${selector}`, {
                state: 'hidden',
                timeout
            });
        } else {
            await this.page.waitForSelector(selector, {
                state: 'hidden',
                timeout
            });
        }
    }

    /**
     * Wait for an element to be enabled
     * @param {string} selector - XPath or CSS selector
     * @param {Object} options - Options for waiting
     * @returns {Promise<ElementHandle>} - Element handle
     */
    async waitForEnabled(selector, options = {}) {
        const timeout = options.timeout || this.defaultTimeout;
        const element = await this.waitForElementToBeVisible(selector, { timeout });

        await this.page.waitForFunction(
            el => !el.disabled,
            element,
            { timeout }
        );

        return element;
    }

    /**
     * Wait for a specific text to appear in the element
     * @param {string} selector - XPath or CSS selector
     * @param {string} text - Text to wait for
     * @param {Object} options - Options for waiting
     * @returns {Promise<ElementHandle>} - Element handle
     */
    async waitForText(selector, text, options = {}) {
        const timeout = options.timeout || this.defaultTimeout;
        const element = await this.waitForElementToBeVisible(selector, { timeout });

        await this.page.waitForFunction(
            (el, expectedText) => el.textContent.includes(expectedText),
            element,
            text,
            { timeout }
        );

        return element;
    }

    /**
     * Wait for a network request to complete
     * @param {string} urlPattern - URL pattern to match
     * @param {Object} options - Options for waiting
     */
    async waitForRequest(urlPattern, options = {}) {
        const timeout = options.timeout || this.defaultTimeout;
        await this.page.waitForRequest(
            request => request.url().match(urlPattern),
            { timeout }
        );
    }

    /**
     * Wait for a network response to complete
     * @param {string} urlPattern - URL pattern to match
     * @param {Object} options - Options for waiting
     */
    async waitForResponse(urlPattern, options = {}) {
        const timeout = options.timeout || this.defaultTimeout;
        await this.page.waitForResponse(
            response => response.url().match(urlPattern),
            { timeout }
        );
    }

    /**
     * Wait for page navigation to complete
     * @param {Object} options - Options for waiting
     */
    async waitForNavigation(options = {}) {
        const timeout = options.timeout || this.defaultTimeout;
        await this.page.waitForNavigation({ timeout });
    }

    /**
     * Wait for a specific amount of time (use sparingly)
     * @param {number} milliseconds - Time to wait in milliseconds
     */
    async wait(milliseconds) {
        await this.page.waitForTimeout(milliseconds);
    }

    /**
     * Wait for a custom condition
     * @param {Function} predicate - Function that returns a boolean
     * @param {Object} options - Options for waiting
     */
    async waitForCondition(predicate, options = {}) {
        const timeout = options.timeout || this.defaultTimeout;
        await this.page.waitForFunction(predicate, {}, { timeout });
    }
}

export default WaitHelper;
