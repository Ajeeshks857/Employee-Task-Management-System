import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import ErrorBanner from '../../components/common/ErrorBanner';
import { ArrowLeft } from 'lucide-react';

const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const TaskFormView = ({ showNotification }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [serverError, setServerError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    assignedEmployee: '',
    priority: 'Medium',
    department: 'Development',
    startDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    initForm();
  }, [id]);

  const initForm = async () => {
    try {
      setLoading(true);
      const empRes = await api.getAssignableEmployees();
      setEmployees(empRes.data);

      if (isEditMode) {
        const taskRes = await api.getTaskById(id);
        const task = taskRes.data;

        if (task.status === 'Completed' || task.status === 'Cancelled') {
          showNotification(`Tasks with status '${task.status}' cannot be edited.`, 'error');
          navigate('/tasks');
          return;
        }

        setFormData({
          title: task.title || '',
          assignedEmployee: task.assignedEmployee?._id || '',
          priority: task.priority || 'Medium',
          department: task.department || 'Development',
          startDate: task.startDate ? new Date(task.startDate).toISOString().slice(0, 10) : '',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
          description: task.description || '',
        });
      } else if (empRes.data.length > 0) {
        const availableEmp = empRes.data.find((e) => !e.isCapacityFull);
        if (availableEmp) {
          setFormData((prev) => ({
            ...prev,
            assignedEmployee: availableEmp._id,
            department: availableEmp.department,
          }));
        }
      }
    } catch (err) {
      showNotification(err.message, 'error');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.assignedEmployee) errs.assignedEmployee = 'Assigned employee is required';
    if (!formData.startDate) errs.startDate = 'Start date is required';
    if (!formData.dueDate) errs.dueDate = 'Due date is required';

    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.dueDate) < new Date(formData.startDate)) {
        errs.dueDate = 'Due Date cannot be earlier than Start Date';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'assignedEmployee') {
        const emp = employees.find((empItem) => empItem._id === value);
        if (emp) next.department = emp.department;
      }
      return next;
    });

    setServerError('');
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignedEmployee: formData.assignedEmployee,
      department: formData.department,
      priority: formData.priority,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
    };

    try {
      if (isEditMode) {
        const res = await api.updateTask(id, payload);
        showNotification(res.message || 'Task updated successfully', 'success');
      } else {
        const res = await api.createTask(payload);
        showNotification(res.message || 'Task created successfully', 'success');
      }
      navigate('/tasks');
    } catch (err) {
      setServerError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading task form..." />;
  }

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.fullName} (${emp.department} - ${emp.activeTasksCount}/3 active${
      emp.status === 'On Leave' ? ' - On Leave' : ''
    })`,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>
        <span className="text-xs text-gray-400">{isEditMode ? 'Edit Task' : 'New Task'}</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Form Title Header */}
        <div className="py-5 px-6 border-b border-gray-200 text-center">
          <h1 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Task' : 'Add Task'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Reusable FormInput & FormSelect */}
            <FormInput
              label="Title"
              name="title"
              placeholder="Enter Title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
            />

            <FormSelect
              label="Assigned Employee"
              name="assignedEmployee"
              value={formData.assignedEmployee}
              onChange={handleChange}
              options={employeeOptions}
              placeholder="Select..."
              error={errors.assignedEmployee}
            />

            <FormSelect
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={PRIORITIES}
              placeholder="Select..."
            />

            <FormSelect
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={DEPARTMENTS}
              placeholder="Select..."
            />

            <FormInput
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
            />

            <FormInput
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              error={errors.dueDate}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Enter Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#83282f] focus:border-[#83282f] transition-colors"
            />
          </div>

          {/* Error Banner */}
          <ErrorBanner message={serverError} />

          {/* Submit Button */}
          <div className="pt-2">
            <button type="submit" disabled={submitting} className="w-full btn-primary py-2.5">
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormView;
