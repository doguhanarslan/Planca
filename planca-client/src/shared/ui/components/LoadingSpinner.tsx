import { FC } from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  fullPage?: boolean;
  text?: string;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'red-500',
  className = '',
  fullPage = false,
  text
}) => {
  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-2 border-t-transparent border-${color} rounded-full animate-spin`}
        aria-hidden="true"
      ></div>
      {text && <p className={`mt-2 text-sm text-gray-600 font-medium`}>{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner; 