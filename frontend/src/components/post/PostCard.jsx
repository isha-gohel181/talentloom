import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VoteButton from '../common/VoteButton';

const PostCard = ({ post, showFullContent = false, showActions = false }) => {
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
    voteScore = 0,
    replyCount = 0,
    media
  } = post;

  // Determine user's current vote (only if upvotes/downvotes are populated with user objects)
  const getUserVote = () => {
    // This would require user context, for now assume no vote for list view
    // In detailed view, we can check if user._id is in upvotes/downvotes arrays
    return null;
  };

  const userVote = getUserVote();

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
  const displayContent = showFullContent ? content : (content?.length > 200 ? content.substring(0, 200) + '...' : content);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={author?.avatar?.secure_url} alt={author.fullName} />
              <AvatarFallback>{author?.fullName?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">
                {author?.fullName || 'Anonymous'}
              </p>
              <p className="text-xs text-muted-foreground">
                {timeAgo}
              </p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center space-x-2">
            {isAnswered && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ Answered
              </Badge>
            )}
            {category && category !== 'general' && (
              <Badge variant="outline">
                {category}
              </Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/post/${_id}`}>
          <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent>
        {/* Content Display */}
        <p className={`text-muted-foreground text-sm mb-4 ${!showFullContent ? 'line-clamp-3' : ''}`}>
          {displayContent}
        </p>

        {/* Media/Image Display */}
        {media && media.secure_url && (
          <div className="mb-4">
            <img
              src={media.secure_url}
              alt="Post attachment"
              className={`w-full rounded-lg border border-gray-200 dark:border-gray-700 ${showFullContent ? 'max-h-none' : 'max-h-64 object-cover'}`}
            />
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary">
                #{tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        {/* Footer */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            {/* Voting */}
            <VoteButton
              itemId={_id}
              itemType="post"
              initialUpvotes={Array.isArray(upvotes) ? upvotes.length : upvotes}
              initialDownvotes={Array.isArray(downvotes) ? downvotes.length : downvotes}
              userVote={userVote}
              size="small"
              orientation="horizontal"
            />

            {/* Comments */}
            <Link
              to={`/post/${_id}`}
              className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{replyCount || 0}</span>
            </Link>

            {/* Views */}
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>{views} views</span>
            </div>
          </div>

          {/* Actions */}
          <Link
            to={`/post/${_id}`}
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            Read more →
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;