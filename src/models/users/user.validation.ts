import { Request, Response, NextFunction } from 'express';
const { body, validationResult } = require('express-validator');

export const userValidationRules = () => {
    return[
        body('mail').isEmail().withMessage("invalid email, try again"),
        body('password').isLength({min:6}).withMessage("Try again, password is too short, minimum 6 values"),
    ]
}

export async function userValidator (req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
  
    if (errors.isEmpty()) {
      return next();
    }
    console.log(errors);
    return res.status(422).json({ errors: errors.array() });
  }