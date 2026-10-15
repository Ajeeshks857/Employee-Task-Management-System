import React from 'react';
import useTaskFormDrawer, { DEPARTMENTS, PRIORITIES } from './useTaskFormDrawer';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import ErrorBanner from '../../components/common/ErrorBanner';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { X } from 'lucide-react';

const TaskFormDrawer = (props) => {
  const {
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
  } = useTaskFormDrawer(props);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pointer-events-none">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={isEditMode ? 'Edit Task' : 'Add Task'}
          className={`w-screen max-w-lg bg-white shadow-2xl flex flex-col pointer-events-auto transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isAnimating ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="bg-[#121214] text-white px-6 py-4 flex items-center justify-between border-b border-gray-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-5 bg-[#d2b68a] rounded-xs"></span>
              <h2 className="text-lg font-bold tracking-wide">
                {isEditMode ? 'Edit Task' : 'Add Task'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-1.5 rounded-md transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Form */}
          {loading ? (
            <div className="flex-1 flex flex-col justify-center p-8 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Loading task data...
                </div>
                <SkeletonLoader lines={6} lineClassName="h-4" gap="gap-3" />
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col justify-between overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                <FormInput
                  label="Title *"
                  name="title"
                  placeholder="Enter Task Title"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  required
                />

                <FormSelect
                  label="Assign Employee *"
                  name="assignedEmployee"
                  placeholder="Select Assignee"
                  value={formData.assignedEmployee}
                  onChange={handleChange}
                  options={employeeOptions}
                  error={errors.assignedEmployee}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Priority *"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    options={PRIORITIES}
                    required
                  />

                  <FormSelect
                    label="Department *"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    options={DEPARTMENTS}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Start Date *"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    error={errors.startDate}
                    required
                  />

                  <FormInput
                    label="Due Date *"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    error={errors.dueDate}
                    required
                  />
                </div>

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
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
};

export default TaskFormDrawer;
