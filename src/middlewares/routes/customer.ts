import { body, param } from 'express-validator';
import { HttpStatus } from "../../constants";
import { errorDetails } from '../validators';


export const validateUpdateUser = [
    body('firstName').optional().isString().notEmpty().withMessage('First name must be a non-empty string'),
    body('lastName').optional().isString().notEmpty().withMessage('Last name must be a non-empty string'),
    body('email').optional().isEmail().withMessage('Email must be a valid email address'),
    body('password').optional().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    body('phoneNumber').optional().isString().notEmpty().withMessage('Phone number must be a non-empty string'),
    body().custom((value, { req }) => {
        const allowedFields = ['firstName', 'lastName', 'email', 'password', 'phoneNumber'];
        const keys = Object.keys(req.body);

        const invalidFields = keys.filter(key => !allowedFields.includes(key));
        if (invalidFields.length > 0) {
            throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
        }
        return true;
    }),
];