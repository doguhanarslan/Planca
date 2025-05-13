import React from 'react';
import {
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaTimes
} from 'react-icons/fa';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Alert component for feedback messages
 * 
 * @example
 * <Alert 
 *   type="success" 
 *   message="Operation completed successfully!" 
 *   dismissible={true}
 *   onDismiss={() => console.log('dismissed')}
 * />
 */
const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  dismissible = false,
  onDismiss,
  className = '',
  icon
}) => {
  // Auto-detect icon based on type if not provided
  const defaultIcon = () => {
    switch (type) {
      case 'info':
        return <FaInfoCircle size={20} />;
      case 'success':
        return <FaCheckCircle size={20} />;
      case 'warning':
        return <FaExclamationTriangle size={20} />;
      case 'error':
        return <FaExclamationCircle size={20} />;
      default:
        return <FaInfoCircle size={20} />;
    }
  };

  // Styles based on type
  const styles = {
    info: {
      container: 'bg-blue-50',
      icon: 'text-blue-400',
      border: 'border-l-4 border-blue-400',
      text: 'text-blue-800',
      ring: 'focus:ring-blue-500',
      button: 'hover:bg-blue-100',
    },
    success: {
      container: 'bg-green-50',
      icon: 'text-green-400',
      border: 'border-l-4 border-green-400',
      text: 'text-green-800',
      ring: 'focus:ring-green-500',
      button: 'hover:bg-green-100',
    },
    warning: {
      container: 'bg-yellow-50',
      icon: 'text-yellow-400',
      border: 'border-l-4 border-yellow-400',
      text: 'text-yellow-800',
      ring: 'focus:ring-yellow-500',
      button: 'hover:bg-yellow-100',
    },
    error: {
      container: 'bg-red-50',
      icon: 'text-red-400',
      border: 'border-l-4 border-red-400',
      text: 'text-red-800',
      ring: 'focus:ring-red-500',
      button: 'hover:bg-red-100',
    },
  };

  return (
    <div
      className={`${styles[type].container} ${styles[type].border} p-4 rounded-md ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles[type].icon}`}>
          {icon || defaultIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${styles[type].text}`}>{message}</p>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 ${styles[type].icon} ${styles[type].button} ${styles[type].ring} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={onDismiss}
                aria-label="Dismiss"
              >
                <span className="sr-only">Dismiss</span>
                <FaTimes />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;