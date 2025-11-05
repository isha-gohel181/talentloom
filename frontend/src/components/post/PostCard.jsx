import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  if (!post) return null;

  const {
    _id,
    title,
    content,
    author,
    category,
    tags,
    upvotes = [],
    downvotes = [],
    views = 0,
    createdAt,
    isAnswered = false,
    voteScore = 0
  } = post;

  // Simple time ago calculation
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const timeAgo = getTimeAgo(createdAt);
  const previewContent = content?.length > 200 ? content.substring(0, 200) + '...' : content;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {author?.avatar?.secure_url ? (
            <img
              src={author.avatar.secure_url}
              alt={author.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {author?.fullName?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {author?.fullName || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center space-x-2">
          {isAnswered && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              ✓ Answered
            </span>
          )}
          {category && category !== 'general' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {category}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <Link to={`/posts/${_id}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
          {title}
        </h3>
      </Link>

      {/* Content Preview */}
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
        {previewContent}
      </p>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            >
              #{tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {/* Votes */}
          <div className="flex items-center space-x-1">
            <span className={`text-sm font-medium ${
              voteScore > 0 ? 'text-green-600 dark:text-green-400' :
              voteScore < 0 ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {voteScore}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              votes
            </span>
          </div>

          {/* Views */}
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{views} views</span>
          </div>
        </div>

        {/* Actions */}
        <Link
          to={`/posts/${_id}`}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
        >
          Read more →
        </Link>
      </div>
    </div>
  );
};

export default PostCard;