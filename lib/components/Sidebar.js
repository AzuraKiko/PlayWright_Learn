import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';

class Sidebar extends BasePage {
    constructor(page) {
        super(page);
        this.locators = Locators.Sidebar;

        // Main sidebar locators
        this.sidebar = this.locators.sidebar;
        this.sidebarToggle = this.locators.sidebarToggle;

        // Dynamic locators for menu items - using buttons instead of links
        this.dynamicMenuItemButton = DynamicLocators.create('//button[contains(.//span, "{0}")]');

        // Define menu items for easy reference
        this.menuItems = {
            dashboard: 'Dashboard',
            notifications: 'Notifications',
            userManagement: 'User Management',
            allUsers: 'All Users',
            allSegments: 'All Segments',
            rolesManagement: 'Roles Management',
            accountManagement: 'Account Management',
            vettingRulesManagement: 'Vetting Rules Management',
            marketDataManagement: 'Market Data Management',
            allHoldings: 'All Holdings',
            allOrders: 'All Orders',
            researchReports: 'Research Reports',
            stockRecommendations: 'Stock Recommendations',
            pendingClientManagement: 'Pending Client Management'
        };
    }

    // Helper method to get locator for any menu item
    getMenuItemLocator(menuName) {
        return this.dynamicMenuItemButton.format(menuName);
    }

    // General sidebar operations
    async isSidebarVisible() {
        return await this.isElementVisible(this.sidebar);
    }

    async toggleSidebar() {
        await this.click(this.sidebarToggle);
    }

    // Navigation functions - Main menu items
    async navigateToDashboard() {
        await this.click(this.getMenuItemLocator(this.menuItems.dashboard));
    }

    async navigateToNotifications() {
        await this.click(this.getMenuItemLocator(this.menuItems.notifications));
    }

    async expandUserManagement() {
        const isExpanded = await this.hasClass(this.userManagementLink, 'expanded');
        if (!isExpanded) {
            await this.click(this.userManagementExpandIcon);
        }
    }

    async collapseUserManagement() {
        const isExpanded = await this.hasClass(this.userManagementLink, 'expanded');
        if (isExpanded) {
            await this.click(this.userManagementExpandIcon);
        }
    }

    async navigateToAllUsers() {
        await this.expandUserManagement();
        await this.click(this.allUsersLink);
    }

    async navigateToAllSegments() {
        await this.expandUserManagement();
        await this.click(this.allSegmentsLink);
    }

    async navigateToRolesManagement() {
        await this.click(this.rolesManagementLink);
    }

    async navigateToAccountManagement() {
        await this.click(this.accountManagementLink);
    }

    async navigateToVettingRulesManagement() {
        await this.click(this.vettingRulesManagementLink);
    }

    async navigateToMarketDataManagement() {
        await this.click(this.marketDataManagementLink);
    }

    async navigateToAllHoldings() {
        await this.click(this.allHoldingsLink);
    }

    async navigateToAllOrders() {
        await this.click(this.allOrdersLink);
    }

    async navigateToResearchReports() {
        await this.click(this.researchReportsLink);
    }

    async navigateToStockRecommendations() {
        await this.click(this.stockRecommendationsLink);
    }

    async navigateToPendingClientManagement() {
        await this.click(this.pendingClientManagementLink);
    }

    // Status checking functions
    async isLinkActive(locator) {
        return await this.hasClass(locator, 'active');
    }

    async isDashboardActive() {
        return await this.isLinkActive(this.dashboardLink);
    }

    async isNotificationsActive() {
        return await this.isLinkActive(this.notificationsLink);
    }

    async isUserManagementActive() {
        return await this.isLinkActive(this.userManagementLink);
    }

    async isAllUsersActive() {
        return await this.isLinkActive(this.allUsersLink);
    }

    async isAllSegmentsActive() {
        return await this.isLinkActive(this.allSegmentsLink);
    }

    async isRolesManagementActive() {
        return await this.isLinkActive(this.rolesManagementLink);
    }

    async isAccountManagementActive() {
        return await this.isLinkActive(this.accountManagementLink);
    }

    async isVettingRulesManagementActive() {
        return await this.isLinkActive(this.vettingRulesManagementLink);
    }

    async isMarketDataManagementActive() {
        return await this.isLinkActive(this.marketDataManagementLink);
    }

    async isAllHoldingsActive() {
        return await this.isLinkActive(this.allHoldingsLink);
    }

    async isAllOrdersActive() {
        return await this.isLinkActive(this.allOrdersLink);
    }

    async isResearchReportsActive() {
        return await this.isLinkActive(this.researchReportsLink);
    }

    async isStockRecommendationsActive() {
        return await this.isLinkActive(this.stockRecommendationsLink);
    }

    async isPendingClientManagementActive() {
        return await this.isLinkActive(this.pendingClientManagementLink);
    }

    // Additional utility functions
    async getAllMenuItems() {
        const menuItems = await this.page.$$eval(`${this.sidebar} a`, items => {
            return items.map(item => ({
                text: item.textContent.trim(),
                href: item.getAttribute('href'),
                isActive: item.classList.contains('active')
            }));
        });
        return menuItems;
    }

    async waitForSidebarToLoad() {
        await this.page.waitForSelector(this.sidebar, { state: 'visible' });
    }

    async navigateByMenuText(menuText) {
        const menuItemSelector = `${this.sidebar} a:has-text("${menuText}")`;
        await this.page.click(menuItemSelector);
    }

    async isUserManagementExpanded() {
        return await this.hasClass(this.userManagementLink, 'expanded');
    }

    async verifyAllMenuItemsVisible() {
        const menuItems = [
            this.dashboardLink,
            this.notificationsLink,
            this.userManagementLink,
            this.rolesManagementLink,
            this.accountManagementLink,
            this.vettingRulesManagementLink,
            this.marketDataManagementLink,
            this.allHoldingsLink,
            this.allOrdersLink,
            this.researchReportsLink,
            this.stockRecommendationsLink,
            this.pendingClientManagementLink
        ];

        for (const menuItem of menuItems) {
            const isVisible = await this.isElementVisible(menuItem);
            if (!isVisible) {
                return false;
            }
        }
        return true;
    }
}

export default Sidebar;