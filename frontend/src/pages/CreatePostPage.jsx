import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../redux/slice/post.slice';
import Loader from '../components/common/Loader';

const CreatePostPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const { loading } = useSelector(state => state.post);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });
  const [errors, setErrors] = useState({});
  const [tagSuggestions] = useState([
    'javascript', 'react', 'node.js', 'python', 'java', 'html', 'css',
    'database', 'api', 'frontend', 'backend', 'mobile', 'devops', 'security'
  ]);

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters long';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 20) {
      newErrors.content = 'Content must be at least 20 characters long';
    } else if (formData.content.length > 50000) {
      newErrors.content = 'Content is too long (maximum 50000 characters)';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const postData = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0)
      };

      const result = await dispatch(createPost(postData)).unwrap();
      navigate(`/post/${result._id}`);
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to create post'
      });
    }
  };

  const addTagSuggestion = (tag) => {
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setFormData(prev => ({
        ...prev,
        tags: newTags
      }));
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <Loader size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Ask a Question
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get help from the community by asking a clear, detailed question.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="What's your question?"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 ${
              errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            maxLength={200}
          />
          <div className="flex justify-between mt-1">
            <span className={`text-sm ${errors.title ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {errors.title || `${formData.title.length}/200 characters`}
            </span>
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
              errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="javascript, react, node.js (comma separated)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Popular tags:</p>
            <div className="flex flex-wrap gap-2">
              {tagSuggestions.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTagSuggestion(tag)}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Details <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Provide more details about your question. Include what you've tried, expected vs actual results, etc."
            rows={12}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 resize-y ${
              errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            maxLength={50000}
          />
          <div className="flex justify-between mt-1">
            <span className={`text-sm ${errors.content ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {errors.content || `${formData.content.length}/50000 characters`}
            </span>
          </div>
        </div>

        {/* Submit error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center space-x-2"
          >
            {loading && <Loader size="small" type="spinner" />}
            <span>{loading ? 'Creating...' : 'Post Question'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;
