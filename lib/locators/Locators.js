export const Locators = {
    // Locators cho trang đăng nhập
    Login: {
        emailInput: 'input[name="email"]',
        passwordInput: 'input[name="password"]',
        loginButton: 'button[type="submit"]',
        errorMessage: '//div[@class="error-message"]',
        toastContainer: '//div[@role="alert"]',
        toastMessage: '//div[@role="alert"]//p',
        toastDismissButton: '//div[@role="alert"]//button[contains(text(), "Dismiss")]',
    },

    // Locators cho trang dashboard
    Users: {
        newUserButton: '//button[contains(., "New User")]',
        editUsersButton: '//button[contains(., "Edit users")]',
    },

    // Locators cho trang profile
    Profile: {
        nameInput: 'input[name="name"]',
        emailInput: 'input[name="email"]',
        saveButton: 'button.save',
        avatarUpload: 'input[type="file"]'
    },

    // Locators chung cho tất cả các trang
    Common: {
        header: 'header',
        footer: 'footer',
        logo: '.logo',
        loadingSpinner: '.loading-spinner',
        errorAlert: '.error-alert',
        successAlert: '.success-alert',
        table: '//table',
        tableRows: '//table//tr[td]',
        tableHeader: '//table//tr[contains(@class, "MuiTableRow-head")]//th',
        rowsPerPageDropdown: '//div[@id = ":rv:"]',
        firstPageButton: '//button[@aria-label="first page"]',
        prevPageButton: '//button[@aria-label="previous page"]',
        nextPageButton: '//button[@aria-label="next page"]',
        lastPageButton: '//button[@aria-label="last page"]',
        rowsPerPageLabel: '//p[normalize-space(text())="Rows per page:"]',
        paginationStatus: '//p[contains(@class, "MuiTablePagination-displayedRows")]',
        optionsLocator: '//li[@role="option"]',
        showColumnButton: '//button[@aria-label="Toggle table columns"]'
    },

    // Locators cho sidebar
    Sidebar: {
        sidebar: '//div[contains(@class, "MuiDrawer-root MuiDrawer-docked")]',
        sidebarToggle: '//button[@aria-label="open drawer"]',
        logoEquix: '//img[@alt="provider"]',
    },

    Search: {
        searchInput: '//input[@placeholder="Search"][1]',
        searchButton: '//button[contains(@class, "MUIDataTableToolbar-icon")][1]',
        clearButton: '//input[@placeholder="Search"]/following-sibling::div//button[1]',
    },

    Filter: {
        filterButton: '//button[@aria-label="Filter Table"][1]',
        filterDropdownOption: '//li[@role="option"]',
        resetFilterButton: '//button[contains(text(), "Reset")]',
        applyFilterButton: '//button[contains(text(), "Apply")]'
    }
};

export default Locators;
