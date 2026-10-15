import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
export const STATUSES = ['Active', 'Inactive', 'On Leave'];

export default function useEmployeeFormDrawer({
  isOpen,
  onClose,
  onSuccess,
  employeeId = null,
  showNotification,
}) {
  const isEditMode = Boolean(employeeId);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let animId;
    let timeoutId;
    if (isOpen) {
      setShouldRender(true);
      animId = requestAnimationFrame(() => {
        animId = requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, 350);
    }
    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

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

  const initForm = useCallback(async () => {
    if (!isOpen) return;

    setServerError('');
    setErrors({});

    if (isEditMode && employeeId) {
      try {
        setLoading(true);
        const res = await api.getEmployeeById(employeeId);
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
          leaveEndDate: emp.leaveEndDate
            ? new Date(emp.leaveEndDate).toISOString().slice(0, 10)
            : '',
        });
      } catch (err) {
        showNotification(err.message, 'error');
        onClose();
      } finally {
        setLoading(false);
      }
    } else {
      setFormData({
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
      setLoading(false);
    }
  }, [isOpen, employeeId, isEditMode, showNotification, onClose]);

  useEffect(() => {
    initForm();
  }, [initForm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
      skills:
        typeof formData.skills === 'string'
          ? formData.skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : Array.isArray(formData.skills)
            ? formData.skills
            : [],
      leaveStartDate: formData.status === 'On Leave' ? formData.leaveStartDate : null,
      leaveEndDate: formData.status === 'On Leave' ? formData.leaveEndDate : null,
    };

    try {
      if (isEditMode) {
        const res = await api.updateEmployee(employeeId, payload);
        showNotification(res.message || 'Employee updated successfully', 'success');
      } else {
        const res = await api.createEmployee(payload);
        showNotification(res.message || 'Employee created successfully', 'success');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isEditMode,
    loading,
    submitting,
    serverError,
    shouldRender,
    isAnimating,
    formData,
    errors,
    handleChange,
    handleSubmit,
    onClose,
  };
}
