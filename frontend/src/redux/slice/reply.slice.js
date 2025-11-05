import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.config';

// Async thunks for all reply operations
export const createReply = createAsyncThunk(
  'replies/createReply',
  async ({ postId, replyData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/replies/post/${postId}`, replyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to create reply'
      );
    }
  }
);

export const fetchRepliesByPost = createAsyncThunk(
  'replies/fetchRepliesByPost',
  async ({ postId, parentReply = null }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (parentReply) params.append('parentReply', parentReply);

      const response = await api.get(`/api/v1/replies/post/${postId}?${params.toString()}`);
      return { postId, parentReply, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch replies'
      );
    }
  }
);

export const upvoteReply = createAsyncThunk(
  'replies/upvoteReply',
  async (replyId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/replies/${replyId}/upvote`);
      return { replyId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to upvote reply'
      );
    }
  }
);

export const downvoteReply = createAsyncThunk(
  'replies/downvoteReply',
  async (replyId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/replies/${replyId}/downvote`);
      return { replyId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to downvote reply'
      );
    }
  }
);

export const markReplyAsAccepted = createAsyncThunk(
  'replies/markAsAccepted',
  async (replyId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/v1/replies/${replyId}/accept`);
      return { replyId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to mark reply as accepted'
      );
    }
  }
);

export const updateReply = createAsyncThunk(
  'replies/updateReply',
  async ({ replyId, content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/replies/${replyId}`, { content });
      return { replyId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to update reply'
      );
    }
  }
);

export const deleteReply = createAsyncThunk(
  'replies/deleteReply',
  async (replyId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/v1/replies/${replyId}`);
      return { replyId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to delete reply'
      );
    }
  }
);

export const fetchUserReplies = createAsyncThunk(
  'replies/fetchUserReplies',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);

      const response = await api.get(`/api/v1/replies/user/${userId}?${params.toString()}`);
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch user replies'
      );
    }
  }
);

