import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';
import DynamicLocators from '../locators/DynamicLocators';
import Paging from './Paging';
import Search from './Search';
import Filter from './Filter';

/**
 * Page object for the Users page with integrated pagination, search, and filter functionality
 */
class UsersPage extends BasePage {
    constructor(page) {
        super(page);
        this.locators = Locators.Users;
        this.locatorsCommon = Locators.Common;

        // Initialize the utility components
        this.paging = new Paging(page);
        this.search = new Search(page);
        this.filter = new Filter(page);

        // Basic locators
        this.newUserButton = this.locators.newUserButton;
        this.editUsersButton = this.locators.editUsersButton;

        // Table column locators - based on position
        this.userLoginIdColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[1]`;
        this.fullNameColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[2]`;
        this.apiAccessColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[3]`;
        this.roleGroupColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[4]`;
        this.userGroupColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[5]`;
        this.accessMethodColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[6]`;
        this.statusColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[7]`;
        this.memberInfoColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[8]`;
        this.actionsColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[last()]//button`;

        // Column selector strings (for verification)
        this.columnSelectors = {
            userLoginId: '//table//tr/td[1]',
            fullName: '//table//tr/td[2]',
            apiAccess: '//table//tr/td[3]',
            roleGroup: '//table//tr/td[4]',
            userGroup: '//table//tr/td[5]',
            accessMethod: '//table//tr/td[6]',
            status: '//table//tr/td[7]',
            memberInfo: '//table//tr/td[8]'
        };

        // Dynamic locators for specific user operations
        this.dynamicUserRow = DynamicLocators.create('//table//tr[td[contains(text(), "{0}")]]');
        this.dynamicUserRowActions = DynamicLocators.create('//table//tr[td[contains(text(), "{0}")]]//td[last()]//button');
    }

    // ====== PAGE NAVIGATION ======

    /**
     * Navigate to the Users page
     */
    async openUsersPage() {
        await this.page.goto('/users'); // Adjust URL based on your application
        await this.waitForLoadingToDisappear();
    }

    // ====== USER ACTIONS ======

    /**
     * Click the "New User" button
     */
    async clickNewUserButton() {
        await this.click(this.newUserButton);
    }

    /**
     * Click the "Edit users" button
     */
    async clickEditUsersButton() {
        await this.click(this.editUsersButton);
    }

    /**
     * Open actions menu for a specific user by login ID
     * @param {string} userLoginId - The login ID of the user
     */
    async openActionsForUser(userLoginId) {
        const locator = this.dynamicUserRowActions.format(userLoginId);
        await this.click(locator);
    }

    /**
     * Verify search results for a specific column
     * @param {string} columnName - Name of the column to check (e.g., 'userLoginId')
     * @param {string} searchText - Text that was searched for
     * @returns {boolean} Whether all results contain the search text
     */
    async verifySearchResults(columnName, searchText) {
        return await this.search.verifySearchResults(this.columnSelectors[columnName], searchText);
    }

    /**
     * Verify filter results for a specific column
     * @param {string} columnName - Name of the column to check (e.g., 'roleGroup')
     * @param {string} filterValue - Value that was used for filtering
     * @returns {boolean} Whether all results match the filter value
     */
    async verifyFilterResults(columnName, filterValue) {
        return await this.filter.verifyFilterResults(this.columnSelectors[columnName], filterValue);
    }

    // ====== DATA RETRIEVAL ======

    /**
     * Get user data from a specific row by index
     * @param {number} rowIndex - The index of the row (0-based)
     * @returns {Object} User data object with all column values
     */
    async getUserDataByIndex(rowIndex) {
        return {
            userLoginId: await this.getText(this.userLoginIdColumn(rowIndex)),
            fullName: await this.getText(this.fullNameColumn(rowIndex)),
            apiAccess: await this.getText(this.apiAccessColumn(rowIndex)),
            roleGroup: await this.getText(this.roleGroupColumn(rowIndex)),
            userGroup: await this.getText(this.userGroupColumn(rowIndex)),
            accessMethod: await this.getText(this.accessMethodColumn(rowIndex)),
            status: await this.getText(this.statusColumn(rowIndex)),
            memberInfo: await this.getText(this.memberInfoColumn(rowIndex))
        };
    }

    /**
     * Find a user by login ID and return their row index
     * @param {string} userLoginId - The login ID to search for
     * @returns {number} The row index of the user, or -1 if not found
     */
    async findUserRowIndex(userLoginId) {
        // Get the current page's user count
        const rowCount = await this.paging.getRowCount();

        // Check the current page first
        for (let i = 0; i < rowCount; i++) {
            const loginId = await this.getText(this.userLoginIdColumn(i));
            if (loginId === userLoginId) {
                return i;
            }
        }

        // Not found on current page, need to search through all pages
        const isFirstPage = await this.paging.isOnFirstPage();
        if (!isFirstPage) {
            await this.paging.goToFirstPage();
        }

        // Search through each page until we find the user or run out of pages
        let foundIndex = -1;
        do {
            // Check current page
            const rowCount = await this.paging.getRowCount();
            for (let i = 0; i < rowCount; i++) {
                const loginId = await this.getText(this.userLoginIdColumn(i));
                if (loginId === userLoginId) {
                    foundIndex = i;
                    break;
                }
            }

            // If found or on last page, exit the loop
            if (foundIndex !== -1 || await this.paging.isOnLastPage()) {
                break;
            }

            // Go to next page and continue searching
            await this.paging.goToNextPage();
        } while (true);

        return foundIndex;
    }

    /**
     * Get user data by login ID
     * @param {string} userLoginId - The login ID to search for
     * @returns {Object|null} User data object, or null if not found
     */
    async getUserDataByLoginId(userLoginId) {
        const rowIndex = await this.findUserRowIndex(userLoginId);
        if (rowIndex === -1) {
            return null; // User not found
        }

        return await this.getUserDataByIndex(rowIndex);
    }

    /**
     * Get all users on the current page
     * @returns {Array<Object>} Array of user data objects
     */
    async getAllUsersOnCurrentPage() {
        const rowCount = await this.paging.getRowCount();
        const users = [];

        for (let i = 0; i < rowCount; i++) {
            users.push(await this.getUserDataByIndex(i));
        }

        return users;
    }

    /**
     * Get all users across all pages
     * @returns {Array<Object>} Array of user data objects from all pages
     */
    async getAllUsers() {
        const allUsers = [];

        // Go to first page
        const isFirstPage = await this.paging.isOnFirstPage();
        if (!isFirstPage) {
            await this.paging.goToFirstPage();
        }

        // Iterate through all pages
        do {
            // Get users on current page
            const usersOnPage = await this.getAllUsersOnCurrentPage();
            allUsers.push(...usersOnPage);

            // If on last page, exit the loop
            if (await this.paging.isOnLastPage()) {
                break;
            }

            // Go to next page
            await this.paging.goToNextPage();
        } while (true);

        return allUsers;
    }

    /**
     * Get count of all users across all pages
     * @returns {number} Total number of users
     */
    async getTotalUserCount() {
        const paginationInfo = await this.paging.getPaginationInfo();
        return paginationInfo ? paginationInfo.total : 0;
    }
}

export default UsersPage;