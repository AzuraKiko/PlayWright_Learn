import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';
import { logger, BrowserHelper } from '../utils/Index';
import DynamicLocators from '../locators/DynamicLocators';

class Sidebar extends BasePage {
    constructor(page) {
        super(page);
        this.locators = Locators.Sidebar;
        this.browserHelper = new BrowserHelper(page);

        // Main sidebar locators
        this.sidebar = this.locators.sidebar;
        this.sidebarToggle = this.locators.sidebarToggle;
        this.logoEquix = this.locators.logoEquix;

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
        return this.dynamicMenuItemButton(menuName);
    }

    // Generic navigation method to reduce code duplication
    async navigateTo(menuName) {
        try {
            await this.click(this.getMenuItemLocator(menuName));
            await this.page.waitForTimeout(300); // Small wait for UI to respond
        } catch (error) {
            logger.error(`Failed to navigate to ${menuName}`, error);
            throw error;
        }
    }

    // General sidebar operations
    async isSidebarVisible() {
        return await this.isElementVisible(this.sidebar);
    }

    async clickToggleSidebar() {
        await this.click(this.sidebarToggle);
    }

    // Navigation functions - Main menu items
    async navigateToDashboard() {
        await this.navigateTo(this.menuItems.dashboard);
    }

    async navigateToNotifications() {
        await this.navigateTo(this.menuItems.notifications);
    }

    async isSubmenuExpanded(submenuItem) {
        try {
            const isVisible = await this.isElementVisible(
                this.getMenuItemLocator(submenuItem)
            );
            return isVisible;
        } catch (error) {
            logger.error(`Error checking if submenu ${submenuItem} is expanded`, error);
            return false;
        }
    }


    async isSubmenuHide(submenuItem) {
        try {
            const isHide = await this.isElementNotVisible(
                this.getMenuItemLocator(submenuItem)
            );
            return isHide;
        } catch (error) {
            logger.error(`Error checking if submenu ${submenuItem} is hide`, error);
            return false;
        }
    }

    async expandUserManagement() {
        const isCollapsed = await this.isSubmenuHide(this.menuItems.allUsers);
        if (isCollapsed) {
            await this.navigateTo(this.menuItems.userManagement);
        }
    }

    async collapseUserManagement() {
        const isExpanded = await this.isSubmenuExpanded(this.menuItems.allUsers);
        if (isExpanded) {
            await this.navigateTo(this.menuItems.userManagement);
        }
    }

    async navigateToAllUsers() {
        await this.expandUserManagement();
        await this.navigateTo(this.menuItems.allUsers);
    }

    async navigateToAllSegments() {
        await this.expandUserManagement();
        await this.navigateTo(this.menuItems.allSegments);
    }

    async navigateToRolesManagement() {
        await this.navigateTo(this.menuItems.rolesManagement);
    }

    async navigateToAccountManagement() {
        await this.navigateTo(this.menuItems.accountManagement);
    }

    async navigateToVettingRulesManagement() {
        await this.navigateTo(this.menuItems.vettingRulesManagement);
    }

    async navigateToMarketDataManagement() {
        await this.navigateTo(this.menuItems.marketDataManagement);
    }

    async navigateToAllHoldings() {
        await this.navigateTo(this.menuItems.allHoldings);
    }

    async navigateToAllOrders() {
        await this.navigateTo(this.menuItems.allOrders);
    }

    async navigateToResearchReports() {
        await this.navigateTo(this.menuItems.researchReports);
    }

    async navigateToStockRecommendations() {
        await this.navigateTo(this.menuItems.stockRecommendations);
    }

    async navigateToPendingClientManagement() {
        await this.navigateTo(this.menuItems.pendingClientManagement);
    }

    async clickLogoEquix() {
        try {
            await this.click(this.logoEquix);
            await this.page.waitForTimeout(500); // Wait for the page to load
            await this.browserHelper.switchToNewTab("https://www.equix.com.au/");
            await this.page.waitForTimeout(500); // Wait for the new tab to load
        } catch (error) {
            logger.error("Error opening new tab with Equix page", error);
            throw error;
        }
    }

    async verifyAllMenuItemsVisible() {
        try {
            await this.expandUserManagement();
            // Create an array of promises for checking visibility
            const visibilityChecks = Object.values(this.menuItems).map(item =>
                this.isElementVisible(this.getMenuItemLocator(item))
            );

            // Execute all promises in parallel
            const results = await Promise.all(visibilityChecks);

            // Return true only if all items are visible
            return results.every(isVisible => isVisible === true);
        } catch (error) {
            logger.error("Error verifying menu items visibility", error);
            return false;
        }
    }
}

export default Sidebar;