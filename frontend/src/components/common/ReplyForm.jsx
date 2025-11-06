import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReply } from '../../redux/slice/reply.slice';
import { MessageCircle, Reply as ReplyIcon } from 'lucide-react';
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
      <Card className={`${className} border-dashed border-2 border-muted-foreground/20 bg-muted/10`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3 text-muted-foreground">
            <MessageCircle className="w-5 h-5" />
            <p className="text-center">
              Please <a href="/login" className="text-primary hover:underline font-medium">login</a> to reply to this post.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} shadow-sm border-l-4 border-l-primary/20`}>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          {/* Header with reply indicator */}
          <div className="flex items-center space-x-2 mb-4">
            <ReplyIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {parentReplyId ? 'Write a reply' : 'Write an answer'}
            </span>
          </div>

          {/* User info */}
          <div className="flex items-center space-x-3 mb-3 p-3 bg-muted/30 rounded-lg">
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
                <p className="text-xs text-muted-foreground flex items-center space-x-1">
                  <ReplyIcon className="w-3 h-3" />
                  <span>Replying to thread</span>
                </p>
              )}
            </div>
          </div>

          {/* Text area */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[120px] resize-y border-2 focus:border-primary/50 transition-colors"
            disabled={isSubmitting}
            maxLength={10000}
          />

          {/* Character count and formatting help */}
          <div className="flex justify-between items-center mt-2 mb-3">
            <div className="flex items-center space-x-4">
              <span className="text-xs text-muted-foreground">
                {content.length}/10000 characters
              </span>
              {content.length > 9000 && (
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  {10000 - content.length} remaining
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Markdown supported
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm flex items-center space-x-2">
                <span className="w-2 h-2 bg-destructive rounded-full"></span>
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {parentReplyId ? 'Your reply will be nested under the parent comment' : 'Your answer will help others learn'}
            </div>
            <div className="flex items-center space-x-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="min-w-[100px]"
              >
                {isSubmitting && <Loader size="small" type="spinner" className="mr-2" />}
                <span>{isSubmitting ? 'Posting...' : (parentReplyId ? 'Reply' : 'Post Answer')}</span>
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReplyForm;