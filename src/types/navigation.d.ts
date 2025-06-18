export type RootStackParamList = {
  Intro: undefined;
  Welcome: undefined;
  Register: undefined;
  Verify: undefined;
  Login: undefined;
  Home: undefined;
  Main: undefined;
  Auth: undefined;
  ProductDetails: { productId: string };
  Cart: undefined;
  Wishlist: undefined;
  OrderHistory: undefined;
  OrderPending: undefined;
  OrderProcessing: undefined;
  OrderShipped: undefined;
  OrderDelivered: undefined;
  OrderCancelled: undefined;
  OrderRefunded: undefined;
  Profile: undefined;
  EditProfile: undefined;
};

export type OrderStatus =
  | "To Pay"
  | "To Ship"
  | "To Receive"
  | "Completed"
  | "Returns";

export interface Order {
  id: number;
  storeName: string;
  status: OrderStatus;
  product: {
    name: string;
    image: any;
    quantity: number;
    price: number;
    originalPrice: number;
  };
}
