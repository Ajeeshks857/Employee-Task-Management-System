import { AppError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.details || null;

  // Handle Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    if (field.toLowerCase().includes('email')) {
      message = `Email address '${val}' is already registered. Please use another email.`;
    } else if (field.toLowerCase().includes('employeeid')) {
      message = `Employee ID '${val}' is already in use. Please choose a unique Employee ID.`;
    } else {
      message = `Duplicate value '${val}' for unique field: ${field}.`;
    }
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const fieldMessages = Object.values(err.errors).map((e) => e.message);
    message = fieldMessages.join('. ');
    errors = err.errors;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
  });
};
