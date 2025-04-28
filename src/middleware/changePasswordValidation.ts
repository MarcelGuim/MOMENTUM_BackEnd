// src/middleware/changePasswordValidation.ts
import { Request, Response, NextFunction } from 'express';

export function changePasswordValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };
  const errors: { field: string; message: string }[] = [];

  if (!currentPassword) {
    errors.push({
      field: 'currentPassword',
      message: 'Current password is required',
    });
  }

  if (!newPassword) {
    errors.push({
      field: 'newPassword',
      message: 'New password is required',
    });
  } else if (newPassword.length < 8) {
    errors.push({
      field: 'newPassword',
      message: 'New password must be at least 8 characters long',
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  next();
}
