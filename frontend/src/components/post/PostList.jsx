import React from 'react';
import PostCard from './PostCard';

const PostList = ({ posts, loading, error }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
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
            <div className="w-3/4 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="space-y-2 mb-4">
              <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="w-2/3 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="flex space-x-2 mb-4">
              <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Failed to load posts
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No posts found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Be the first to ask a question and start a discussion!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostList;