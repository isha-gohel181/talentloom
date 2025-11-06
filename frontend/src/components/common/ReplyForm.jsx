import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReply } from '../../redux/slice/reply.slice';
import Loader from './Loader';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
        ...(parentReplyId && { parentReply: parentReplyId })
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
      <Card className={className}>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-center">
            Please <a href="/login" className="text-primary hover:underline">login</a> to reply to this post.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
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
              <p className="font-medium text-foreground text-sm">
                {user.name || user.username}
              </p>
              {parentReplyId && (
                <p className="text-xs text-muted-foreground">
                  Replying to thread
                </p>
              )}
            </div>
          </div>

          {/* Text area */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px] resize-y"
            disabled={isSubmitting}
            maxLength={10000}
          />

          {/* Character count */}
          <div className="flex justify-between items-center mt-2 mb-3">
            <span className="text-xs text-muted-foreground">
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
            <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting && <Loader size="small" type="spinner" className="mr-2" />}
              <span>{isSubmitting ? 'Posting...' : 'Post Reply'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReplyForm;