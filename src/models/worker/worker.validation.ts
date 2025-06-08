import { Request, Response, NextFunction } from 'express';
const { body, validationResult } = require('express-validator');

export const workerValidationRules = () => {
  return [
    body('mail').optional().isEmail().withMessage('Invalid email format'),

    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ];
};

export async function workerValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }
  console.log(errors);
  return res.status(422).json({ errors: errors.array() });
}
