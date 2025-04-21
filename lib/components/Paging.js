import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';

class Paging extends BasePage {
    constructor(page) {
        super(page);
        this.locators = Locators.Common;

        // Basic locators
        this.rowsPerPageDropdown = this.locators.rowsPerPageDropdown;
        this.rowsPerPageLabel = this.locators.rowsPerPageLabel;
        this.paginationStatus = this.locators.paginationStatus;
        this.firstPageButton = this.locators.firstPageButton;
        this.prevPageButton = this.locators.prevPageButton;
        this.nextPageButton = this.locators.nextPageButton;
        this.lastPageButton = this.locators.lastPageButton;
        this.table = this.locators.table;
        this.tableRows = this.locators.tableRows;
        this.optionsLocator = this.locators.optionsLocator;
    }

    // ====== ROWS PER PAGE OPERATIONS ======

    // Verify the rows per page label text
    async verifyRowsPerPageLabel(expectedText = 'Rows per page:') {
        const actualText = await this.getText(this.rowsPerPageLabel);
        return actualText === expectedText;
    }

    // Get list values in the rows per page dropdown
    async getRowsPerPageOptions() {
        return await this.getListValueFromDropdown(this.rowsPerPageDropdown, this.optionsLocator);
    }

    // Change the rows per page
    async setRowsPerPage(value) {
        await this.selectOption(this.rowsPerPageDropdown, value);
    }

    // Get current rows per page value
    async getCurrentRowsPerPage() {
        return await this.getText(this.rowsPerPageDropdown);
    }

    // Verify rows per page is applied correctly
    async verifyRowsPerPageApplied() {
        const selectedOption = parseInt(await this.getCurrentRowsPerPage(), 10);
        const rowCount = await this.getRowCount();
        const info = await this.getPaginationInfo();

        if (!info) return false;

        // On the last page, we might have fewer rows
        if (await this.isOnLastPage()) {
            return rowCount <= selectedOption;
        }

        // On non-last pages, we should have exactly the selected number of rows
        return rowCount === selectedOption;
    }

    // ====== TABLE OPERATIONS ======

    // Get the number of rows in the table
    async getRowCount() {
        const locator = this.getLocator(this.tableRows);
        return await locator.count();
    }

    // Verify row count matches pagination info
    async verifyRowCountMatchesPagination() {
        const info = await this.getPaginationInfo();
        if (!info) return false;

        const tableRowCount = await this.getRowCount();
        const { start, end } = info;
        const expectedRowCount = end - start + 1;

        return tableRowCount === expectedRowCount;
    }

    // ====== PAGINATION STATUS OPERATIONS ======

    // Get pagination status text (e.g. "16-30 of 31")
    async getPaginationStatus() {
        return await this.getText(this.paginationStatus);
    }

    // Parse pagination status to get current range and total
    async getPaginationInfo() {
        const status = await this.getPaginationStatus();
        const match = status.match(/(\d+)-(\d+) of (\d+)/);
        if (match) {
            return {
                start: parseInt(match[1], 10),
                end: parseInt(match[2], 10),
                total: parseInt(match[3], 10)
            };
        }
        return null;
    }

    // ====== PAGE NAVIGATION OPERATIONS ======

    // Go to the first page
    async goToFirstPage() {
        await this.click(this.firstPageButton);
    }

    // Go to the previous page
    async goToPreviousPage() {
        await this.click(this.prevPageButton);
    }

    // Go to the next page
    async goToNextPage() {
        await this.click(this.nextPageButton);
    }

    // Go to the last page
    async goToLastPage() {
        await this.click(this.lastPageButton);
    }

    // ====== PAGE STATUS OPERATIONS ======

    // Check if the first page button is disabled
    async isFirstPageButtonDisabled() {
        return await this.isElementDisabled(this.firstPageButton);
    }

    // Check if the previous page button is disabled
    async isPreviousPageButtonDisabled() {
        return await this.isElementDisabled(this.prevPageButton);
    }

    // Check if the next page button is disabled
    async isNextPageButtonDisabled() {
        return await this.isElementDisabled(this.nextPageButton);
    }

    // Check if the last page button is disabled
    async isLastPageButtonDisabled() {
        return await this.isElementDisabled(this.lastPageButton);
    }

    // Check if we are on the first page
    async isOnFirstPage() {
        return await this.isPreviousPageButtonDisabled() && await this.isFirstPageButtonDisabled();
    }

    // Check if we are on the last page
    async isOnLastPage() {
        return await this.isNextPageButtonDisabled() && await this.isLastPageButtonDisabled();
    }

    // Get the current page number based on pagination status
    async getCurrentPage() {
        const info = await this.getPaginationInfo();
        if (!info) return 1;

        const { start, end, total } = info;
        const rowsPerPage = parseInt(await this.getCurrentRowsPerPage(), 10);
        return Math.ceil(start / rowsPerPage);
    }

    // Get total number of pages
    async getTotalPages() {
        const info = await this.getPaginationInfo();
        if (!info) return 1;

        const { total } = info;
        const rowsPerPage = parseInt(await this.getCurrentRowsPerPage(), 10);
        return Math.ceil(total / rowsPerPage);
    }
}

export default Paging;