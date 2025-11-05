import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReply } from '../../redux/slice/reply.slice';
import Loader from './Loader';

const ReplyForm = ({
  postId,
  parentReplyId = null, // For nested replies
  onCancel = null,
  onSuccess = null,
  placeholder = "Write your reply...",
  className = ''
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('Please login to reply');
      return;
    }

    if (!content.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    if (content.length > 10000) {
      setError('Reply is too long (maximum 10000 characters)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const replyData = {
        content: content.trim(),
        ...(parentReplyId && { parentReplyId })
      };

      await dispatch(createReply({ postId, replyData })).unwrap();

      setContent('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error.message || 'Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setError('');
    if (onCancel) {
      onCancel();
    }
  };

  if (!user) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Please <a href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">login</a> to reply to this post.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
      <form onSubmit={handleSubmit}>
        {/* User info */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (user.name || user.username || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {user.name || user.username}
            </p>
            {parentReplyId && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Replying to thread
              </p>
            )}
          </div>
        </div>

        {/* Text area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-y min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          disabled={isSubmitting}
          maxLength={10000}
        />

        {/* Character count */}
        <div className="flex justify-between items-center mt-2 mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {content.length}/10000 characters
          </span>
          {content.length > 9000 && (
            <span className="text-xs text-orange-600 dark:text-orange-400">
              {10000 - content.length} remaining
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
          >
            {isSubmitting && <Loader size="small" type="spinner" />}
            <span>{isSubmitting ? 'Posting...' : 'Post Reply'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyForm;