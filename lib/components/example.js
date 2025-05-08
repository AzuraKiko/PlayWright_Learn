// Example test using the refactored page objects
import { test } from '@playwright/test';
import UsersPage from '../pages/UsersPage';

test('User management operations', async ({ page }) => {
    // Initialize the Users page
    const usersPage = new UsersPage(page);

    // Navigate to the Users page
    await usersPage.openUsersPage();

    // SEARCH FUNCTIONALITY
    // Search for a specific user
    await usersPage.search.search('min@equix.com.au');

    // Verify search results
    const searchResultsValid = await usersPage.verifySearchResults('userLoginId', 'min');
    console.log('Search results valid:', searchResultsValid);

    // Clear search
    await usersPage.search.clearSearch();

    // FILTER FUNCTIONALITY
    // Apply filter for specific role
    await usersPage.filter.applyFilter({
        'Role Group': 'QE ADMIN',
        'Status': 'Active'
    });

    // Verify filter results
    const filterResultsValid = await usersPage.verifyFilterResults('roleGroup', 'QE ADMIN');
    console.log('Filter results valid:', filterResultsValid);

    // Reset filters
    await usersPage.filter.resetFilters();

    // COLUMN MANAGEMENT
    // Toggle visibility of a column
    await usersPage.filter.toggleColumn('Member Information', false);

    // Get all visible columns
    const visibleColumns = await usersPage.filter.getVisibleColumns();
    console.log('Visible columns:', visibleColumns);

    // Show all columns again
    await usersPage.filter.showAllColumns();

    // PAGINATION
    // Change rows per page
    await usersPage.paging.setRowsPerPage('30');

    // Navigate through pages
    if (!(await usersPage.paging.isOnLastPage())) {
        await usersPage.paging.goToNextPage();
    }

    if (!(await usersPage.paging.isOnFirstPage())) {
        await usersPage.paging.goToPreviousPage();
    }

    // Get pagination info
    const paginationInfo = await usersPage.paging.getPaginationInfo();
    console.log('Pagination info:', paginationInfo);

    // DATA RETRIEVAL
    // Get user by login ID
    const userData = await usersPage.getUserDataByLoginId('min@equix.com.au');
    console.log('User data:', userData);

    // Get all users on current page
    const allUsers = await usersPage.getAllUsersOnCurrentPage();
    console.log('Number of users on current page:', allUsers.length);

    // Get total user count
    const totalUsers = await usersPage.getTotalUserCount();
    console.log('Total number of users:', totalUsers);
});


// Ví dụ
const columnLocators = [
    '//table/tbody/tr/td[1]', // Cột ID
    '//table/tbody/tr/td[2]', // Cột Full Name
    '//table/tbody/tr/td[3]'  // Cột Email
];

const result = await verifySearchResults(columnLocators, 'john');