import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  wishlistService,
  WishlistItem,
  PaginatedWishlistResponse,
} from "../../services/wishlist";

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  hasMore: boolean;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  hasMore: true,
};

// Async thunks
export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchItems",
  async ({
    userId,
    page = 1,
    limit = 10,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await wishlistService.getWishlistItems(
      userId,
      page,
      limit
    );
    return response;
  }
);

export const addToWishlistAsync = createAsyncThunk(
  "wishlist/addItem",
  async (productId: string) => {
    const response = await wishlistService.addToWishlist(productId);
    return { productId, ...response };
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  "wishlist/removeItem",
  async (productId: string) => {
    const response = await wishlistService.removeFromWishlist(productId);
    return { productId, ...response };
  }
);

export const clearWishlistAsync = createAsyncThunk(
  "wishlist/clearAll",
  async () => {
    const response = await wishlistService.clearWishlist();
    return response;
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (!existingItem) {
        state.items.push(action.payload);
        state.pagination.total += 1;
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    clearWishlist: (state) => {
      state.items = [];
      state.pagination.total = 0;
      state.pagination.page = 1;
      state.hasMore = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetPagination: (state) => {
      state.pagination = initialState.pagination;
      state.hasMore = true;
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist items
      .addCase(fetchWishlistItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.loading = false;
        const { data, pagination } = action.payload;

        if (pagination.page === 1) {
          // Reset items for first page
          state.items = data.map((item) => item.product);
        } else {
          // Append items for subsequent pages
          state.items = [...state.items, ...data.map((item) => item.product)];
        }

        state.pagination = pagination;
        state.hasMore = pagination.page < pagination.pages;
      })
      .addCase(fetchWishlistItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch wishlist items";
      })

      // Add to wishlist
      .addCase(addToWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        // The actual product will be added when we refresh the list
      })
      .addCase(addToWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add item to wishlist";
      })

      // Remove from wishlist
      .addCase(removeFromWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { productId } = action.payload;
        state.items = state.items.filter((item) => item.id !== productId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(removeFromWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to remove item from wishlist";
      })

      // Clear wishlist
      .addCase(clearWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWishlistAsync.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.pagination.total = 0;
        state.pagination.page = 1;
        state.hasMore = true;
      })
      .addCase(clearWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to clear wishlist";
      });
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setLoading,
  setError,
  resetPagination,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
