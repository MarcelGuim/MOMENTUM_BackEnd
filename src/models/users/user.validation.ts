import { Request, Response, NextFunction } from 'express';
const { body, validationResult } = require('express-validator');

export const userValidationRules = () => {
  return [
      body('mail')
          .optional() // Only validate if mail is present
          .isEmail()
          .withMessage("Invalid email format"),
          
      body('password')
          .optional() // Only validate if password is present
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters long")
  ];
}

export async function userValidator (req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
  
    if (errors.isEmpty()) {
      return next();
    }
    console.log(errors);
    return res.status(422).json({ errors: errors.array() });
  }