import mongoose from 'mongoose';
import Counter from '../common/counter.model.js';
import { slugify } from '../../utils/slug.js';

export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Assigned employee is required'],
    },
    // Historical snapshot of employee details: persists even if employee is deleted
    employeeSnapshot: {
      employeeId: { type: String, default: '' },
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      department: { type: String, default: '' },
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: ['Development', 'Design', 'QA', 'HR', 'Sales'],
        message: '{VALUE} is not a valid department',
      },
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: TASK_PRIORITIES,
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: TASK_STATUSES,
        message: '{VALUE} is not a valid status',
      },
      default: 'Todo',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for overdue calculation
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Completed' || this.status === 'Cancelled') {
    return false;
  }
  if (!this.dueDate) return false;
  const now = new Date();
  const due = new Date(this.dueDate);
  // Overdue if current date/time is past dueDate end of day or exact timestamp
  return now > due;
});

// Auto-generate taskId (e.g. TSK-001) and slug before save
taskSchema.pre('save', async function (next) {
  if (this.isNew && !this.taskId) {
    const seq = await Counter.getNextSequence('taskId');
    this.taskId = `TSK-${String(seq).padStart(3, '0')}`;
  }
  if (this.title) {
    const prefix = this.taskId ? this.taskId.toLowerCase() : 'tsk';
    this.slug = slugify(`${prefix}-${this.title.slice(0, 60)}`);
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
