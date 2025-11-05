import React from 'react';

const Loader = ({ size = 'medium', type = 'spinner', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div
          className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin`}
        ></div>
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}></div>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin`}
      ></div>
    </div>
  );
};

// Skeleton loader for content
export const SkeletonLoader = ({ className = '', lines = 3 }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="flex space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Card skeleton for posts
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div>
            <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
            <div className="w-16 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
        <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>

      {/* Title skeleton */}
      <div className="w-3/4 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>

      {/* Content skeleton */}
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-2/3 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>

      {/* Tags skeleton */}
      <div className="flex space-x-2 mb-4">
        <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-14 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

// Page loader overlay
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-center">
        <Loader size="large" className="mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default Loader;