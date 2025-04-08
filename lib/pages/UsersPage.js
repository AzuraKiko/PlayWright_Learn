import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';
import DynamicLocators from '../locators/DynamicLocators';

/**
 * Page object cho trang dashboard
 */
class UsersPage extends BasePage {
    constructor(page) {
        super(page);
        this.locators = Locators.Users;
        this.locatorsCommon = Locators.Common;


        // Locators cơ bản
        this.emailInput = this.locators.emailInput;
        this.newUserButton = this.locators.newUserButton;;
        this.editUsersButton = this.locators.editUsersButton;
        this.userTable = this.locatorsCommon.userTable;
        this.userTableRows = this.locatorsCommon.userTableRows;
        this.rowsPerPageDropdown = this.locatorsCommon.rowsPerPageDropdown;
        this.firstPageButton = this.locatorsCommon.firstPageButton;
        this.prevPageButton = this.locatorsCommon.prevPageButton;
        this.nextPageButton = this.locatorsCommon.nextPageButton;
        this.lastPageButton = this.locatorsCommon.lastPageButton;

        // Locators động
        this.dynamicUserRow = DynamicLocators.create('//table//tr[td[contains(text(), "{0}")]]');
        this.dynamicUserRowCheckbox = DynamicLocators.create('//table//tr[td[contains(text(), "{0}")]]//td[2]//input[@type="checkbox"]');
        this.dynamicUserRowEditButton = DynamicLocators.create('//table//tr[td[contains(text(), "{0}")]]//td[2]//a[@href="#/users/edit/{0}"]');
        this.dynamicUserRowDeleteButton = DynamicLocators.create('//table//tr[td[contains(text(), "{0}")]]//td[2]//a[@href="#/users/delete/{0}"]');
        this.dynamicUserRowName = DynamicLocators.create('//table//tr[td[contains(text(), "{0}")]]//td[1]');
        this.dynamicUserRowEmail = DynamicLocators.create('//table//tr[td[contains(text(), "{0}")]]//td[3]');

        this.userLoginIdColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[1]`;
        this.fullNameColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[2]`;
        this.apiAccessColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[3]`;
        this.roleColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[4]`;
        this.userGroupColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[5]`;
        this.accessMethodColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[6]`;
        this.statusColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[7]`;
        this.emailTemplateColumn = (rowIndex) => `//table//tr[${rowIndex + 1}]/td[9]`;

    }

    // Navigate to the Users page (if needed)
    async goto() {
        await this.page.goto('/users'); // Adjust URL based on your application
        await this.waitForLoadingToDisappear();
    }

    // Click the "NEW USER" button
    async clickNewUserButton() {
        await this.click(this.newUserButton);
    }

    // Click the "EDIT USERS" button
    async clickEditUsersButton() {
        await this.click(this.editUsersButton);
    }

    // Get the number of rows in the user table
    async getUserRowCount() {
        const locator = this.getLocator(this.userTableRows);
        return await locator.count();
    }

    // Get user data from a specific row
    async getUserData(rowIndex) {
        return {
            userLoginId: await this.getText(this.userLoginIdColumn(rowIndex)),
            fullName: await this.getText(this.fullNameColumn(rowIndex)),
            apiAccess: await this.getText(this.apiAccessColumn(rowIndex)),
            role: await this.getText(this.roleColumn(rowIndex)),
            userGroup: await this.getText(this.userGroupColumn(rowIndex)),
            accessMethod: await this.getText(this.accessMethodColumn(rowIndex)),
            status: await this.getText(this.statusColumn(rowIndex)),
            emailTemplate: await this.getText(this.emailTemplateColumn(rowIndex)),
        };
    }

    // Find a user by login ID and return their row index
    async findUserRowIndex(userLoginId) {
        const rowCount = await this.getUserRowCount();
        for (let i = 0; i < rowCount; i++) {
            const loginId = await this.getText(this.userLoginIdColumn(i));
            if (loginId === userLoginId) {
                return i;
            }
        }
        return -1; // Return -1 if user not found
    }

    // Click the API Access button for a specific user
    async clickApiAccessForUser(rowIndex) {
        await this.click(this.apiAccessColumn(rowIndex));
    }

    // Change the rows per page
    async setRowsPerPage(value) {
        await this.selectOption(this.rowsPerPageDropdown, value);
    }

    // Go to the next page
    async goToNextPage() {
        await this.click(this.nextPageButton);
    }

    // Go to the previous page
    async goToPreviousPage() {
        await this.click(this.previousPageButton);
    }

    // Check if the next page button is disabled
    async isNextPageButtonDisabled() {
        return await this.isElementDisabled(this.nextPageButton);
    }

    // Check if the previous page button is disabled
    async isPreviousPageButtonDisabled() {
        return await this.isElementDisabled(this.previousPageButton);
    }
}

export default UsersPage;
