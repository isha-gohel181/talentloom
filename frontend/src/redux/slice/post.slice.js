import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunks for all post operations
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append text fields
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      if (postData.category) formData.append('category', postData.category);
      if (postData.tags) formData.append('tags', Array.isArray(postData.tags) ? postData.tags.join(',') : postData.tags);
      
      // Append file if exists
      if (postData.media) {
        formData.append('media', postData.media);
      }

      const response = await api.post('/api/v1/posts', formData, {
        headers: {
          // 'Content-Type': 'multipart/form-data', // Let axios set this automatically for FormData
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to create post'
      );
    }
  }
);

export const fetchAllPosts = createAsyncThunk(
  'posts/fetchAllPosts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { 
        sortBy = 'latest', 
        category, 
        page = 1, 
        limit = 10,
        search 
      } = filters;

      const params = new URLSearchParams();
      if (sortBy) params.append('sortBy', sortBy);
      if (category) params.append('category', category);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);

      const response = await api.get(`/api/v1/posts?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch posts'
      );
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/posts/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch post'
      );
    }
  }
);

export const votePost = createAsyncThunk(
  'posts/votePost',
  async ({ postId, vote }, { rejectWithValue }) => {
    try {
      const endpoint = vote === 1 ? 'upvote' : 'downvote';
      const response = await api.post(`/api/v1/posts/${postId}/${endpoint}`);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        `Failed to ${vote === 1 ? 'upvote' : 'downvote'} post`
      );
    }
  }
);

export const acceptReply = createAsyncThunk(
  'posts/acceptReply',
  async ({ postId, replyId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/posts/${postId}/accept-reply`, { replyId });
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'Failed to accept reply'
      );
    }
  }
);

export const getPostById = createAsyncThunk(
  'posts/getPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/posts/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'Failed to fetch post'
      );
    }
  }
);

export const getRepliesByPostId = createAsyncThunk(
  'posts/getRepliesByPostId',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/reply/post/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'Failed to fetch replies'
      );
    }
  }
);

export const markPostAsAnswered = createAsyncThunk(
  'posts/markAsAnswered',
  async ({ postId, replyId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/posts/${postId}/answered`, { replyId });
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to mark post as answered'
      );
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to update post'
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/v1/posts/${postId}`);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to delete post'
      );
    }
  }
);

export const fetchPostsByCategory = createAsyncThunk(
  'posts/fetchByCategory',
  async ({ category, page = 1, limit = 10, sortBy = 'latest' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (sortBy) params.append('sortBy', sortBy);

      const response = await api.get(`/api/v1/posts/category/${category}?${params.toString()}`);
      return { category, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch posts by category'
      );
    }
  }
);

// Search posts
export const searchPosts = createAsyncThunk(
  'posts/searchPosts',
  async (searchQuery, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/posts?search=${encodeURIComponent(searchQuery)}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to search posts'
      );
    }
  }
);