// Get nested replies for a specific parent reply
export const fetchNestedReplies = createAsyncThunk(
  'replies/fetchNestedReplies',
  async ({ postId, parentReplyId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/replies/post/${postId}?parentReply=${parentReplyId}`);
      return { postId, parentReplyId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch nested replies'
      );
    }
  }
);

const initialState = {
  // Replies by post ID
  repliesByPost: {},
  // User's replies (for profile)
  userReplies: [],
  // Loading states
  loading: {
    creating: false,
    fetching: false,
    updating: false,
    deleting: false,
    voting: false,
    userReplies: false
  },
  // Error states
  error: {
    creating: null,
    fetching: null,
    updating: null,
    deleting: null,
    voting: null,
    userReplies: null
  },
  // Messages
  message: null,
  // Pagination for user replies
  userRepliesPagination: {
    currentPage: 1,
    totalPages: 1,
    totalReplies: 0,
    hasNext: false,
    hasPrev: false
  },
  // Currently expanded nested replies
  expandedReplies: {},
  // Cache for quick access
  cache: {}
};

const replySlice = createSlice({
  name: 'replies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = {
        creating: null,
        fetching: null,
        updating: null,
        deleting: null,
        voting: null,
        userReplies: null
      };
      state.message = null;
    },
    clearRepliesByPost: (state, action) => {
      const postId = action.payload;
      delete state.repliesByPost[postId];
    },
    clearAllReplies: (state) => {
      state.repliesByPost = {};
    },
    clearUserReplies: (state) => {
      state.userReplies = [];
      state.userRepliesPagination = {
        currentPage: 1,
        totalPages: 1,
        totalReplies: 0,
        hasNext: false,
        hasPrev: false
      };
    },
    addReplyToPost: (state, action) => {
      const { postId, reply, parentReply = null } = action.payload;
      
      if (!state.repliesByPost[postId]) {
        state.repliesByPost[postId] = [];
      }

      if (parentReply) {
        // Find the parent reply and add this as a nested reply
        const addNestedReply = (replies, parentId, newReply) => {
          for (let reply of replies) {
            if (reply._id === parentId) {
              if (!reply.replies) reply.replies = [];
              reply.replies.push(newReply);
              return true;
            }
            if (reply.replies && reply.replies.length > 0) {
              if (addNestedReply(reply.replies, parentId, newReply)) {
                return true;
              }
            }
          }
          return false;
        };

        addNestedReply(state.repliesByPost[postId], parentReply, reply);
      } else {
        // Add as top-level reply
        state.repliesByPost[postId].unshift(reply);
      }

      // Cache the reply
      state.cache[reply._id] = reply;
    },
    updateReplyInStore: (state, action) => {
      const { replyId, updates } = action.payload;
      
      // Update in cache
      if (state.cache[replyId]) {
        state.cache[replyId] = { ...state.cache[replyId], ...updates };
      }

      // Update in repliesByPost
      const updateInReplies = (replies) => {
        for (let reply of replies) {
          if (reply._id === replyId) {
            Object.assign(reply, updates);
            return true;
          }
          if (reply.replies && reply.replies.length > 0) {
            if (updateInReplies(reply.replies)) {
              return true;
            }
          }
        }
        return false;
      };

      Object.values(state.repliesByPost).forEach(replies => {
        updateInReplies(replies);
      });

      // Update in userReplies
      const userReplyIndex = state.userReplies.findIndex(reply => reply._id === replyId);
      if (userReplyIndex !== -1) {
        state.userReplies[userReplyIndex] = { ...state.userReplies[userReplyIndex], ...updates };
      }
    },
    removeReplyFromStore: (state, action) => {
      const { replyId, postId } = action.payload;

      // Remove from cache
      delete state.cache[replyId];

      // Remove from repliesByPost
      if (state.repliesByPost[postId]) {
        const removeFromReplies = (replies) => {
          const index = replies.findIndex(reply => reply._id === replyId);
          if (index !== -1) {
            replies.splice(index, 1);
            return true;
          }
          
          for (let reply of replies) {
            if (reply.replies && reply.replies.length > 0) {
              if (removeFromReplies(reply.replies)) {
                return true;
              }
            }
          }
          return false;
        };

        removeFromReplies(state.repliesByPost[postId]);
      }

      // Remove from userReplies
      state.userReplies = state.userReplies.filter(reply => reply._id !== replyId);
    },
    toggleExpandedReply: (state, action) => {
      const replyId = action.payload;
      state.expandedReplies[replyId] = !state.expandedReplies[replyId];
    },
    collapseAllReplies: (state) => {
      state.expandedReplies = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Reply
      .addCase(createReply.pending, (state) => {
        state.loading.creating = true;
        state.error.creating = null;
        state.message = null;
      })
      .addCase(createReply.fulfilled, (state, action) => {
        state.loading.creating = false;
        const { reply, message } = action.payload;
        
        // Add to repliesByPost
        if (!state.repliesByPost[reply.post]) {
          state.repliesByPost[reply.post] = [];
        }

        if (reply.parentReply) {
          // Find parent and add as nested reply
          const addToParent = (replies, parentId, newReply) => {
            for (let r of replies) {
              if (r._id === parentId) {
                if (!r.replies) r.replies = [];
                r.replies.unshift(newReply);
                return true;
              }
              if (r.replies && r.replies.length > 0) {
                if (addToParent(r.replies, parentId, newReply)) {
                  return true;
                }
              }
            }
            return false;
          };

          addToParent(state.repliesByPost[reply.post], reply.parentReply, reply);
        } else {
          // Add as top-level reply
          state.repliesByPost[reply.post].unshift(reply);
        }

        // Cache the reply
        state.cache[reply._id] = reply;
        
        state.message = message;
      })
      .addCase(createReply.rejected, (state, action) => {
        state.loading.creating = false;
        state.error.creating = action.payload;
      })
      
      // Fetch Replies by Post
      .addCase(fetchRepliesByPost.pending, (state) => {
        state.loading.fetching = true;
        state.error.fetching = null;
      })
      .addCase(fetchRepliesByPost.fulfilled, (state, action) => {
        state.loading.fetching = false;
        const { postId, parentReply, replies } = action.payload;

        if (!state.repliesByPost[postId]) {
          state.repliesByPost[postId] = [];
        }

        if (parentReply) {
          // Update nested replies for a specific parent
          const updateNestedReplies = (replyList, parentId, newReplies) => {
            for (let reply of replyList) {
              if (reply._id === parentId) {
                reply.replies = newReplies;
                return true;
              }
              if (reply.replies && reply.replies.length > 0) {
                if (updateNestedReplies(reply.replies, parentId, newReplies)) {
                  return true;
                }
              }
            }
            return false;
          };

          updateNestedReplies(state.repliesByPost[postId], parentReply, replies);
        } else {
          // Set top-level replies
          state.repliesByPost[postId] = replies;
        }

        // Cache all replies
        replies.forEach(reply => {
          state.cache[reply._id] = reply;
        });
      })
      .addCase(fetchRepliesByPost.rejected, (state, action) => {
        state.loading.fetching = false;
        state.error.fetching = action.payload;
      })
      
      // Upvote Reply
      .addCase(upvoteReply.pending, (state) => {
        state.loading.voting = true;
        state.error.voting = null;
      })
      .addCase(upvoteReply.fulfilled, (state, action) => {
        state.loading.voting = false;
        const { replyId, upvotes, downvotes, voteScore, message } = action.payload;
        
        // Update in cache
        if (state.cache[replyId]) {
          state.cache[replyId].upvotes = upvotes;
          state.cache[replyId].downvotes = downvotes;
          state.cache[replyId].voteScore = voteScore;
        }

        // Update in all locations
        const updateVotesInReplies = (replies) => {
          for (let reply of replies) {
            if (reply._id === replyId) {
              reply.upvotes = upvotes;
              reply.downvotes = downvotes;
              reply.voteScore = voteScore;
              return true;
            }
            if (reply.replies && reply.replies.length > 0) {
              if (updateVotesInReplies(reply.replies)) {
                return true;
              }
            }
          }
          return false;
        };

        Object.values(state.repliesByPost).forEach(replies => {
          updateVotesInReplies(replies);
        });

        // Update in userReplies
        const userReplyIndex = state.userReplies.findIndex(reply => reply._id === replyId);
        if (userReplyIndex !== -1) {
          state.userReplies[userReplyIndex].upvotes = upvotes;
          state.userReplies[userReplyIndex].downvotes = downvotes;
          state.userReplies[userReplyIndex].voteScore = voteScore;
        }

        state.message = message;
      })
      .addCase(upvoteReply.rejected, (state, action) => {
        state.loading.voting = false;
        state.error.voting = action.payload;
      })
      
      // Downvote Reply
      .addCase(downvoteReply.pending, (state) => {
        state.loading.voting = true;
        state.error.voting = null;
      })
      .addCase(downvoteReply.fulfilled, (state, action) => {
        state.loading.voting = false;
        const { replyId, upvotes, downvotes, voteScore, message } = action.payload;
        
        // Update in cache
        if (state.cache[replyId]) {
          state.cache[replyId].upvotes = upvotes;
          state.cache[replyId].downvotes = downvotes;
          state.cache[replyId].voteScore = voteScore;
        }

        // Update in all locations
        const updateVotesInReplies = (replies) => {
          for (let reply of replies) {
            if (reply._id === replyId) {
              reply.upvotes = upvotes;
              reply.downvotes = downvotes;
              reply.voteScore = voteScore;
              return true;
            }
            if (reply.replies && reply.replies.length > 0) {
              if (updateVotesInReplies(reply.replies)) {
                return true;
              }
            }
          }
          return false;
        };

        Object.values(state.repliesByPost).forEach(replies => {
          updateVotesInReplies(replies);
        });

        // Update in userReplies
        const userReplyIndex = state.userReplies.findIndex(reply => reply._id === replyId);
        if (userReplyIndex !== -1) {
          state.userReplies[userReplyIndex].upvotes = upvotes;
          state.userReplies[userReplyIndex].downvotes = downvotes;
          state.userReplies[userReplyIndex].voteScore = voteScore;
        }

        state.message = message;
      })
      .addCase(downvoteReply.rejected, (state, action) => {
        state.loading.voting = false;
        state.error.voting = action.payload;
      })
      
      // Mark Reply as Accepted
      .addCase(markReplyAsAccepted.pending, (state) => {
        state.loading.updating = true;
        state.error.updating = null;
      })
      .addCase(markReplyAsAccepted.fulfilled, (state, action) => {
        state.loading.updating = false;
        const { replyId, reply, message } = action.payload;
        
        // Update in cache
        if (state.cache[replyId]) {
          state.cache[replyId].isAcceptedAnswer = true;
        }

        // Update in all locations
        const updateAcceptedInReplies = (replies) => {
          for (let r of replies) {
            if (r._id === replyId) {
              r.isAcceptedAnswer = true;
              return true;
            }
            if (r.replies && r.replies.length > 0) {
              if (updateAcceptedInReplies(r.replies)) {
                return true;
              }
            }
          }
          return false;
        };

        Object.values(state.repliesByPost).forEach(replies => {
          updateAcceptedInReplies(replies);
        });

        // Update in userReplies
        const userReplyIndex = state.userReplies.findIndex(r => r._id === replyId);
        if (userReplyIndex !== -1) {
          state.userReplies[userReplyIndex].isAcceptedAnswer = true;
        }

        state.message = message;
      })
      .addCase(markReplyAsAccepted.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.updating = action.payload;
      })
      
      // Update Reply
      .addCase(updateReply.pending, (state) => {
        state.loading.updating = true;
        state.error.updating = null;
      })
      .addCase(updateReply.fulfilled, (state, action) => {
        state.loading.updating = false;
        const { replyId, reply, message } = action.payload;
        
        // Update in cache
        if (state.cache[replyId]) {
          state.cache[replyId] = { ...state.cache[replyId], ...reply };
        }

        // Update in all locations
        const updateContentInReplies = (replies) => {
          for (let r of replies) {
            if (r._id === replyId) {
              Object.assign(r, reply);
              return true;
            }
            if (r.replies && r.replies.length > 0) {
              if (updateContentInReplies(r.replies)) {
                return true;
              }
            }
          }
          return false;
        };

        Object.values(state.repliesByPost).forEach(replies => {
          updateContentInReplies(replies);
        });

        // Update in userReplies
        const userReplyIndex = state.userReplies.findIndex(r => r._id === replyId);
        if (userReplyIndex !== -1) {
          state.userReplies[userReplyIndex] = { ...state.userReplies[userReplyIndex], ...reply };
        }

        state.message = message;
      })
      .addCase(updateReply.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.updating = action.payload;
      })
      
      // Delete Reply
      .addCase(deleteReply.pending, (state) => {
        state.loading.deleting = true;
        state.error.deleting = null;
      })
      .addCase(deleteReply.fulfilled, (state, action) => {
        state.loading.deleting = false;
        const { replyId, message } = action.payload;
        
        // Remove from cache
        delete state.cache[replyId];

        // Soft delete in all locations (mark as deleted)
        const markAsDeletedInReplies = (replies) => {
          for (let reply of replies) {
            if (reply._id === replyId) {
              reply.isDeleted = true;
              reply.content = '[This reply has been deleted]';
              return true;
            }
            if (reply.replies && reply.replies.length > 0) {
              if (markAsDeletedInReplies(reply.replies)) {
                return true;
              }
            }
          }
          return false;
        };

        Object.values(state.repliesByPost).forEach(replies => {
          markAsDeletedInReplies(replies);
        });

        // Remove from userReplies
        state.userReplies = state.userReplies.filter(reply => reply._id !== replyId);
        
        // Update user replies pagination
        state.userRepliesPagination.totalReplies -= 1;

        state.message = message;
      })
      .addCase(deleteReply.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error.deleting = action.payload;
      })
      
      // Fetch User Replies
      .addCase(fetchUserReplies.pending, (state) => {
        state.loading.userReplies = true;
        state.error.userReplies = null;
      })
      .addCase(fetchUserReplies.fulfilled, (state, action) => {
        state.loading.userReplies = false;
        state.userReplies = action.payload.replies;
        state.userRepliesPagination = action.payload.pagination;

        // Cache user replies
        action.payload.replies.forEach(reply => {
          state.cache[reply._id] = reply;
        });
      })
      .addCase(fetchUserReplies.rejected, (state, action) => {
        state.loading.userReplies = false;
        state.error.userReplies = action.payload;
      })
      
      // Fetch Nested Replies
      .addCase(fetchNestedReplies.pending, (state) => {
        state.loading.fetching = true;
        state.error.fetching = null;
      })
      .addCase(fetchNestedReplies.fulfilled, (state, action) => {
        state.loading.fetching = false;
        const { postId, parentReplyId, replies } = action.payload;

        if (!state.repliesByPost[postId]) {
          state.repliesByPost[postId] = [];
        }

        // Find parent and set nested replies
        const setNestedReplies = (replyList, parentId, nestedReplies) => {
          for (let reply of replyList) {
            if (reply._id === parentId) {
              reply.replies = nestedReplies;
              return true;
            }
            if (reply.replies && reply.replies.length > 0) {
              if (setNestedReplies(reply.replies, parentId, nestedReplies)) {
                return true;
              }
            }
          }
          return false;
        };

        setNestedReplies(state.repliesByPost[postId], parentReplyId, replies);

        // Cache nested replies
        replies.forEach(reply => {
          state.cache[reply._id] = reply;
        });
      })
      .addCase(fetchNestedReplies.rejected, (state, action) => {
        state.loading.fetching = false;
        state.error.fetching = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearRepliesByPost, 
  clearAllReplies, 
  clearUserReplies,
  addReplyToPost,
  updateReplyInStore,
  removeReplyFromStore,
  toggleExpandedReply,
  collapseAllReplies
} = replySlice.actions;

export default replySlice.reducer;

// Selectors
export const selectRepliesByPost = (postId) => (state) => state.replies.repliesByPost[postId] || [];
export const selectUserReplies = (state) => state.replies.userReplies;
export const selectUserRepliesPagination = (state) => state.replies.userRepliesPagination;
export const selectRepliesLoading = (state) => state.replies.loading.fetching;
export const selectCreatingReply = (state) => state.replies.loading.creating;
export const selectUserRepliesLoading = (state) => state.replies.loading.userReplies;
export const selectRepliesError = (state) => state.replies.error.fetching;
export const selectCreatingError = (state) => state.replies.error.creating;
export const selectUserRepliesError = (state) => state.replies.error.userReplies;
export const selectReplyMessage = (state) => state.replies.message;
export const selectReplyById = (replyId) => (state) => state.replies.cache[replyId];
export const selectIsReplyExpanded = (replyId) => (state) => !!state.replies.expandedReplies[replyId];