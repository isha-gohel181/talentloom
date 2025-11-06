import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';
import VoteButton from '../common/VoteButton';
import UserBadge from '../common/UserBadge';
import ReplyForm from '../common/ReplyForm';
import { formatDate } from '../../utils/formatDate';
import { deleteReply, updateReply } from '../../redux/slice/reply.slice';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState('');
  const [showNestedReplies, setShowNestedReplies] = useState(true);

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
      if (onReplySuccess) {
        onReplySuccess();
      }
    } catch (error) {
      alert('Failed to delete reply');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(reply.content);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(reply.content);
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setEditError('Reply cannot be empty');
      return;
    }

    if (editContent.trim() === reply.content.trim()) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    setEditError('');

    try {
      await dispatch(updateReply({ 
        replyId: reply._id, 
        content: editContent.trim() 
      })).unwrap();
      
      setIsEditing(false);
      if (onReplySuccess) {
        onReplySuccess();
      }
    } catch (error) {
      setEditError(error || 'Failed to update reply');
    } finally {
      setIsUpdating(false);
    }
  };

  const canDelete = user && (user._id === reply.author._id || user.role === 'admin' || user.role === 'moderator');
  const canEdit = user && user._id === reply.author._id;
  const canReply = depth < maxDepth;
  const hasNestedReplies = reply.replies && reply.replies.length > 0;

  // Color schemes for different nesting levels
  const getNestingStyles = (depth) => {
    const colors = [
      {
        border: 'border-l-blue-200 dark:border-l-blue-800',
        bg: 'bg-blue-50/30 dark:bg-blue-950/20',
        accent: 'text-blue-600 dark:text-blue-400'
      },
      {
        border: 'border-l-green-200 dark:border-l-green-800',
        bg: 'bg-green-50/30 dark:bg-green-950/20',
        accent: 'text-green-600 dark:text-green-400'
      },
      {
        border: 'border-l-purple-200 dark:border-l-purple-800',
        bg: 'bg-purple-50/30 dark:bg-purple-950/20',
        accent: 'text-purple-600 dark:text-purple-400'
      }
    ];
    return colors[depth % colors.length];
  };

  const nestingStyles = depth > 0 ? getNestingStyles(depth - 1) : null;

  return (
    <div className={`${depth > 0 ? `ml-8 relative` : ''} ${className}`}>
      {/* Threading line for nested replies */}
      {depth > 0 && (
        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${nestingStyles.border} rounded-full`} />
      )}

      <Card className={`shadow-sm transition-all duration-200 hover:shadow-md ${
        depth > 0 ? `${nestingStyles.bg} border-l-4 ${nestingStyles.border}` : ''
      }`}>
        <CardContent className="p-4">
          {/* Accepted answer indicator */}
          {isAccepted && (
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700 dark:text-green-400 font-medium text-sm">
                  Accepted Answer
                </span>
              </div>
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
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{formatDate(reply.createdAt)}</span>
              {reply.updatedAt !== reply.createdAt && (
                <span className={`${nestingStyles?.accent || 'text-muted-foreground'}`}>
                  (edited {formatDate(reply.updatedAt)})
                </span>
              )}
            </div>
          </div>

          {/* Reply content */}
          {isEditing ? (
            <div className="mb-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] resize-y"
                disabled={isUpdating}
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {editContent.length}/2000 characters
                </span>
              </div>
              {editError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm">{editError}</p>
                </div>
              )}
              <div className="flex items-center justify-end space-x-2 mt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isUpdating || !editContent.trim()}
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
              <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                {reply.content}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center space-x-4">
              {/* Voting */}
              <VoteButton
                itemId={reply._id}
                itemType="reply"
                initialUpvotes={Array.isArray(reply.upvotes) ? reply.upvotes.length : reply.upvotes || 0}
                initialDownvotes={Array.isArray(reply.downvotes) ? reply.downvotes.length : reply.downvotes || 0}
                userVote={reply.userVote}
                size="small"
                orientation="horizontal"
              />

              {/* Reply button */}
              {canReply && (
                <button
                  onClick={handleReply}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}

              {/* Edit button (if author) */}
              {canEdit && !isEditing && (
                <button
                  onClick={handleEditClick}
                  className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
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

            {/* Share link and collapse/expand */}
            <div className="flex items-center space-x-2">
              {hasNestedReplies && (
                <button
                  onClick={() => setShowNestedReplies(!showNestedReplies)}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                  title={showNestedReplies ? 'Collapse replies' : 'Expand replies'}
                >
                  {showNestedReplies ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {reply.replies.length} {reply.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </button>
              )}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/post/${postId}#reply-${reply._id}`);
                  alert('Link copied to clipboard');
                }}
                className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              >
                Share
              </button>
            </div>
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
          {hasNestedReplies && showNestedReplies && (
            <div className="mt-6 space-y-4">
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

          {/* Collapsed replies indicator */}
          {hasNestedReplies && !showNestedReplies && (
            <div className="mt-4">
              <button
                onClick={() => setShowNestedReplies(true)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                <span>Show {reply.replies.length} {reply.replies.length === 1 ? 'reply' : 'replies'}</span>
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReplyCard;