import BasePage from '../core/BasePage';
import { Locators } from '../locators/Locators';
import DynamicLocators from '../locators/DynamicLocators';


class Filter extends BasePage {
    constructor(page) {
        super(page);
        this.locators = Locators.Filter;
        this.commonLocators = Locators.Common;

        // Basic locators
        this.filterButton = this.locators.filterButton;
        this.applyFilterButton = this.locators.applyFilterButton;
        this.resetFilterButton = this.locators.resetFilterButton;

        this.tableHeader = this.commonLocators.tableHeader;

        this.dynamicFilterInput = DynamicLocators.create('//input[@id="{0}"]');
        this.dynamicFilterSelect = DynamicLocators.create('//div[@aria-labelledby="{0}"]');


        this.inputItems = {
            userLoginId: 'user_login_id',
            fullName: 'full_name',
            phone: 'phone-label',
            note: 'note',
            actor: 'actor'
        }

        this.selectItems = {
            timeFilterColumn: 'time_filter_column time_filter_column',
            apiAccess: 'user_type user_type',
            roleGroup: 'role_group role_group',
            userGroup: 'user_group user_group',
            status: 'status status',
            memberInfo: 'member_infor member_infor'
        }
    }

    /**
     * Open filter options panel
     */
    async openFilterOptions() {
        await this.click(this.filterButton);
    }

    async getFilterInput(id) {
        return this.dynamicFilterInput(id);
    }

    async getFilterSelect(aria) {
        return this.dynamicFilterSelect(aria);
    }

    /**
     * Apply filter with specific criteria
     * @param {Object} filterOptions - Object containing filter field-value pairs
     * @example
     * await Filter.applyFilter({
     *   'Role Group': 'Admin',
     *   'Status': 'Active'
     * });
     */
    async applyFilter(filterOptions) {
        await this.openFilterOptions();

        // Set filters based on provided options
        for (const [field, value] of Object.entries(filterOptions)) {
            // Nếu có trong inputItems
            const inputId = this.inputItems[field];
            if (inputId) {
                const locator = this.getFilterInput(inputId);
                if (await this.isElementVisible(locator)) {
                    await this.setText(locator, value);
                }
            }

            // Nếu có trong selectItems
            const selectId = this.selectItems[field];
            if (selectId) {
                const locator = this.getFilterSelect(selectId);
                if (await this.isElementVisible(locator)) {
                    await this.selectOption(locator, value);
                }
            }

            await this.click(this.applyFilterButton);
            await this.waitForLoadingToDisappear();
        }
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
     * Verify if filtering is working correctly on specified column
     * @param {string} columnLocator - Locator for the column to check
     * @param {string} filterValue - Value that was used for filtering
     * @returns {boolean} Whether all results match the filter value
     */
    async verifyFilterResultsInColumn(columnLocator, filterValue) {
        const rowCount = await this.getElementCount(columnLocator);

        for (let i = 0; i < rowCount; i++) {
            const cellText = await this.getText(`${columnLocator}[${i + 1}]`);
            if (!cellText.toLowerCase().includes(filterValue.toLowerCase())) {
                return false;
            }
        }

        return true;
    }

    /**
    * Verify if each row in search results contains the search text in specified columns
    * filterOptions: object có cặp key là columnLocator, value là từ khóa filter
    * ví dụ: { '//table//tr/td[2]': 'alice', '//table//tr/td[4]': 'admin' }
    */

    async verifySearchResultsInManyColumns(filterOptions) {
        const columnLocators = Object.keys(filterOptions);
        const filterValues = Object.values(filterOptions);

        // Giả định tất cả cột có cùng số dòng, dùng cột đầu tiên lấy số dòng
        const rowCount = await this.getElementCount(columnLocators[0]);

        for (let i = 0; i < rowCount; i++) {
            for (let col = 0; col < columnLocators.length; col++) {
                const cellText = await this.getText(`${columnLocators[col]}[${i + 1}]`);
                if (!cellText.toLowerCase().includes(filterValues[col].toLowerCase())) {
                    return false;
                }
            }
        }
        return true;
    }
}

export default Filter;