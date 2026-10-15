import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_task_management',
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_SECURITY_TOKEN: process.env.API_SECURITY_TOKEN || 'roots-secret-token-2026',
};

export default env;
