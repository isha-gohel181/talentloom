import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { votePost } from '../../redux/slice/post.slice';
import { voteReply } from '../../redux/slice/reply.slice';

const VoteButton = ({
  itemId,
  itemType = 'post', // 'post' or 'reply'
  initialUpvotes = 0,
  initialDownvotes = 0,
  userVote = null, // 1 for upvote, -1 for downvote, null for no vote
  size = 'medium',
  orientation = 'horizontal', // 'horizontal' or 'vertical'
  className = ''
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [isVoting, setIsVoting] = useState(false);
  const [currentUpvotes, setCurrentUpvotes] = useState(initialUpvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(initialDownvotes);
  const [currentUserVote, setCurrentUserVote] = useState(userVote);

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const handleVote = async (voteType) => {
    if (!user) {
      // Handle unauthenticated user - could show login modal
      alert('Please login to vote');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);

    try {
      const newVote = currentUserVote === voteType ? null : voteType; // Toggle vote

      // Optimistic update
      const { upvotes: newUpvotes, downvotes: newDownvotes } = calculateNewVotes(currentUserVote, newVote, currentUpvotes, currentDownvotes);
      setCurrentUpvotes(newUpvotes);
      setCurrentDownvotes(newDownvotes);
      setCurrentUserVote(newVote);

      // Dispatch appropriate action
      if (itemType === 'post') {
        await dispatch(votePost({ postId: itemId, vote: newVote })).unwrap();
      } else if (itemType === 'reply') {
        await dispatch(voteReply({ replyId: itemId, vote: newVote })).unwrap();
      }
    } catch (error) {
      // Revert optimistic update on error
      const { upvotes: revertUpvotes, downvotes: revertDownvotes } = calculateNewVotes(currentUserVote, userVote, currentUpvotes, currentDownvotes);
      setCurrentUpvotes(revertUpvotes);
      setCurrentDownvotes(revertDownvotes);
      setCurrentUserVote(userVote);
      console.error('Voting failed:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const calculateNewVotes = (oldVote, newVote, currentUp, currentDown) => {
    let upvotes = currentUp;
    let downvotes = currentDown;

    // Remove old vote
    if (oldVote === 1) upvotes--;
    else if (oldVote === -1) downvotes--;

    // Add new vote
    if (newVote === 1) upvotes++;
    else if (newVote === -1) downvotes++;

    return { upvotes, downvotes };
  };

  const getVoteButtonClasses = (voteType) => {
    const baseClasses = `${sizeClasses[size]} transition-all duration-200 rounded-full p-1`;
    const isActive = currentUserVote === voteType;
    const hoverClasses = isVoting
      ? 'cursor-not-allowed opacity-50'
      : 'cursor-pointer hover:bg-muted hover:scale-110';

    if (isActive) {
      return `${baseClasses} ${hoverClasses} text-white`;
    }

    return `${baseClasses} ${hoverClasses} text-muted-foreground hover:text-foreground`;
  };

  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col items-center space-y-1 ${className}`}>
        <button
          onClick={() => handleVote(1)}
          className={getVoteButtonClasses(1)}
          disabled={isVoting}
          title="Upvote"
        >
          <ThumbsUp className={`${sizeClasses[size]} ${currentUserVote === 1 ? 'fill-current' : ''}`} />
        </button>
        <span className={`${textSizeClasses[size]} font-semibold text-foreground`}>
          {formatCount(currentUpvotes)}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={getVoteButtonClasses(-1)}
          disabled={isVoting}
          title="Downvote"
        >
          <ThumbsDown className={`${sizeClasses[size]} ${currentUserVote === -1 ? 'fill-current' : ''}`} />
        </button>
        <span className={`${textSizeClasses[size]} font-semibold text-foreground`}>
          {formatCount(currentDownvotes)}
        </span>
      </div>
    );
  }

  // Horizontal orientation (default)
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <button
        onClick={() => handleVote(1)}
        className={getVoteButtonClasses(1)}
        disabled={isVoting}
        title="Upvote"
      >
        <ThumbsUp className={`${sizeClasses[size]} ${currentUserVote === 1 ? 'fill-current' : ''}`} />
      </button>
      <span className={`${textSizeClasses[size]} font-semibold text-foreground min-w-[2ch] text-center`}>
        {formatCount(currentUpvotes)}
      </span>
      <button
        onClick={() => handleVote(-1)}
        className={getVoteButtonClasses(-1)}
        disabled={isVoting}
        title="Downvote"
      >
        <ThumbsDown className={`${sizeClasses[size]} ${currentUserVote === -1 ? 'fill-current' : ''}`} />
      </button>
      <span className={`${textSizeClasses[size]} font-semibold text-foreground min-w-[2ch] text-center`}>
        {formatCount(currentDownvotes)}
      </span>
    </div>
  );
};

export default VoteButton;