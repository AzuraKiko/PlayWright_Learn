import BasePage from "../core/BasePage";
import { Locators } from "../locators/Locators";
import DynamicLocators from "../locators/DynamicLocators";

class ShowColumn extends BasePage {
    constructor(page) {
        super(page);
        this.locators = Locators.Common;

        // Basic locators
        this.showColumnButton = this.locators.showColumnButton;

        this.tableHeader = this.commonLocators.tableHeader;

        this.dynamicColumnName = DynamicLocators.create(
            '//label[.//span[contains(normalize-space(), "{0}")]]/span/input[@type="checkbox"]'
        );

        this.columnCheckboxSelector = '.MuiFormGroup-root .MuiFormControlLabel-root input[type="checkbox"]';

        this.columnLabelSelector = '.MuiFormControlLabel-root:has(input[type="checkbox"]:checked) .MuiFormControlLabel-label';


    }

    /**
     * Opens the column visibility popup
     */
    async openColumnPopup() {
        try {
            await this.click(this.showColumnButton);
        } catch (error) {
            throw new Error(`Failed to open column popup: ${error.message}`);
        }
    }

    /**
     * Closes the column visibility popup
     * @private
     */
    async #closeColumnPopup() {
        try {
            await this.click(this.tableHeader);
        } catch (error) {
            throw new Error(`Failed to close column popup: ${error.message}`);
        }
    }

    /**
     * Gets the checkbox element for a specific column
     * @param {string} columnName - Name of the column
     * @returns {Promise<ElementHandle>} The checkbox element
     */
    async getColumnName(columnName) {
        return this.dynamicColumnName(columnName);
    }

    /**
     * Toggles a column's visibility state
     * @param {string} columnName - Name of the column to toggle
     * @param {boolean} shouldBeVisible - Whether the column should be visible
     */
    async toggleColumnVisibility(columnName, shouldBeVisible) {
        try {
            await this.openColumnPopup();

            const columnCheckbox = await this.getColumnName(columnName);
            const isChecked = await this.isElementChecked(columnCheckbox);

            if (isChecked !== shouldBeVisible) {
                await this.click(columnCheckbox);
                await this.waitForLoadingToDisappear();
            }

            await this.#closeColumnPopup();
        } catch (error) {
            throw new Error(`Failed to toggle column visibility for ${columnName}: ${error.message}`);
        }
    }

    /**
    * Makes a column visible
    * @param {string} columnName - Name of the column to show
    */
    async toggleColumn(columnName) {
        await this.toggleColumnVisibility(columnName, true);
    }

    /**
     * Hides a column
     * @param {string} columnName - Name of the column to hide
     */
    async untoggleColumn(columnName) {
        await this.toggleColumnVisibility(columnName, false);
    }


    /**
     * Verify that all columns are checked by default
     * @returns {Promise<boolean>} True if all columns are checked, false otherwise
     */
    async verifyAllColumnsCheckedByDefault() {
        try {
            await this.openColumnPopup();

            // Get count of all checkboxes
            const allCheckboxesCount = await this.getElementCount(this.columnCheckboxSelector);


            // Get count of checked checkboxes
            const checkedCheckboxesCount = await this.getElementCount(`${this.columnCheckboxSelector}:checked`);


            // Close the column menu
            await this.#closeColumnPopup();

            // If the count of checked checkboxes equals the count of all checkboxes, all are checked
            return (
                allCheckboxesCount > 0 && allCheckboxesCount === checkedCheckboxesCount
            );
        } catch (error) {
            throw new Error(`Failed to verify default column state: ${error.message}`);
        }
    }

    /**
     * Gets list of currently visible columns
     * @returns {Promise<Array<string>>} Array of visible column names
     */
    async getVisibleColumns() {
        try {
            await this.openColumnPopup();

            const columnElements = await this.page.$$(this.columnLabelSelector);

            const columns = await Promise.all(
                columnElements.map(element => this.getText(element))
            );

            // Close the column menu
            await this.#closeColumnPopup();

            return columns.map(text => text.trim());
        } catch (error) {
            throw new Error(`Failed to get visible columns: ${error.message}`);
        }
    }

    /**
     * Show all columns
     */
    async showAllColumns() {
        try {
            await this.openColumnPopup();

            // Find all unchecked checkboxes within the column options
            const uncheckedBoxesSelector = `${this.columnCheckboxSelector}:not(:checked)`;
            let uncheckedBoxes = await this.page.$$(uncheckedBoxesSelector);

            // Click each unchecked checkbox
            while (uncheckedBoxes.length > 0) {
                // Click the first unchecked checkbox
                await uncheckedBoxes[0].click();

                // Re-query to get the updated list of unchecked boxes
                uncheckedBoxes = await this.page.$$(uncheckedBoxesSelector);
            }

            // Close the column menu
            await this.#closeColumnPopup();
        } catch (error) {
            throw new Error(`Failed to show all columns: ${error.message}`);
        }
    }
}

export default ShowColumn;
