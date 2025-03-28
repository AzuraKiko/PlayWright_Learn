/**
 * Dữ liệu test
 */
export const TestData = {
    Users: {
        Admin: {
            username: 'admin',
            password: 'admin123',
            role: 'admin'
        },
        StandardUser: {
            username: 'user',
            password: 'user123',
            role: 'user'
        },
        InvalidUser: {
            username: 'invalid',
            password: 'invalid123'
        }
    },
    
    Profiles: {
        User1: {
            name: 'John Doe',
            email: 'john.doe@example.com'
        },
        User2: {
            name: 'Jane Smith',
            email: 'jane.smith@example.com'
        }
    },
    
    ErrorMessages: {
        InvalidCredentials: 'Invalid username or password',
        EmptyUsername: 'Username is required',
        EmptyPassword: 'Password is required'
    }
};

export default TestData;
