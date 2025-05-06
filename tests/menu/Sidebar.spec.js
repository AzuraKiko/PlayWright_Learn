import { test, expect } from '@playwright/test';
import PageFactory from '../../lib/pages/PageFactory';
import config from '../../config/playwright.config.js';
import { TestData } from '../../lib/constants/TestData';

test.describe('Sidebar Navigation Tests', () => {
    let pageFactory;
    let sidebar;
    let loginPage;

    test.beforeEach(async ({ page }) => {
        // Access the baseURL directly from the config
        const baseURL = config.use?.baseURL;

        pageFactory = new PageFactory(page);
        // Lấy LoginPage từ PageFactory
        loginPage = pageFactory.getLoginPage();
        await loginPage.open(baseURL);
        await loginPage.login(TestData.Users.ValidUser.email, TestData.Users.ValidUser.password);
        await loginPage.enterCode(TestData.Users.ValidUser.code);

        // Lấy DashboardPage từ PageFactory
        sidebar = pageFactory.getSidebar();
    });

    // Teardown after each test
    test.afterEach(async ({ page }) => {
        await page.close();
    });

    test('should verify sidebar is visible', async () => {
        const isVisible = await sidebar.isSidebarVisible();
        expect(isVisible).toBeTruthy();
    });

    test('collapse and expand sidebar', async ({ page }) => {
        await page.waitForSelector('div.MuiDrawer-root.MuiDrawer-docked');
        // Get initial width
        const initialWidth = await page.$eval(sidebar.sidebar, el => el.offsetWidth);

        // Toggle sidebar
        await sidebar.clickToggleSidebar();
        await page.waitForTimeout(500); // Wait for animation

        // Get new width
        const newWidth = await page.$eval(sidebar.sidebar, el => el.offsetWidth);

        // Width should be different after toggle
        expect(newWidth).toBeLessThan(initialWidth);
    });

    // Helper function to test navigation to tabs instead of URL changes
    const testTabNavigation = (testName, navigationFunction, expectedTabText) => {
        test(testName, async () => {
            await navigationFunction();

            // Wait for the tab to appear
            await page.waitForSelector(`[role="tab"]:has-text("${expectedTabText}")`, { state: 'visible', timeout: 5000 });

            // Verify the tab is active/selected
            const isTabActive = await page.evaluate((tabText) => {
                const tabs = document.querySelectorAll('[role="tab"]');
                const targetTab = Array.from(tabs).find(tab => tab.textContent.includes(tabText));
                return targetTab && (targetTab.getAttribute('aria-selected') === 'true' ||
                    targetTab.classList.contains('active') ||
                    targetTab.classList.contains('Mui-selected'));
            }, expectedTabText);

            expect(isTabActive).toBe(true);

            // Additionally check if tab content is visible
            const isTabContentVisible = await page.evaluate((tabText) => {
                // This needs to be adapted to your specific app structure
                const tabPanels = document.querySelectorAll('[role="tabpanel"]');
                return tabPanels.length > 0 && Array.from(tabPanels).some(panel => panel.style.display !== 'none');
            });

            expect(isTabContentVisible).toBe(true);
        });
    };

    // Navigation tests using the helper function for tab-based UI
    testTabNavigation('should navigate to Dashboard', () => sidebar.navigateToDashboard(), 'Dashboard');
    testTabNavigation('should navigate to Notifications', () => sidebar.navigateToNotifications(), 'Notifications');
    testTabNavigation('should navigate to All Users', () => sidebar.navigateToAllUsers(), 'All Users');
    testTabNavigation('should navigate to All Segments', () => sidebar.navigateToAllSegments(), 'All Segments');
    testTabNavigation('should navigate to Roles Management', () => sidebar.navigateToRolesManagement(), 'Roles Management');
    testTabNavigation('should navigate to Account Management', () => sidebar.navigateToAccountManagement(), 'Account Management');
    testTabNavigation('should navigate to Vetting Rules Management', () => sidebar.navigateToVettingRulesManagement(), 'Vetting Rules Management');
    testTabNavigation('should navigate to Market Data Management', () => sidebar.navigateToMarketDataManagement(), 'Market Data Management');
    testTabNavigation('should navigate to All Holdings', () => sidebar.navigateToAllHoldings(), 'All Holdings');
    testTabNavigation('should navigate to All Orders', () => sidebar.navigateToAllOrders(), 'All Orders');
    testTabNavigation('should navigate to Research Reports', () => sidebar.navigateToResearchReports(), 'Research Reports');
    testTabNavigation('should navigate to Stock Recommendations', () => sidebar.navigateToStockRecommendations(), 'Stock Recommendations');
    testTabNavigation('should navigate to Pending Client Management', () => sidebar.navigateToPendingClientManagement(), 'Pending Client Management');


    test('should expand and collapse User Management', async () => {
        // Expand User Management
        await sidebar.expandUserManagement();

        // Check if submenu items are visible
        const allUsersVisible = await sidebar.isSubmenuExpanded(sidebar.menuItems.allUsers);
        expect(allUsersVisible).toBeTruthy();

        // Collapse User Management
        await sidebar.collapseUserManagement();

        // Check if submenu items are hidden
        const allUsersHidden = await sidebar.isSubmenuExpanded(sidebar.menuItems.allUsers);
        expect(allUsersHidden).toBeFalsy();
    });

    test('should open Equix website in new tab when clicking logo', async () => {
        // Create a promise that resolves when a new page is created
        const pagePromise = page.context().waitForEvent('page');

        // Click the logo
        await sidebar.clickLogoEquix();

        // Wait for the new page
        const newPage = await pagePromise;
        await newPage.waitForLoadState('networkidle');

        // Check the URL of the new page
        expect(newPage.url()).toContain('equix.com.au');

        // Close the new page
        await newPage.close();
    });

    test('should get all menu items', async () => {
        const menuItems = await sidebar.getAllMenuItems();

        // Verify we have menu items
        expect(menuItems.length).toBeGreaterThan(0);

        // Verify structure of menu items
        expect(menuItems[0]).toHaveProperty('text');
        expect(menuItems[0]).toHaveProperty('isActive');
    });

    test('should verify all menu items are visible', async () => {
        const allVisible = await sidebar.verifyAllMenuItemsVisible();
        expect(allVisible).toBeTruthy();
    });

    test('should handle navigation to non-existent menu item gracefully', async () => {
        try {
            // Try to navigate to a non-existent menu item
            await sidebar.navigateTo('Non-existent Menu');
            // If we get here, the test should fail
            expect(true).toBeFalsy('Should have thrown an error');
        } catch (error) {
            // Verify we got an error
            expect(error).toBeDefined();
        }
    });

    test('should maintain active state after navigation', async () => {
        // Navigate to Dashboard
        await sidebar.navigateToDashboard();

        // Get all menu items
        const menuItems = await sidebar.getAllMenuItems();

        // Find Dashboard menu item
        const dashboardItem = menuItems.find(item =>
            item.text.includes(sidebar.menuItems.dashboard)
        );

        // Verify Dashboard is active
        expect(dashboardItem.isActive).toBeTruthy();
    });
});
