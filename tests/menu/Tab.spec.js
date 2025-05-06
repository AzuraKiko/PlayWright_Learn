import { logger } from '../utils/Index';

class BasePage {
    constructor(page) {
        this.page = page;
    }

    // Existing BasePage methods...

    /**
     * Checks if a tab with the specified text is active and its content is visible
     * @param {string} tabText - The text content of the tab to check
     * @returns {Promise<boolean>} - True if tab is active and content is visible
     */
    async isTabActive(tabText) {
        try {
            // Check if the tab is selected/active
            const isTabSelected = await this.page.evaluate((text) => {
                const tabs = document.querySelectorAll('[role="tab"]');
                const targetTab = Array.from(tabs).find(tab =>
                    tab.textContent.includes(text));

                return targetTab && (
                    targetTab.getAttribute('aria-selected') === 'true' ||
                    targetTab.classList.contains('active') ||
                    targetTab.classList.contains('Mui-selected')
                );
            }, tabText);

            // Check if the tab content/panel is visible
            const isTabContentVisible = await this.page.evaluate((text) => {
                // First try to find the tab panel using aria-labelledby 
                const tabs = document.querySelectorAll('[role="tab"]');
                const targetTab = Array.from(tabs).find(tab =>
                    tab.textContent.includes(text));

                if (targetTab) {
                    const tabId = targetTab.getAttribute('id');
                    if (tabId) {
                        const panel = document.querySelector(`[aria-labelledby="${tabId}"]`);
                        if (panel) {
                            return panel.style.display !== 'none' &&
                                window.getComputedStyle(panel).display !== 'none';
                        }
                    }
                }

                // Fallback: Check if any tab panel is visible
                const tabPanels = document.querySelectorAll('[role="tabpanel"]');
                return tabPanels.length > 0 &&
                    Array.from(tabPanels).some(panel =>
                        panel.style.display !== 'none' &&
                        window.getComputedStyle(panel).display !== 'none'
                    );
            }, tabText);

            logger.debug(`Tab "${tabText}" - isSelected: ${isTabSelected}, isContentVisible: ${isTabContentVisible}`);
            return isTabSelected && isTabContentVisible;
        } catch (error) {
            logger.error(`Error checking if tab "${tabText}" is active:`, error);
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
            // Find and click the tab
            const tabClicked = await this.page.evaluate((text) => {
                const tabs = document.querySelectorAll('[role="tab"]');
                const targetTab = Array.from(tabs).find(tab =>
                    tab.textContent.includes(text));

                if (targetTab) {
                    targetTab.click();
                    return true;
                }
                return false;
            }, tabText);

            if (!tabClicked) {
                logger.error(`Tab "${tabText}" not found`);
                return false;
            }

            // Wait for the tab to become active
            const startTime = Date.now();
            let isActive = false;

            while (Date.now() - startTime < timeout) {
                isActive = await this.isTabActive(tabText);
                if (isActive) break;

                // Small wait to prevent CPU overuse
                await this.page.waitForTimeout(100);
            }

            if (!isActive) {
                logger.warn(`Timeout waiting for tab "${tabText}" to become active`);
            }

            return isActive;
        } catch (error) {
            logger.error(`Error clicking tab "${tabText}":`, error);
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
                const tabs = document.querySelectorAll('[role="tab"]');
                return Array.from(tabs).map(tab => tab.textContent.trim());
            });
        } catch (error) {
            logger.error('Error getting all tabs:', error);
            return [];
        }
    }
}

export default BasePage;

// Example usage in a test file

// import { test, expect } from '@playwright/test';
// import DashboardPage from '../pages/DashboardPage';
// import LoginPage from '../pages/LoginPage';
// import { logger } from '../utils/Index';

// test.describe('Tab Navigation Tests', () => {
//     let dashboardPage;
//     let loginPage;

//     test.beforeEach(async ({ page }) => {
//         loginPage = new LoginPage(page);
//         dashboardPage = new DashboardPage(page);

//         // Perform login
//         await loginPage.navigateToLoginPage();
//         await loginPage.login('test@example.com', 'password123');

//         // Wait for dashboard to load
//         await dashboardPage.waitForPageLoad();
//     });

//     test('should correctly navigate between dashboard tabs', async () => {
//         // Get all available tabs
//         const availableTabs = await dashboardPage.getAllTabs();
//         logger.info(`Available tabs: ${availableTabs.join(', ')}`);

//         // For each tab, click and verify it's active
//         for (const tabName of availableTabs) {
//             // Click the tab
//             await dashboardPage.clickTab(tabName);

//             // Verify tab is active
//             const isActive = await dashboardPage.isTabActive(tabName);
//             expect(isActive).toBeTruthy();
//             logger.info(`Successfully navigated to "${tabName}" tab`);

//             // Perform additional assertions specific to this tab
//             // e.g., verify specific content or functionality
//         }
//     });

//     test('should display correct content when User Management tab is selected', async () => {
//         // Click on User Management tab
//         await dashboardPage.clickTab('User Management');

//         // Verify tab is active
//         const isActive = await dashboardPage.isTabActive('User Management');
//         expect(isActive).toBeTruthy();

//         // Verify specific content or elements in the User Management tab
//         // For example:
//         const isUserTableVisible = await dashboardPage.isElementVisible('#user-table');
//         expect(isUserTableVisible).toBeTruthy();

//         const userCount = await dashboardPage.getUserCount();
//         expect(userCount).toBeGreaterThan(0);
//     });
// });

// // Example with specific assertions for different tab types
// test('should verify Market Data tab functionality', async ({ page }) => {
//     const loginPage = new LoginPage(page);
//     const dashboardPage = new DashboardPage(page);
//     const sidebar = new Sidebar(page);

//     // Login
//     await loginPage.navigateToLoginPage();
//     await loginPage.login('admin@example.com', 'admin123');

//     // Navigate to Market Data Management
//     await sidebar.navigateToMarketDataManagement();

//     // Check if we're on the correct page
//     await dashboardPage.waitForPageLoad();

//     // Click on the 'Stock Data' tab
//     await dashboardPage.clickTab('Stock Data');

//     // Verify tab is active
//     const isTabActive = await dashboardPage.isTabActive('Stock Data');
//     expect(isTabActive).toBeTruthy();

//     // Verify specific content is displayed for this tab
//     const isStockSearchVisible = await dashboardPage.isElementVisible('#stock-search');
//     expect(isStockSearchVisible).toBeTruthy();
// });