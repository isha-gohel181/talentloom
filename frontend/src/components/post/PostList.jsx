import React from 'react';
import PostCard from './PostCard';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const PostList = ({ posts, loading, error }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="w-24 h-4 mb-1" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                </div>
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="w-3/4 h-6 mb-2" />
              <div className="space-y-2 mb-4">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-2/3 h-4" />
              </div>
              <div className="flex space-x-2 mb-4">
                <Skeleton className="w-12 h-6 rounded" />
                <Skeleton className="w-16 h-6 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Failed to load posts
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No posts found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Be the first to ask a question and start a discussion!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostList;