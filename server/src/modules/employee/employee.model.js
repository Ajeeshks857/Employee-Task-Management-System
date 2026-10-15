import mongoose from 'mongoose';
import { slugify } from '../../utils/slug.js';

export const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
export const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: DEPARTMENTS,
        message: '{VALUE} is not a valid department',
      },
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: EMPLOYEE_STATUSES,
        message: '{VALUE} is not a valid employee status',
      },
      default: 'Active',
    },
    skills: {
      type: [String],
      default: [],
    },
    leaveStartDate: {
      type: Date,
      default: null,
    },
    leaveEndDate: {
      type: Date,
      default: null,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.pre('validate', function (next) {
  if (this.employeeId && this.fullName) {
    this.slug = slugify(`${this.employeeId}-${this.fullName}`);
  }

  if (this.status === 'On Leave') {
    if (!this.leaveStartDate || !this.leaveEndDate) {
      this.leaveStartDate = new Date();
      this.leaveEndDate = new Date(Date.now() + 7 * 86400000);
    }
    if (new Date(this.leaveEndDate) < new Date(this.leaveStartDate)) {
      return next(new Error('Leave end date cannot be earlier than leave start date.'));
    }
  } else {
    this.leaveStartDate = null;
    this.leaveEndDate = null;
  }
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
