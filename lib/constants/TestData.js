import TestDataHelper from '../utils/TestDataHelper.js';

const invalidEmail = TestDataHelper.generateRandomString(2) + '@novus-fintech.com';
const invalidFormatEmail = TestDataHelper.generateRandomString(2) + '@novus-fintech';
const invalidPassword = TestDataHelper.generateRandomString(8);
const invalidCode = TestDataHelper.generateRandomString(6);

export const TestData = {
    Users: {
        ValidUser: {
            email: 'minh.tfg@equix.com.au',
            password: 'Abc123456@',
            code: '111111',
        },
        InvalidUser: {
            email: invalidEmail,
            invalidFormatEmail: invalidFormatEmail,
            password: invalidPassword,
            code: invalidCode,
        }
    },

    ErrorMessages: {
        WrongFormatEmail: 'Email is invalid',
        EmptyEmail: 'Email is required',
        EmptyPassword: 'Password is required'
    }
};
