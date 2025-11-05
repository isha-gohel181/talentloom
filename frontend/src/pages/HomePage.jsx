import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAllPosts, clearError } from '../redux/slice/post.slice';
import { selectIsAuthenticated } from '../redux/slice/user.slice';
import PostList from '../components/post/PostList';

const HomePage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    posts,
    loading: { posts: loading },
    error: { posts: error },
    pagination,
    filters
  } = useSelector(state => state.posts);

  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    sortBy: searchParams.get('sortBy') || 'latest',
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || ''
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (localFilters.sortBy !== 'latest') params.set('sortBy', localFilters.sortBy);
    if (localFilters.category !== 'all') params.set('category', localFilters.category);
    if (localFilters.search) params.set('search', localFilters.search);

    setSearchParams(params, { replace: true });
  }, [localFilters, setSearchParams]);

  // Fetch posts when filters change
  useEffect(() => {
    dispatch(fetchAllPosts({
      sortBy: localFilters.sortBy,
      category: localFilters.category === 'all' ? undefined : localFilters.category,
      search: localFilters.search || undefined,
      page: 1,
      limit: 10
    }));
  }, [dispatch, localFilters]);

  const handleFilterChange = (filterType, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const clearSearch = () => {
    setLocalFilters(prev => ({
      ...prev,
      search: ''
    }));
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'programming', label: 'Programming' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'science', label: 'Science' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'votes', label: 'Most Votes' },
    { value: 'activity', label: 'Recent Activity' },
    { value: 'unanswered', label: 'Unanswered' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Questions & Answers
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover knowledge, share insights, and learn together
            </p>
          </div>

          {isAuthenticated && (
            <Link
              to="/create-post"
              className="inline-flex items-center px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="mr-2">+</span>
              Ask a Question
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search questions..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {localFilters.search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category:
            </label>
            <select
              value={localFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            {pagination?.totalPosts > 0 ? (
              <span>
                Showing {posts.length} of {pagination.totalPosts} questions
              </span>
            ) : (
              <span>No questions found</span>
            )}
          </div>
          {error && (
            <button
              onClick={() => {
                dispatch(clearError());
                dispatch(fetchAllPosts(localFilters));
              }}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Posts List */}
      <PostList posts={posts} loading={loading} error={error} />

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-2">
          <button
            onClick={() => {
              if (pagination?.hasPrev) {
                dispatch(fetchAllPosts({
                  ...localFilters,
                  page: pagination.currentPage - 1
                }));
              }
            }}
            disabled={!pagination?.hasPrev}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination?.totalPages || 1) }, (_, i) => {
              const pageNum = Math.max(1, (pagination?.currentPage || 1) - 2) + i;
              if (pageNum > (pagination?.totalPages || 1)) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    dispatch(fetchAllPosts({
                      ...localFilters,
                      page: pageNum
                    }));
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pageNum === (pagination?.currentPage || 1)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (pagination?.hasNext) {
                dispatch(fetchAllPosts({
                  ...localFilters,
                  page: (pagination?.currentPage || 1) + 1
                }));
              }
            }}
            disabled={!pagination?.hasNext}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Call to Action for Unauthenticated Users */}
      {!isAuthenticated && posts.length > 0 && (
        <div className="mt-12 text-center bg-linear-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 border border-blue-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Join the Conversation
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create an account to ask questions, provide answers, and engage with the community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;