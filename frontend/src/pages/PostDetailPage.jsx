import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PostCard from '../components/post/PostCard';
import ReplyCard from '../components/reply/ReplyCard';
import ReplyForm from '../components/common/ReplyForm';
import Loader, { CardSkeleton } from '../components/common/Loader';
import { getPostById, acceptReply, getRepliesByPostId } from '../redux/slice/post.slice';

const PostDetailPage = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { currentPost, loading: postLoading } = useSelector(state => state.posts);
  const { user } = useSelector(state => state.user);

  const [sortBy, setSortBy] = useState('votes'); // 'votes', 'newest', 'oldest'
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    if (postId) {
      dispatch(getPostById(postId));
      dispatch(getRepliesByPostId(postId));
    }
  }, [postId, dispatch]);

  const handleAcceptReply = async (replyId) => {
    try {
      await dispatch(acceptReply({ postId, replyId })).unwrap();
    } catch (error) {
      alert('Failed to accept reply');
    }
  };

  const sortReplies = (replies) => {
    const sorted = [...replies];
    switch (sortBy) {
      case 'votes':
        return sorted.sort((a, b) => (b.votes || 0) - (a.votes || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return sorted;
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    // Refresh replies
    dispatch(getRepliesByPostId(postId));
  };

  if (postLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <CardSkeleton className="mb-8" />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Post not found
          </h1>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const sortedReplies = sortReplies(currentPost?.replies || []);
  const acceptedReply = sortedReplies.find(reply => reply.isAccepted);
  const otherReplies = sortedReplies.filter(reply => !reply.isAccepted);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
        >
          Home
        </Link>
        <span className="text-gray-500 dark:text-gray-400 mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100 text-sm">
          {currentPost.title}
        </span>
      </nav>

      {/* Post */}
      <div className="mb-8">
        <PostCard
          post={currentPost}
          showFullContent={true}
          showActions={true}
        />
      </div>

      {/* Reply section header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {currentPost?.replies?.length || 0} Answers
          </h2>

          {/* Sort options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="votes">Most votes</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Add answer button */}
        {!showReplyForm && (
          <button
            onClick={() => setShowReplyForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            Answer this question
          </button>
        )}
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="mb-8">
          <ReplyForm
            postId={postId}
            onSuccess={handleReplySuccess}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Write your answer..."
          />
        </div>
      )}

      {/* Accepted answer */}
      {acceptedReply && (
        <div className="mb-6">
          <ReplyCard
            reply={acceptedReply}
            postId={postId}
            isAccepted={true}
            onReplySuccess={handleReplySuccess}
          />
        </div>
      )}

      {/* Other replies */}
      <div className="space-y-6">
        {postLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : otherReplies.length > 0 ? (
          otherReplies.map((reply) => (
            <ReplyCard
              key={reply._id}
              reply={reply}
              postId={postId}
              onReplySuccess={handleReplySuccess}
            />
          ))
        ) : !acceptedReply && !showReplyForm ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No answers yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Be the first to answer this question!
            </p>
          </div>
        ) : null}
      </div>

      {/* Related questions section could go here */}
    </div>
  );
};

export default PostDetailPage;