import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import ErrorBanner from '../../components/common/ErrorBanner';
import { ArrowLeft, Save } from 'lucide-react';

const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
const STATUSES = ['Active', 'Inactive', 'On Leave'];

const EmployeeFormView = ({ showNotification }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    department: 'Development',
    role: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    status: 'Active',
    skills: '',
    leaveStartDate: '',
    leaveEndDate: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      loadEmployee();
    }
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployeeById(id);
      const emp = res.data;
      setFormData({
        employeeId: emp.employeeId || '',
        fullName: emp.fullName || '',
        email: emp.email || '',
        phone: emp.phone || '',
        department: emp.department || 'Development',
        role: emp.role || '',
        joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().slice(0, 10) : '',
        status: emp.status || 'Active',
        skills: Array.isArray(emp.skills) ? emp.skills.join(', ') : '',
        leaveStartDate: emp.leaveStartDate
          ? new Date(emp.leaveStartDate).toISOString().slice(0, 10)
          : '',
        leaveEndDate: emp.leaveEndDate ? new Date(emp.leaveEndDate).toISOString().slice(0, 10) : '',
      });
    } catch (err) {
      showNotification(err.message, 'error');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.employeeId.trim()) errs.employeeId = 'Employee ID is required';
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.role.trim()) errs.role = 'Role is required';
    if (!formData.joiningDate) errs.joiningDate = 'Joining Date is required';

    if (formData.status === 'On Leave') {
      if (!formData.leaveStartDate) errs.leaveStartDate = 'Leave start date is required';
      if (!formData.leaveEndDate) errs.leaveEndDate = 'Leave end date is required';
      if (
        formData.leaveStartDate &&
        formData.leaveEndDate &&
        new Date(formData.leaveEndDate) < new Date(formData.leaveStartDate)
      ) {
        errs.leaveEndDate = 'Leave end date cannot be earlier than leave start date';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      employeeId: formData.employeeId.trim().toUpperCase(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      department: formData.department,
      role: formData.role.trim(),
      joiningDate: formData.joiningDate,
      status: formData.status,
      skills: formData.skills
        ? formData.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      leaveStartDate: formData.status === 'On Leave' ? formData.leaveStartDate : null,
      leaveEndDate: formData.status === 'On Leave' ? formData.leaveEndDate : null,
    };

    try {
      if (isEditMode) {
        const res = await api.updateEmployee(id, payload);
        showNotification(res.message || 'Employee updated successfully', 'success');
      } else {
        const res = await api.createEmployee(payload);
        showNotification(res.message || 'Employee created successfully', 'success');
      }
      navigate('/employees');
    } catch (err) {
      setServerError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading employee details..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/employees"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </Link>
        <span className="text-xs text-gray-400">
          {isEditMode ? 'Editing Existing Employee' : 'Create New Employee'}
        </span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1f2328] px-6 py-4 text-white">
          <h1 className="text-lg font-bold">
            {isEditMode ? `Edit Employee (${formData.employeeId})` : 'Add New Employee'}
          </h1>
          <p className="text-xs text-gray-300 mt-0.5">
            Fill in employee information and department assignments.
          </p>
        </div>

        {/* Reusable ErrorBanner for Server business-rule errors */}
        <div className="p-6 pb-0">
          <ErrorBanner message={serverError} />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reusable FormInputs & FormSelects */}
            <FormInput
              label="Employee ID"
              name="employeeId"
              placeholder="e.g. EMP-115"
              value={formData.employeeId}
              onChange={handleChange}
              required={true}
              error={errors.employeeId}
            />

            <FormInput
              label="Full Name"
              name="fullName"
              placeholder="Enter Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required={true}
              error={errors.fullName}
            />

            <FormInput
              label="Email Address (Unique)"
              name="email"
              type="email"
              placeholder="employee@rootsmedia.com"
              value={formData.email}
              onChange={handleChange}
              required={true}
              error={errors.email}
            />

            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              required={true}
              error={errors.phone}
            />

            <FormSelect
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={DEPARTMENTS}
              placeholder="Select Department..."
              required={true}
            />

            <FormInput
              label="Role / Title"
              name="role"
              placeholder="e.g. Frontend Engineer"
              value={formData.role}
              onChange={handleChange}
              required={true}
              error={errors.role}
            />

            <FormInput
              label="Joining Date"
              name="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={handleChange}
              required={true}
              error={errors.joiningDate}
            />

            <FormSelect
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={STATUSES}
              placeholder="Select Status..."
              required={true}
            />
          </div>

          {/* Conditional Leave Dates when On Leave */}
          {formData.status === 'On Leave' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3">
                Leave Schedule (Required when status is On Leave)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Leave Start Date"
                  name="leaveStartDate"
                  type="date"
                  value={formData.leaveStartDate}
                  onChange={handleChange}
                  required={true}
                  error={errors.leaveStartDate}
                />

                <FormInput
                  label="Leave End Date"
                  name="leaveEndDate"
                  type="date"
                  value={formData.leaveEndDate}
                  onChange={handleChange}
                  required={true}
                  error={errors.leaveEndDate}
                />
              </div>
            </div>
          )}

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Skills (comma separated)
            </label>
            <input
              type="text"
              name="skills"
              placeholder="e.g. React, Node.js, Express, MongoDB, TypeScript"
              value={formData.skills}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#83282f] focus:border-[#83282f] transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">Separate distinct skills with commas.</p>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <Link to="/employees" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="btn-primary">
              <Save className="w-4 h-4" />
              {submitting ? 'Saving...' : isEditMode ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormView;
