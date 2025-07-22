// Service exports for easy importing
export { wishlistService } from "./wishlist";
export { productService } from "./product";
export { categoryService } from "./category";
export { reviewService } from "./review";
export { notificationService } from "./notification";
export { addressService } from "./address";
export { chatService } from "./chat";

// Existing services
export { default as apiService } from "./api";
export { default as authService } from "./auth";
export { default as userService } from "./user";
export { default as cartService } from "./cart";
export { default as orderService } from "./order";

// Types exports
export type {
  WishlistItem,
  WishlistResponse,
  PaginatedWishlistResponse,
} from "./wishlist";

export type {
  Product,
  ProductVariant,
  ProductsResponse,
  ProductFilters,
} from "./product";

export type { Category, CategoriesResponse } from "./category";

export type {
  Review,
  ReviewsResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
} from "./review";

export type {
  Notification,
  NotificationsResponse,
  NotificationSettings,
} from "./notification";

export type {
  Address,
  AddressesResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "./address";

export type {
  ChatMessage,
  Conversation,
  MessagesResponse,
  ConversationsResponse,
  SendMessageRequest,
} from "./chat";
