import { test, expect } from '@playwright/test';
import Sidebar from '../pages/Sidebar';
import LoginPage from '../pages/LoginPage';
import { testConfig } from '../config/testConfig';

test.describe('Sidebar Navigation Tests', () => {
    let page;
    let sidebar;
    let loginPage;

    test.beforeEach(async ({ browser }) => {
        // Create a new page for each test
        page = await browser.newPage();
        sidebar = new Sidebar(page);
        loginPage = new LoginPage(page);

        // Login before each test
        await page.goto(testConfig.baseUrl);
        await loginPage.login(testConfig.validUser.username, testConfig.validUser.password);

        // Wait for dashboard to load
        await page.waitForSelector('text=Dashboard', { state: 'visible' });
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('should verify sidebar is visible', async () => {
        const isVisible = await sidebar.isSidebarVisible();
        expect(isVisible).toBeTruthy();
    });

    test('should toggle sidebar', async () => {
        // Get initial width
        const initialWidth = await page.$eval(sidebar.sidebar, el => el.offsetWidth);

        // Toggle sidebar
        await sidebar.toggleSidebar();
        await page.waitForTimeout(500); // Wait for animation

        // Get new width
        const newWidth = await page.$eval(sidebar.sidebar, el => el.offsetWidth);

        // Width should be different after toggle
        expect(newWidth).not.toEqual(initialWidth);
    });

    test('should navigate to Dashboard', async () => {
        await sidebar.navigateToDashboard();
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should navigate to Notifications', async () => {
        await sidebar.navigateToNotifications();
        await expect(page).toHaveURL(/.*notifications/);
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

    test('should navigate to All Users', async () => {
        await sidebar.navigateToAllUsers();
        await expect(page).toHaveURL(/.*users/);
    });

    test('should navigate to All Segments', async () => {
        await sidebar.navigateToAllSegments();
        await expect(page).toHaveURL(/.*segments/);
    });

    test('should navigate to Roles Management', async () => {
        await sidebar.navigateToRolesManagement();
        await expect(page).toHaveURL(/.*roles/);
    });

    test('should navigate to Account Management', async () => {
        await sidebar.navigateToAccountManagement();
        await expect(page).toHaveURL(/.*account-management/);
    });

    test('should navigate to Vetting Rules Management', async () => {
        await sidebar.navigateToVettingRulesManagement();
        await expect(page).toHaveURL(/.*vetting-rules/);
    });

    test('should navigate to Market Data Management', async () => {
        await sidebar.navigateToMarketDataManagement();
        await expect(page).toHaveURL(/.*market-data/);
    });

    test('should navigate to All Holdings', async () => {
        await sidebar.navigateToAllHoldings();
        await expect(page).toHaveURL(/.*holdings/);
    });

    test('should navigate to All Orders', async () => {
        await sidebar.navigateToAllOrders();
        await expect(page).toHaveURL(/.*orders/);
    });

    test('should navigate to Research Reports', async () => {
        await sidebar.navigateToResearchReports();
        await expect(page).toHaveURL(/.*research-reports/);
    });

    test('should navigate to Stock Recommendations', async () => {
        await sidebar.navigateToStockRecommendations();
        await expect(page).toHaveURL(/.*stock-recommendations/);
    });

    test('should navigate to Pending Client Management', async () => {
        await sidebar.navigateToPendingClientManagement();
        await expect(page).toHaveURL(/.*pending-clients/);
    });

    test('should open Equix website in new tab when clicking logo', async () => {
        // Create a promise that resolves when a new page is created
        const pagePromise = page.context().waitForEvent('page');

        // Click the logo
        await sidebar.clickLogoEquix();

        // Wait for the new page
        const newPage = await pagePromise;
        await newPage.waitForLoadState();

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
