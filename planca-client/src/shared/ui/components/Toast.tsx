import { FC, ReactNode, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

/**
 * Modern Toast notification component
 */
const Toast: FC<ToastProps> = ({ 
  id, 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  
  // Mount with animation
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Setup auto-close and progress bar
  useEffect(() => {
    if (duration && duration > 0) {
      const startTime = Date.now();
      const endTime = startTime + duration;
      
      // Update progress bar
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(endTime - now, 0);
        const percent = (remaining / duration) * 100;
        
        setProgress(percent);
        
        if (percent <= 0) {
          handleClose();
        }
      }, 16); // ~60fps
      
      setIntervalId(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [duration]);
  
  // Handle close with animation
  const handleClose = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    setIsVisible(false);
    
    // Wait for animation to complete
    setTimeout(() => {
      onClose(id);
    }, 300);
  };
  
  // Toast type styles
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      icon: 'text-green-500',
      progress: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      icon: 'text-red-500',
      progress: 'bg-red-500'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      icon: 'text-yellow-500',
      progress: 'bg-yellow-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      icon: 'text-blue-500',
      progress: 'bg-blue-500'
    }
  };
  
  const typeStyle = styles[type];
  
  // Render toast icon based on type
  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className={`${typeStyle.icon} h-5 w-5`} />;
      case 'error':
        return <FaExclamationCircle className={`${typeStyle.icon} h-5 w-5`} />;
      case 'warning':
        return <FaExclamationTriangle className={`${typeStyle.icon} h-5 w-5`} />;
      case 'info':
        return <FaInfoCircle className={`${typeStyle.icon} h-5 w-5`} />;
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`max-w-md w-full ${typeStyle.bg} ${typeStyle.border} border-l-4 shadow-lg rounded-r-lg pointer-events-auto 
        flex overflow-hidden transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-1 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {renderIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`${typeStyle.bg} rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'info' ? 'blue' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'red'}-500`}
              onClick={() => handleClose()}
            >
              <span className="sr-only">Close</span>
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-200 absolute bottom-0 left-0">
        <div 
          className={`h-full ${typeStyle.progress} transition-all duration-300 ease-linear`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

// ToastContainer component for positioning
export const ToastContainer: FC<{
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}> = ({ 
  children,
  position = 'top-right' 
}) => {
  // Determine position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };
  
  return createPortal(
    <div 
      className={`fixed z-50 flex flex-col space-y-2 overflow-hidden ${positionClasses[position]}`}
    >
      {children}
    </div>,
    document.body
  );
};

export default Toast;