import React from 'react';
import useEmployeeFormDrawer, { DEPARTMENTS, STATUSES } from './useEmployeeFormDrawer';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import ErrorBanner from '../../components/common/ErrorBanner';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { X, Save } from 'lucide-react';

const EmployeeFormDrawer = (props) => {
  const {
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
  } = useEmployeeFormDrawer(props);

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
          aria-label={isEditMode ? 'Edit Employee' : 'Add New Employee'}
          className={`w-screen max-w-2xl bg-white shadow-2xl flex flex-col pointer-events-auto transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isAnimating ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="bg-[#121214] text-white px-6 py-4 flex items-center justify-between border-b border-gray-800 shrink-0">
            <div>
              <h2 className="text-lg font-bold tracking-wide">
                {isEditMode ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Fill in employee information and department assignments.
              </p>
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

          {/* Body Form */}
          {loading ? (
            <div className="flex-1 flex flex-col justify-center p-8 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Loading employee profile...
                </div>
                <SkeletonLoader lines={5} lineClassName="h-4" gap="gap-3" />
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col justify-between overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="EMPLOYEE ID *"
                    name="employeeId"
                    placeholder="e.g. EMP-115"
                    value={formData.employeeId}
                    onChange={handleChange}
                    error={errors.employeeId}
                    required
                  />

                  <FormInput
                    label="FULL NAME *"
                    name="fullName"
                    placeholder="Enter Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    required
                  />

                  <FormInput
                    label="EMAIL ADDRESS (UNIQUE) *"
                    name="email"
                    type="email"
                    placeholder="employee@rootsmedia.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                  />

                  <FormInput
                    label="PHONE NUMBER *"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    required
                  />

                  <FormSelect
                    label="DEPARTMENT *"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    options={DEPARTMENTS}
                    required
                  />

                  <FormInput
                    label="ROLE / TITLE *"
                    name="role"
                    placeholder="e.g. Frontend Engineer"
                    value={formData.role}
                    onChange={handleChange}
                    error={errors.role}
                    required
                  />

                  <FormInput
                    label="JOINING DATE *"
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    error={errors.joiningDate}
                    required
                  />

                  <FormSelect
                    label="STATUS *"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={STATUSES}
                    required
                  />
                </div>

                {/* Conditional Leave Window */}
                {formData.status === 'On Leave' && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-lg space-y-3">
                    <p className="text-xs font-semibold text-amber-800">
                      Specify the leave schedule window (tasks cannot start during this window):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="LEAVE START DATE *"
                        name="leaveStartDate"
                        type="date"
                        value={formData.leaveStartDate}
                        onChange={handleChange}
                        error={errors.leaveStartDate}
                        required
                      />

                      <FormInput
                        label="LEAVE END DATE *"
                        name="leaveEndDate"
                        type="date"
                        value={formData.leaveEndDate}
                        onChange={handleChange}
                        error={errors.leaveEndDate}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Skills */}
                <div>
                  <FormInput
                    label="SKILLS (COMMA SEPARATED)"
                    name="skills"
                    placeholder="e.g. React, Node.js, Express, MongoDB, TypeScript"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Separate distinct skills with commas.
                  </p>
                </div>

                {/* Server Error Banner */}
                <ErrorBanner message={serverError} />
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  <Save className="w-4 h-4" />
                  <span>{isEditMode ? 'Update Employee' : 'Create Employee'}</span>
                </button>
              </div>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
};

export default EmployeeFormDrawer;
