import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PostCard from '../components/post/PostCard';
import ReplyCard from '../components/reply/ReplyCard';
import ReplyForm from '../components/common/ReplyForm';
import Loader, { CardSkeleton } from '../components/common/Loader';
import { getPostById, acceptReply, getRepliesByPostId } from '../redux/slice/post.slice';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <h1 className="text-2xl font-bold text-foreground mb-4">
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
          className="text-primary hover:text-primary/80 text-sm"
        >
          Home
        </Link>
        <span className="text-muted-foreground mx-2">/</span>
        <span className="text-foreground text-sm">
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
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {currentPost?.replies?.length || 0} Answers
            </CardTitle>

            {/* Sort options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="votes">Most votes</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add answer button */}
          {!showReplyForm && (
            <Button
              onClick={() => setShowReplyForm(true)}
              className="w-full"
            >
              Answer this question
            </Button>
          )}
        </CardContent>
      </Card>

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
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No answers yet
            </h3>
            <p className="text-muted-foreground mb-4">
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