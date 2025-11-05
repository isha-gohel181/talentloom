import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { votePost } from '../../redux/slice/post.slice';
import { voteReply } from '../../redux/slice/reply.slice';

const VoteButton = ({
  itemId,
  itemType = 'post', // 'post' or 'reply'
  initialVotes = 0,
  userVote = null, // 1 for upvote, -1 for downvote, null for no vote
  size = 'medium',
  orientation = 'vertical', // 'vertical' or 'horizontal'
  className = ''
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [isVoting, setIsVoting] = useState(false);
  const [currentVotes, setCurrentVotes] = useState(initialVotes);
  const [currentUserVote, setCurrentUserVote] = useState(userVote);

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
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
      const voteDiff = calculateVoteDiff(currentUserVote, newVote);
      setCurrentVotes(prev => prev + voteDiff);
      setCurrentUserVote(newVote);

      // Dispatch appropriate action
      if (itemType === 'post') {
        await dispatch(votePost({ postId: itemId, vote: newVote })).unwrap();
      } else if (itemType === 'reply') {
        await dispatch(voteReply({ replyId: itemId, vote: newVote })).unwrap();
      }
    } catch (error) {
      // Revert optimistic update on error
      const voteDiff = calculateVoteDiff(currentUserVote, userVote);
      setCurrentVotes(prev => prev - voteDiff);
      setCurrentUserVote(userVote);
      console.error('Voting failed:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const calculateVoteDiff = (oldVote, newVote) => {
    if (oldVote === newVote) return 0;
    if (oldVote === null && newVote !== null) return newVote;
    if (oldVote !== null && newVote === null) return -oldVote;
    if (oldVote !== null && newVote !== null) return newVote - oldVote;
    return 0;
  };

  const getVoteColor = (voteType) => {
    if (currentUserVote === voteType) {
      return voteType === 1 ? 'text-orange-500' : 'text-blue-500';
    }
    return 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300';
  };

  const getButtonClasses = (voteType) => {
    const baseClasses = `${sizeClasses[size]} flex items-center justify-center rounded transition-colors duration-200`;
    const colorClasses = getVoteColor(voteType);
    return `${baseClasses} ${colorClasses} ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'}`;
  };

  if (orientation === 'horizontal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={() => handleVote(1)}
          className={getButtonClasses(1)}
          disabled={isVoting}
          title="Upvote"
        >
          ↑
        </button>
        <span className={`${textSizeClasses[size]} font-semibold text-gray-700 dark:text-gray-300 min-w-8 text-center`}>
          {currentVotes}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={getButtonClasses(-1)}
          disabled={isVoting}
          title="Downvote"
        >
          ↓
        </button>
      </div>
    );
  }

  // Vertical orientation (default)
  return (
    <div className={`flex flex-col items-center space-y-1 ${className}`}>
      <button
        onClick={() => handleVote(1)}
        className={getButtonClasses(1)}
        disabled={isVoting}
        title="Upvote"
      >
        ↑
      </button>
      <span className={`${textSizeClasses[size]} font-semibold text-gray-700 dark:text-gray-300 min-w-8 text-center`}>
        {currentVotes}
      </span>
      <button
        onClick={() => handleVote(-1)}
        className={getButtonClasses(-1)}
        disabled={isVoting}
        title="Downvote"
      >
        ↓
      </button>
    </div>
  );
};

export default VoteButton;