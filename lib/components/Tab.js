import { logger } from '../utils/Index';

class TabHelper {
    constructor(page) {
        this.page = page;
    }

    /**
     * Checks if a tab with the specified text is active (selected)
     * @param {string} tabText - The text content of the tab to check
     * @returns {Promise<boolean>} - True if tab is active
     */
    async isTabSelected(tabText) {
        try {
            // Check if the tab is selected/active
            const isTabSelected = await this.page.evaluate((text) => {
                const tabs = Array.from(document.querySelectorAll('.lm_tab'));
                // Tìm tab có text chứa nội dung mong muốn
                const targetTab = tabs.find(tab =>
                    tab.textContent.trim().includes(text.trim()));

                if (!targetTab) {
                    console.warn(`Tab with text "${text}" not found`);
                    return false;
                }

                // Kiểm tra xem tab có được chọn không (thông qua class 'lm_active')
                return targetTab.classList.contains('lm_active');
            }, tabText); // Truyền biến `tabText` vào hàm evaluate

            logger.debug(`Tab "${tabText}" - isSelected: ${isTabSelected}`);
            return isTabSelected;
        } catch (error) {
            logger.error(`Error checking if tab "${tabText}" is active:`, error);
            return false;
        }
    }

    async isTabNotSelected(tabText) {
        try {
            const isSelected = await this.isTabSelected(tabText);
            return !isSelected;
        } catch (error) {
            logger.error(`Error checking if tab "${tabText}" is not selected:`, error);
            return false;
        }
    }

    /**
     * Clicks on a tab with the specified text and waits for it to become active
     * @param {string} tabText - The text content of the tab to click
     * @param {number} timeout - Optional timeout in milliseconds (default: 5000)
     * @returns {Promise<boolean>} - True if tab was clicked and became active
     */
    async clickTab(tabText, timeout = 5000) {
        try {
            const tabSelector = `.lm_tab:has-text("${tabText}")`;

            // More reliable click using Playwright's locator
            await this.page.locator(tabSelector).click();

            // Wait for tab to become active
            return await this.page.waitForFunction(
                (text) => {
                    const tab = Array.from(document.querySelectorAll('.lm_tab'))
                        .find(t => t.textContent.includes(text));
                    return tab?.classList.contains('lm_active') ?? false;
                },
                { timeout },
                tabText
            ).then(() => true).catch(() => false);

        } catch (error) {
            if (error.message.includes('timeout')) {
                logger.warn(`Timeout waiting for tab "${tabText}" to become active`);
            } else {
                logger.error(`Error clicking tab "${tabText}":`, error);
            }
            return false;
        }
    }

    /**
     * Gets all available tabs
     * @returns {Promise<Array<string>>} - Array of tab text contents
     */
    async getAllTabs() {
        try {
            return await this.page.evaluate(() => {
                return Array.from(document.querySelectorAll('.lm_tab')).map(tab => ({
                    text: tab.textContent.trim(),
                    active: tab.classList.contains('lm_active')
                }));
            });
        } catch (error) {
            logger.error('Error getting all tabs:', error);
            return [];
        }
    }
}

export default TabHelper;