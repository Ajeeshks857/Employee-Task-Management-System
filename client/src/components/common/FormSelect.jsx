import React from 'react';

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  required = false,
  error = '',
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="form-control-label">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`form-control-select ${error ? '!border-rose-500 !focus:ring-rose-500' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {optLabel}
            </option>
          );
        })}
      </select>
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
};

export default FormSelect;
