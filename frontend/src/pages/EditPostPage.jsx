import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPostById, updatePost, clearError } from '../redux/slice/post.slice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from '../components/common/Loader';

const EditPostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentPost, loading, error } = useSelector(state => state.posts);
  const { user } = useSelector(state => state.user);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General Programming',
    tags: ''
  });
  
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch post data
  useEffect(() => {
    if (postId) {
      dispatch(getPostById(postId));
    }
  }, [postId, dispatch]);

  // Populate form when post is loaded
  useEffect(() => {
    if (currentPost) {
      // Check if user is the author
      if (currentPost.author._id !== user?._id) {
        navigate('/');
        return;
      }

      setFormData({
        title: currentPost.title || '',
        content: currentPost.content || '',
        category: currentPost.category || 'General Programming',
        tags: Array.isArray(currentPost.tags) ? currentPost.tags.join(', ') : ''
      });
    }
  }, [currentPost, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return false;
    }
    if (formData.title.length < 10) {
      setFormError('Title must be at least 10 characters');
      return false;
    }
    if (formData.title.length > 300) {
      setFormError('Title cannot exceed 300 characters');
      return false;
    }
    if (!formData.content.trim()) {
      setFormError('Content is required');
      return false;
    }
    if (formData.content.length < 20) {
      setFormError('Content must be at least 20 characters');
      return false;
    }
    if (formData.content.length > 5000) {
      setFormError('Content cannot exceed 5000 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      await dispatch(updatePost({ postId, postData })).unwrap();
      
      // Redirect to post detail page
      navigate(`/post/${postId}`);
    } catch (err) {
      setFormError(err || 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading.currentPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Loader />
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Post not found</h2>
            <Link to="/" className="text-primary hover:underline">
              Back to home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = [
    'General Programming',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'DevOps',
    'Security',
    'Career Advice',
    'Tools & Technologies',
    'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Edit Question
        </h1>
        <p className="text-muted-foreground">
          Update your question to get better answers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>
            Make your changes below. Be clear and specific to get the best help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="e.g., How do I implement authentication in React?"
                value={formData.title}
                onChange={handleChange}
                maxLength={300}
                disabled={isSubmitting}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/300 characters
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">
                Detailed Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Provide more details about your question. Include what you've tried and any error messages..."
                value={formData.content}
                onChange={handleChange}
                maxLength={5000}
                disabled={isSubmitting}
                className="min-h-[200px] resize-y"
              />
              <p className="text-xs text-muted-foreground">
                {formData.content.length}/5000 characters
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">
                Tags <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="tags"
                name="tags"
                type="text"
                placeholder="e.g., react, javascript, authentication (comma separated)"
                value={formData.tags}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas. Maximum 10 tags.
              </p>
            </div>

            {/* Error Display */}
            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm">{formError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/post/${postId}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader size="small" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Question'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPostPage;
