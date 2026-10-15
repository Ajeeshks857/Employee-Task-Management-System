import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const Notification = ({ notification, onClose }) => {
  if (!notification || !notification.message) return null;

  const { type = 'info', message } = notification;

  const getVariantStyles = () => {
    switch (type) {
      case 'success':
        return {
          wrapper: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          closeBtn: 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100',
        };
      case 'error':
        return {
          wrapper: 'bg-rose-50 border-rose-200 text-rose-900',
          icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          closeBtn: 'text-rose-500 hover:text-rose-700 hover:bg-rose-100',
        };
      case 'warning':
        return {
          wrapper: 'bg-amber-50 border-amber-200 text-amber-900',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          closeBtn: 'text-amber-500 hover:text-amber-700 hover:bg-amber-100',
        };
      case 'info':
      default:
        return {
          wrapper: 'bg-sky-50 border-sky-200 text-sky-900',
          icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
          closeBtn: 'text-sky-500 hover:text-sky-700 hover:bg-sky-100',
        };
    }
  };

  const { wrapper, icon, closeBtn } = getVariantStyles();

  const toastContent = (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-5 right-5 z-50 max-w-md w-full sm:w-auto min-w-[320px] transition-all duration-300"
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-xs ${wrapper}`}
      >
        <div className="pt-0.5">{icon}</div>
        <div className="flex-1 text-sm font-medium leading-relaxed pr-2">{message}</div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className={`p-1 rounded-lg transition-colors ${closeBtn}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return createPortal(toastContent, document.body);
};

export default Notification;
