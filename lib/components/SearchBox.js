import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';

class Search extends BasePage {
    constructor(page) {
        super(page);
        this.locators = Locators.Search;

        // Basic locators
        this.searchInput = this.locators.searchInput;
        this.searchButton = this.locators.searchButton;
        this.clearButton = this.locators.clearButton;
    }

    /**
     * Search for a specific text
     * @param {string} searchText - Text to search for
     * @param {boolean} pressEnter - Whether to press Enter after typing (defaults to true)
     */
    async search(searchText) {
        await this.setText(this.searchInput, searchText);

        await this.page.keyboard.press('Enter');

        await this.waitForLoadingToDisappear();
    }

    /**
     * Clear the search field
     */
    async clearSearch() {
        await this.click(this.clearButton);
        await this.waitForLoadingToDisappear();
    }

    /**
     * Get the current search text
     * @returns {string} Current search text
     */
    async getCurrentSearchText() {
        return await this.getInputValue(this.searchInput);
    }

    /**
     * Verify if search results contain the search text in a specified column
     * @param {string} columnLocator - Locator for the column to check
     * @param {string} searchText - Text that was searched for
     * @returns {boolean} Whether all results contain the search text
     */
    async verifySearchResultsInColumn(columnLocator, searchText) {
        const rowCount = await this.getElementCount(columnLocator);

        for (let i = 0; i < rowCount; i++) {
            const cellText = await this.getText(`${columnLocator}[${i + 1}]`);
            if (!cellText.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }
        }

        return true;
    }

    /**
    * Verify if each row in search results contains the search text in any of the specified columns
    * @param {string[]} columnLocators - Locators for the columns to check
    * @returns {boolean} Whether all results contain the search text
    * await Search.verifySearchResultsInAnyColumn([
    *'//table/tbody/tr/td[1]', // Cột ID
    *'//table/tbody/tr/td[2]', // Cột Full Name
    *'//table/tbody/tr/td[3]'  // Cột Email
    * ], 'john');
    */

    async verifySearchResultsInAnyColumn(columnLocators, searchText) {
        // Get the row count from the first column (assuming all columns have the same number of rows)
        const rowCount = await this.getElementCount(columnLocators[0]);

        // Check each row
        for (let i = 0; i < rowCount; i++) {
            let rowMatchesSearch = false;

            // Check each column in the current row
            for (const columnLocator of columnLocators) {
                const cellText = await this.getText(`${columnLocator}[${i + 1}]`);

                if (cellText.toLowerCase().includes(searchText.toLowerCase())) {
                    rowMatchesSearch = true;
                    break; // Found a match in this row, no need to check other columns
                }
            }

            // If no column in this row contains the search text, return false
            if (!rowMatchesSearch) {
                return false;
            }
        }

        // All rows contain the search text in at least one of the specified columns
        return true;
    }
}

export default Search;