import { test, expect } from '@playwright/test';
import PageFactory from '../../lib/pages/PageFactory';
import config from '../../config/playwright.config.js';
import { TestData } from '../../lib/constants/TestData';
import TabHelper from '../../lib/components/Tab.js';

test.describe('Sidebar Navigation Tests', () => {
    // Use a single test to run all sidebar tests sequentially
    test('should verify all sidebar navigation functionality', async ({ page }) => {
        // --- Setup ---
        const baseURL = config.use?.baseURL;

        // Initialize pages and helpers
        const pageFactory = new PageFactory(page);
        const loginPage = pageFactory.getLoginPage();
        const sidebar = pageFactory.getSidebar();
        const tabHelper = new TabHelper(page);

        // Login only once for all tests
        await loginPage.open(baseURL);
        await loginPage.login(TestData.Users.ValidUser.email, TestData.Users.ValidUser.password);
        await loginPage.enterCode(TestData.Users.ValidUser.code);

        // Wait for initial navigation to complete
        await page.waitForLoadState('networkidle');
        await page.locator('.lm_title').waitFor();

        // --- Test 1: Basic Sidebar Functionality ---
        console.log('Testing sidebar visibility and toggle...');

        // Verify sidebar is visible
        const isVisible = await sidebar.isSidebarVisible();
        expect(isVisible).toBeTruthy();

        await page.waitForSelector('div.MuiDrawer-root.MuiDrawer-docked');
        // Get initial width
        const initialWidth = await page.$eval(sidebar.sidebar, el => el.offsetWidth);

        // Toggle sidebar
        await sidebar.clickToggleSidebar();
        await page.waitForTimeout(500);

        // Get new width
        const newWidth = await page.$eval(sidebar.sidebar, el => el.offsetWidth);

        // Width should be different after toggle
        expect(newWidth).toBeLessThan(initialWidth);

        // Toggle back to expanded state
        await sidebar.clickToggleSidebar();
        await page.waitForTimeout(500);

        // --- Test 2: Verify all menu items are visible ---
        console.log('Verifying all menu items are visible...');
        const allVisible = await sidebar.verifyAllMenuItemsVisible();
        expect(allVisible).toBeTruthy();

        // --- Test 3: Default Tab Selection ---
        console.log('Verifying Dashboard is selected by default...');
        const isTabSelected = await tabHelper.isTabSelected('Dashboard');
        expect(isTabSelected).toBe(true);

        // --- Test 4: Menu Expansion ---
        console.log('Testing User Management menu expansion...');
        // Expand User Management
        await sidebar.expandUserManagement();

        // Check if submenu items are visible
        const allUsersVisible = await sidebar.isSubmenuExpanded(sidebar.menuItems.allUsers) &&
            await sidebar.isSubmenuExpanded(sidebar.menuItems.allSegments);
        expect(allUsersVisible).toBeTruthy();

        // Collapse User Management
        await sidebar.collapseUserManagement();
        await page.waitForTimeout(300);

        // Check if submenu items are hidden
        const allUsersCollapsed = await sidebar.isSubmenuHide(sidebar.menuItems.allUsers) &&
            await sidebar.isSubmenuHide(sidebar.menuItems.allSegments);
        expect(allUsersCollapsed).toBeTruthy();

        // --- Test 5: Navigation Tests ---
        console.log('Testing all navigation paths...');

        // Helper function for tab navigation verification
        const verifyNavigation = async (navigationFunction, expectedTabText) => {
            await navigationFunction();

            // Verify tab selection state
            await expect(async () => {
                const isTabSelected = await tabHelper.isTabSelected(expectedTabText);
                expect(isTabSelected).toBe(true);
            }).toPass({
                // Allow retries for async state changes
                intervals: [100, 200, 500],
                timeout: 5000
            });
        };

        // Test data for all navigation cases, organized by functional area
        const NAVIGATION_TEST_CASES = [
            { name: 'Dashboard', action: () => sidebar.navigateToDashboard(), tabText: 'Dashboard' },
            { name: 'Notifications', action: () => sidebar.navigateToNotifications(), tabText: 'Notifications' },
            { name: 'All Users', action: () => sidebar.navigateToAllUsers(), tabText: 'All Users' },
            { name: 'All Segments', action: () => sidebar.navigateToAllSegments(), tabText: 'All Segments' },
            // { name: 'Roles Management', action: () => sidebar.navigateToRolesManagement(), tabText: 'Roles Management' },
            { name: 'Account Management', action: () => sidebar.navigateToAccountManagement(), tabText: 'Account Management' },
            { name: 'Vetting Rules Management', action: () => sidebar.navigateToVettingRulesManagement(), tabText: 'Vetting Rule' },
            { name: 'Market Data Management', action: () => sidebar.navigateToMarketDataManagement(), tabText: 'Market Data' },
            { name: 'All Holdings', action: () => sidebar.navigateToAllHoldings(), tabText: 'All Holdings' },
            { name: 'All Orders', action: () => sidebar.navigateToAllOrders(), tabText: 'All Orders' },
            { name: 'Research Reports', action: () => sidebar.navigateToResearchReports(), tabText: 'Research Reports' },
            { name: 'Stock Recommendations', action: () => sidebar.navigateToStockRecommendations(), tabText: 'Stock Recommendations' },
            { name: 'Pending Client Management', action: () => sidebar.navigateToPendingClientManagement(), tabText: 'Pending Client Management' },
        ];

        // Run all navigation tests sequentially
        for (const { name, action, tabText } of NAVIGATION_TEST_CASES) {
            console.log(`Testing navigation to ${name}...`);
            await verifyNavigation(action, tabText);
            // Wait 1 second between each navigation to ensure UI is stable
            await page.waitForTimeout(1000);
        }

        // --- Test 6: Tab Management ---
        console.log('Testing tab management...');

        // Close a specific tab
        const tabToClose = 'Dashboard';
        await tabHelper.closeTab(tabToClose);
        await page.waitForTimeout(300);

        // Verify tab is closed
        let allTabs = await tabHelper.getAllTabs();
        const closedTab = allTabs.find(tab => tab.text === tabToClose);
        expect(closedTab).toBeUndefined();

        // --- Test 7: Close All Tabs ---
        console.log('Testing closing all tabs...');
        allTabs = await tabHelper.getAllTabs();
        for (const tab of allTabs) {
            await tabHelper.closeTab(tab.text);
            await page.waitForTimeout(1000);
        }
        await page.waitForTimeout(500);

        // Verify all tabs are closed
        allTabs = await tabHelper.getAllTabs();
        expect(allTabs.length).toBe(0);

        // --- Test 8: Logo Click Test ---
        console.log('Testing logo click...');
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
});