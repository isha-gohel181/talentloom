import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import VoteButton from '../common/VoteButton';
import UserBadge from '../common/UserBadge';
import ReplyForm from '../common/ReplyForm';
import { formatDate } from '../../utils/formatDate';
import { deleteReply } from '../../redux/slice/reply.slice';

const ReplyCard = ({
  reply,
  postId,
  isAccepted = false,
  depth = 0,
  maxDepth = 3,
  onReplySuccess = null,
  className = ''
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    if (onReplySuccess) {
      onReplySuccess();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteReply(reply._id)).unwrap();
    } catch (error) {
      alert('Failed to delete reply');
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = user && (user._id === reply.author._id || user.role === 'admin' || user.role === 'moderator');
  const canReply = depth < maxDepth;

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''} ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        {/* Accepted answer indicator */}
        {isAccepted && (
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-green-700 dark:text-green-400 font-medium text-sm">
              Accepted Answer
            </span>
          </div>
        )}

        {/* Header with user info and timestamp */}
        <div className="flex items-start justify-between mb-3">
          <UserBadge
            user={reply.author}
            size="small"
            showRole={true}
            showReputation={true}
            showJoinDate={false}
          />
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatDate(reply.createdAt)}</span>
            {reply.updatedAt !== reply.createdAt && (
              <span>(edited {formatDate(reply.updatedAt)})</span>
            )}
          </div>
        </div>

        {/* Reply content */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
          <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
            {reply.content}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Voting */}
            <VoteButton
              itemId={reply._id}
              itemType="reply"
              initialVotes={reply.votes || 0}
              userVote={reply.userVote}
              size="small"
              orientation="horizontal"
            />

            {/* Reply button */}
            {canReply && (
              <button
                onClick={handleReply}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
              >
                Reply
              </button>
            )}

            {/* Edit button (if author) */}
            {user && user._id === reply.author._id && (
              <button
                onClick={() => {/* TODO: Implement edit functionality */}}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
              >
                Edit
              </button>
            )}

            {/* Delete button */}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          {/* Share link */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/post/${postId}#reply-${reply._id}`);
              alert('Link copied to clipboard');
            }}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
          >
            Share
          </button>
        </div>

        {/* Nested reply form */}
        {showReplyForm && (
          <div className="mt-4">
            <ReplyForm
              postId={postId}
              parentReplyId={reply._id}
              onSuccess={handleReplySuccess}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Write your reply..."
            />
          </div>
        )}

        {/* Nested replies */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {reply.replies.map((nestedReply) => (
              <ReplyCard
                key={nestedReply._id}
                reply={nestedReply}
                postId={postId}
                depth={depth + 1}
                maxDepth={maxDepth}
                onReplySuccess={onReplySuccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyCard;