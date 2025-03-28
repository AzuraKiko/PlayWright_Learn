export const Locators = {
    // Locators cho trang đăng nhập
    Login: {
        usernameInput: 'input[name="username"]',
        passwordInput: 'input[name="password"]',
        loginButton: 'button[type="submit"]',
        forgotPasswordLink: 'a[href*="forgot-password"]',
        errorMessage: '.error-message',
        rememberMeCheckbox: 'input[type="checkbox"]#remember'
    },

    // Locators cho trang dashboard
    Dashboard: {
        welcomeMessage: '.welcome-message',
        userProfile: '.user-profile',
        logoutButton: 'button.logout',
        navigationMenu: '.nav-menu',
        notificationIcon: '.notification-icon'
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
        successAlert: '.success-alert'
    }
};

export default Locators;
