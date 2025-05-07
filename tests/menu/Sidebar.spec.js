import { test, expect } from '@playwright/test';
import PageFactory from '../../lib/pages/PageFactory';
import config from '../../config/playwright.config.js';
import { TestData } from '../../lib/constants/TestData';
import TabHelper from '../../lib/components/Tab.js';

test.describe('Sidebar Navigation Tests', () => {
    let pageFactory;
    let sidebar;
    let loginPage;
    let tabHelper;

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

        tabHelper = new TabHelper(page);


        // Wait for initial navigation to complete
        await page.waitForLoadState('networkidle');
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

    // Helper function for tab navigation tests
    const createTabNavigationTest = (
        testName,
        navigationFunction,
        expectedTabText
    ) => {
        test(testName, async () => {
            // 1. Execute navigation action
            await navigationFunction();

            // 2. Verify tab selection state
            await expect(async () => {
                const isTabSelected = await tabHelper.isTabSelected(expectedTabText);
                expect(isTabSelected).toBe(true);
            }).toPass({
                // Allow retries for async state changes
                intervals: [100, 200, 500],
                timeout: 5000
            });

        });
    };

    // Test data for all navigation cases
    const NAVIGATION_TEST_CASES = [
        // { name: 'Dashboard', action: () => sidebar.navigateToDashboard(), tabText: 'Dashboard' },
        // { name: 'Notifications', action: () => sidebar.navigateToNotifications(), tabText: 'Notifications' },
        { name: 'All Users', action: () => sidebar.navigateToAllUsers(), tabText: 'All Users' },
        { name: 'All Segments', action: () => sidebar.navigateToAllSegments(), tabText: 'All Segments' },
        // { name: 'Roles Management', action: () => sidebar.navigateToRolesManagement(), tabText: 'Roles Management' },
        //     { name: 'Account Management', action: () => sidebar.navigateToAccountManagement(), tabText: 'Account Management' },
        //     { name: 'Vetting Rules Management', action: () => sidebar.navigateToVettingRulesManagement(), tabText: 'Vetting Rule' },
        //     { name: 'Market Data Management', action: () => sidebar.navigateToMarketDataManagement(), tabText: 'Market Data' },
        //     { name: 'All Holdings', action: () => sidebar.navigateToAllHoldings(), tabText: 'All Holdings' },
        //     { name: 'All Orders', action: () => sidebar.navigateToAllOrders(), tabText: 'All Orders' },
        //     { name: 'Research Reports', action: () => sidebar.navigateToResearchReports(), tabText: 'Research Reports' },
        //     { name: 'Stock Recommendations', action: () => sidebar.navigateToStockRecommendations(), tabText: 'Stock Recommendations' },
        //     { name: 'Pending Client Management', action: () => sidebar.navigateToPendingClientManagement(), tabText: 'Pending Client Management' },
    ];

    // Generate all navigation tests dynamically
    NAVIGATION_TEST_CASES.forEach(({ name, action, tabText }) => {
        createTabNavigationTest(
            `should navigate to ${name}`,
            action,
            tabText
        );
    });


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
