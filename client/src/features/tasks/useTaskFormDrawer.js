import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function useTaskFormDrawer({
  isOpen,
  onClose,
  onSuccess,
  taskId = null,
  showNotification,
}) {
  const isEditMode = Boolean(taskId);

  const [loading, setLoading] = useState(false);
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

  const initForm = useCallback(async () => {
    if (!isOpen) return;

    try {
      setLoading(true);
      setServerError('');
      setErrors({});

      const empRes = await api.getAssignableEmployees();
      setEmployees(empRes.data);

      if (isEditMode && taskId) {
        const taskRes = await api.getTaskById(taskId);
        const task = taskRes.data;

        if (task.status === 'Completed' || task.status === 'Cancelled') {
          showNotification(`Tasks with status '${task.status}' cannot be edited.`, 'error');
          onClose();
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
      } else {
        const availableEmp = empRes.data.find((e) => !e.isCapacityFull);
        setFormData({
          title: '',
          assignedEmployee: availableEmp ? availableEmp._id : '',
          priority: 'Medium',
          department: availableEmp ? availableEmp.department : 'Development',
          startDate: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          description: '',
        });
      }
    } catch (err) {
      showNotification(err.message, 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [isOpen, taskId, isEditMode, showNotification, onClose]);

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
        const res = await api.updateTask(taskId, payload);
        showNotification(res.message || 'Task updated successfully', 'success');
      } else {
        const res = await api.createTask(payload);
        showNotification(res.message || 'Task created successfully', 'success');
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

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.fullName} (${emp.department} - ${emp.activeTasksCount}/3 active${
      emp.status === 'On Leave' ? ' - On Leave' : ''
    })`,
  }));

  return {
    isEditMode,
    loading,
    submitting,
    serverError,
    shouldRender,
    isAnimating,
    formData,
    errors,
    employeeOptions,
    handleChange,
    handleSubmit,
    onClose,
  };
}
