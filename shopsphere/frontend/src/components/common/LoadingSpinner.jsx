import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600`}
      />
    </div>
  );
};

export const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

export default LoadingSpinner;
