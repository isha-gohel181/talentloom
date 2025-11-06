import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAllPosts, clearError } from '../redux/slice/post.slice';
import { selectIsAuthenticated } from '../redux/slice/user.slice';
import PostList from '../components/post/PostList';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Questions & Answers
            </h1>
            <p className="text-muted-foreground">
              Discover knowledge, share insights, and learn together
            </p>
          </div>

          {isAuthenticated && (
            <Button asChild>
              <Link to="/create-post">
                + Ask a Question
              </Link>
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative max-w-2xl">
            <Input
              type="text"
              placeholder="Search questions..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pr-12"
            />
            {localFilters.search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            <Label className="text-sm font-medium text-foreground">
              Sort by:
            </Label>
            <Select value={localFilters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger className="w-40 bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-foreground hover:bg-accent hover:text-accent-foreground">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium text-foreground">
              Category:
            </Label>
            <Select value={localFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-40 bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value} className="text-foreground hover:bg-accent hover:text-accent-foreground">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
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
              className="text-primary hover:text-primary/80"
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
          <Button
            variant="outline"
            onClick={() => {
              if (pagination?.hasPrev) {
                dispatch(fetchAllPosts({
                  ...localFilters,
                  page: pagination.currentPage - 1
                }));
              }
            }}
            disabled={!pagination?.hasPrev}
          >
            ← Previous
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination?.totalPages || 1) }, (_, i) => {
              const pageNum = Math.max(1, (pagination?.currentPage || 1) - 2) + i;
              if (pageNum > (pagination?.totalPages || 1)) return null;

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === (pagination?.currentPage || 1) ? "default" : "outline"}
                  onClick={() => {
                    dispatch(fetchAllPosts({
                      ...localFilters,
                      page: pageNum
                    }));
                  }}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (pagination?.hasNext) {
                dispatch(fetchAllPosts({
                  ...localFilters,
                  page: (pagination?.currentPage || 1) + 1
                }));
              }
            }}
            disabled={!pagination?.hasNext}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Call to Action for Unauthenticated Users */}
      {!isAuthenticated && posts.length > 0 && (
        <Card className="mt-12">
          <CardHeader className="text-center">
            <CardTitle>Join the Conversation</CardTitle>
            <CardDescription>
              Create an account to ask questions, provide answers, and engage with the community.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/register">
                  Sign Up Free
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HomePage;