const initialState = {
  // Posts list
  posts: [],
  // Current post being viewed
  currentPost: null,
  // Loading states
  loading: {
    posts: false,
    currentPost: false,
    creating: false,
    updating: false,
    deleting: false,
    voting: false
  },
  // Error states
  error: {
    posts: null,
    currentPost: null,
    creating: null,
    updating: null,
    deleting: null,
    voting: null
  },
  // Messages
  message: null,
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNext: false,
    hasPrev: false
  },
  // Filters
  filters: {
    sortBy: 'latest',
    category: 'all',
    search: ''
  },
  // User's posts (for profile)
  userPosts: [],
  // Cache for quick access
  cache: {}
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = {
        posts: null,
        currentPost: null,
        creating: null,
        updating: null,
        deleting: null,
        voting: null
      };
      state.message = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: 'latest',
        category: 'all',
        search: ''
      };
    },
    updatePostInList: (state, action) => {
      const updatedPost = action.payload;
      const index = state.posts.findIndex(post => post._id === updatedPost._id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...updatedPost };
      }
    },
    addReplyToCurrentPost: (state, action) => {
      if (state.currentPost) {
        if (!state.currentPost.replies) {
          state.currentPost.replies = [];
        }
        state.currentPost.replies.push(action.payload);
      }
    },
    updateReplyInCurrentPost: (state, action) => {
      if (state.currentPost && state.currentPost.replies) {
        const { replyId, updates } = action.payload;
        const replyIndex = state.currentPost.replies.findIndex(reply => reply._id === replyId);
        if (replyIndex !== -1) {
          state.currentPost.replies[replyIndex] = { 
            ...state.currentPost.replies[replyIndex], 
            ...updates 
          };
        }
      }
    },
    clearPosts: (state) => {
      state.posts = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
        hasNext: false,
        hasPrev: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading.creating = true;
        state.error.creating = null;
        state.message = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.posts.unshift(action.payload.post);
        state.message = action.payload.message;
        // Update pagination
        state.pagination.totalPosts += 1;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading.creating = false;
        state.error.creating = action.payload;
      })
      
      // Fetch All Posts
      .addCase(fetchAllPosts.pending, (state) => {
        state.loading.posts = true;
        state.error.posts = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.loading.posts = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.loading.posts = false;
        state.error.posts = action.payload;
      })
      
      // Fetch Post By ID
      .addCase(fetchPostById.pending, (state) => {
        state.loading.currentPost = true;
        state.error.currentPost = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading.currentPost = false;
        state.currentPost = action.payload.post;
        // Cache the post for quick access
        state.cache[action.payload.post._id] = action.payload.post;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading.currentPost = false;
        state.error.currentPost = action.payload;
      })
      
      // Vote Post (combined upvote/downvote)
      .addCase(votePost.pending, (state) => {
        state.loading.voting = true;
        state.error.voting = null;
      })
      .addCase(votePost.fulfilled, (state, action) => {
        state.loading.voting = false;
        const { postId, upvotes, downvotes, voteScore, message } = action.payload;

        // Update in posts list
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].upvotes = upvotes;
          state.posts[postIndex].downvotes = downvotes;
          state.posts[postIndex].voteScore = voteScore;
        }

        // Update in current post
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.upvotes = upvotes;
          state.currentPost.downvotes = downvotes;
          state.currentPost.voteScore = voteScore;
        }

        state.message = message;
      })
      .addCase(votePost.rejected, (state, action) => {
        state.loading.voting = false;
        state.error.voting = action.payload;
      })

      // Accept Reply
      .addCase(acceptReply.pending, (state) => {
        state.loading.updating = true;
        state.error.updating = null;
      })
      .addCase(acceptReply.fulfilled, (state, action) => {
        state.loading.updating = false;
        const { postId, post, message } = action.payload;

        // Update in posts list
        const postIndex = state.posts.findIndex(p => p._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].isAnswered = post.isAnswered;
          state.posts[postIndex].answeredBy = post.answeredBy;
          state.posts[postIndex].answeredAt = post.answeredAt;
        }

        // Update in current post
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.isAnswered = post.isAnswered;
          state.currentPost.answeredBy = post.answeredBy;
          state.currentPost.answeredAt = post.answeredAt;
        }

        state.message = message;
      })
      .addCase(acceptReply.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.updating = action.payload;
      })

      // Get Post By ID (alias for fetchPostById)
      .addCase(getPostById.pending, (state) => {
        state.loading.currentPost = true;
        state.error.currentPost = null;
      })
      .addCase(getPostById.fulfilled, (state, action) => {
        state.loading.currentPost = false;
        state.currentPost = action.payload.post;
        // Cache the post for quick access
        state.cache[action.payload.post._id] = action.payload.post;
      })
      .addCase(getPostById.rejected, (state, action) => {
        state.loading.currentPost = false;
        state.error.currentPost = action.payload;
      })

      // Get Replies By Post ID
      .addCase(getRepliesByPostId.pending, (state) => {
        // We can use existing loading state or add a new one
        state.loading.currentPost = true;
        state.error.currentPost = null;
      })
      .addCase(getRepliesByPostId.fulfilled, (state, action) => {
        state.loading.currentPost = false;
        // Update current post with replies if it exists
        if (state.currentPost) {
          state.currentPost.replies = action.payload.replies;
        }
      })
      .addCase(getRepliesByPostId.rejected, (state, action) => {
        state.loading.currentPost = false;
        state.error.currentPost = action.payload;
      })
      
      // Mark Post as Answered
      .addCase(markPostAsAnswered.pending, (state) => {
        state.loading.updating = true;
        state.error.updating = null;
      })
      .addCase(markPostAsAnswered.fulfilled, (state, action) => {
        state.loading.updating = false;
        const { postId, post, message } = action.payload;
        
        // Update in posts list
        const postIndex = state.posts.findIndex(p => p._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].isAnswered = post.isAnswered;
          state.posts[postIndex].answeredBy = post.answeredBy;
          state.posts[postIndex].answeredAt = post.answeredAt;
        }
        
        // Update in current post
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.isAnswered = post.isAnswered;
          state.currentPost.answeredBy = post.answeredBy;
          state.currentPost.answeredAt = post.answeredAt;
        }
        
        state.message = message;
      })
      .addCase(markPostAsAnswered.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.updating = action.payload;
      })
      
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.loading.updating = true;
        state.error.updating = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading.updating = false;
        const updatedPost = action.payload.post;
        
        // Update in posts list
        const postIndex = state.posts.findIndex(post => post._id === updatedPost._id);
        if (postIndex !== -1) {
          state.posts[postIndex] = updatedPost;
        }
        
        // Update in current post
        if (state.currentPost && state.currentPost._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
        
        state.message = action.payload.message;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.updating = action.payload;
      })
      
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.loading.deleting = true;
        state.error.deleting = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading.deleting = false;
        const { postId, message } = action.payload;
        
        // Remove from posts list
        state.posts = state.posts.filter(post => post._id !== postId);
        
        // Clear current post if it's the deleted one
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost = null;
        }
        
        // Remove from cache
        delete state.cache[postId];
        
        // Update pagination
        state.pagination.totalPosts -= 1;
        
        state.message = message;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error.deleting = action.payload;
      })
      
      // Fetch Posts by Category
      .addCase(fetchPostsByCategory.pending, (state) => {
        state.loading.posts = true;
        state.error.posts = null;
      })
      .addCase(fetchPostsByCategory.fulfilled, (state, action) => {
        state.loading.posts = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
        state.filters.category = action.payload.category;
      })
      .addCase(fetchPostsByCategory.rejected, (state, action) => {
        state.loading.posts = false;
        state.error.posts = action.payload;
      })
      
      // Search Posts
      .addCase(searchPosts.pending, (state) => {
        state.loading.posts = true;
        state.error.posts = null;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.loading.posts = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
        state.filters.search = action.meta.arg;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.loading.posts = false;
        state.error.posts = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearCurrentPost, 
  setFilters, 
  clearFilters, 
  updatePostInList,
  addReplyToCurrentPost,
  updateReplyInCurrentPost,
  clearPosts
} = postSlice.actions;

export default postSlice.reducer;

// Selectors
export const selectPosts = (state) => state.posts.posts;
export const selectCurrentPost = (state) => state.posts.currentPost;
export const selectPostsLoading = (state) => state.posts.loading.posts;
export const selectCurrentPostLoading = (state) => state.posts.loading.currentPost;
export const selectCreatingPost = (state) => state.posts.loading.creating;
export const selectPostsError = (state) => state.posts.error.posts;
export const selectCurrentPostError = (state) => state.posts.error.currentPost;
export const selectCreatingError = (state) => state.posts.error.creating;
export const selectPagination = (state) => state.posts.pagination;
export const selectFilters = (state) => state.posts.filters;
export const selectPostMessage = (state) => state.posts.message;
export const selectPostById = (postId) => (state) => 
  state.posts.cache[postId] || 
  state.posts.posts.find(post => post._id === postId);