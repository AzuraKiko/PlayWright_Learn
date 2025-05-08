import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';

/**
 * Reusable filter component that can be used across multiple pages
 */
class Filter extends BasePage {
    constructor(page) {
        super(page);
        this.locators = Locators.Common;

        // Basic locators
        this.filterButton = this.locators.filterButton;
        this.filterOptions = this.locators.filterOptions;
        this.applyFilterButton = this.locators.applyFilterButton;
        this.resetFilterButton = this.locators.resetFilterButton;
        this.columnToggleButton = this.locators.columnToggleButton;
        this.columnOptions = this.locators.columnOptions;
        this.tableHeader = this.locators.tableHeader;
    }

    /**
     * Open filter options panel
     */
    async openFilterOptions() {
        await this.click(this.filterButton);
    }

    /**
     * Apply filter with specific criteria
     * @param {Object} filterOptions - Object containing filter field-value pairs
     * @example
     * await filter.applyFilter({
     *   'Role Group': 'Admin',
     *   'Status': 'Active'
     * });
     */
    async applyFilter(filterOptions) {
        await this.openFilterOptions();

        // Set filters based on provided options
        for (const [field, value] of Object.entries(filterOptions)) {
            // Handle both dropdown and text input fields
            const fieldSelector = `//input[@placeholder="${field}"] | //select[@aria-label="${field}"]`;
            const isDropdown = await this.isElementPresent(`${fieldSelector}//ancestor::div[contains(@class, "dropdown")]`);

            if (isDropdown) {
                // Handle dropdown field
                await this.selectDropdownOption(fieldSelector, value);
            } else {
                // Handle text input field
                await this.fillText(fieldSelector, value);
            }
        }

        await this.click(this.applyFilterButton);
        await this.waitForLoadingToDisappear();
    }

    /**
     * Reset all filters
     */
    async resetFilters() {
        await this.openFilterOptions();
        await this.click(this.resetFilterButton);
        await this.waitForLoadingToDisappear();
    }

    /**
     * Close filter options panel without applying
     */
    async cancelFilters() {
        // Click outside the filter panel to close it
        await this.click(this.tableHeader);
    }

    /**
     * Toggle column visibility
     * @param {string} columnName - Name of the column to toggle
     * @param {boolean} shouldBeVisible - Whether the column should be visible
     */
    async toggleColumn(columnName, shouldBeVisible) {
        await this.click(this.columnToggleButton);

        const columnCheckbox = `${this.columnOptions} >> text=${columnName}`;
        const isChecked = await this.isChecked(columnCheckbox);

        if ((shouldBeVisible && !isChecked) || (!shouldBeVisible && isChecked)) {
            await this.click(columnCheckbox);
        }

        // Click outside to close the column menu
        await this.click(this.tableHeader);
    }

    /**
     * Get current visible columns
     * @returns {Array<string>} Array of visible column names
     */
    async getVisibleColumns() {
        await this.click(this.columnToggleButton);

        const checkboxLocator = `${this.columnOptions} input[type="checkbox"]:checked`;
        const checkboxCount = await this.getElementCount(checkboxLocator);
        const columns = [];

        for (let i = 0; i < checkboxCount; i++) {
            const labelLocator = `(${this.columnOptions} input[type="checkbox"]:checked/following-sibling::label)[${i + 1}]`;
            const columnName = await this.getText(labelLocator);
            columns.push(columnName);
        }

        // Close the column menu
        await this.click(this.tableHeader);

        return columns;
    }

    /**
     * Show all columns
     */
    async showAllColumns() {
        await this.click(this.columnToggleButton);

        const uncheckboxLocator = `${this.columnOptions} input[type="checkbox"]:not(:checked)`;
        const uncheckboxCount = await this.getElementCount(uncheckboxLocator);

        for (let i = 0; i < uncheckboxCount; i++) {
            // Always click the first unchecked box since the index will change after each click
            await this.click(`(${uncheckboxLocator})[1]`);
        }

        // Close the column menu
        await this.click(this.tableHeader);
    }

    /**
     * Verify if filtering is working correctly on specified column
     * @param {string} columnLocator - Locator for the column to check
     * @param {string} filterValue - Value that was used for filtering
     * @returns {boolean} Whether all results match the filter value
     */
    async verifyFilterResults(columnLocator, filterValue) {
        const rowCount = await this.getElementCount(columnLocator);

        for (let i = 0; i < rowCount; i++) {
            const cellText = await this.getText(`${columnLocator}[${i + 1}]`);
            if (!cellText.toLowerCase().includes(filterValue.toLowerCase())) {
                return false;
            }
        }

        return true;
    }
}

export default Filter;