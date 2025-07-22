# Admin Dashboard & Role-Based Navigation Guide

## 📋 Overview

Hệ thống đã được cập nhật với **Admin Dashboard** và **Role-Based Navigation** để phân quyền người dùng dựa trên vai trò.

## 🎯 Features

### 1. **Admin Dashboard Screen**

- **Location**: `src/screens/admin/AdminDashboard.tsx`
- **Features**:
  - Dashboard với thống kê tổng quan
  - Quản lý Users, Products, Orders
  - Analytics và báo cáo
  - Quick Actions
  - Responsive design

### 2. **Role-Based Navigation**

- **AuthGuard Enhanced**: `src/components/auth/AuthGuard.tsx`
- **Auto Redirect**: User với role `admin` hoặc `shop` sẽ được tự động redirect đến AdminDashboard
- **Permission Control**: Kiểm tra quyền truy cập dựa trên role

### 3. **Supported Roles**

```typescript
type UserRole = "user" | "admin" | "shop" | "customer";
```

## 🚀 How It Works

### Navigation Flow:

```
User Login → Check Role → Redirect Based on Role
├── admin/shop → AdminDashboard
└── customer/user → Normal App Flow
```

### Role Checking Logic:

```typescript
// Auto redirect for admin/shop users
if (user.role === "admin" || user.role === "shop") {
  navigate("AdminDashboard");
}
```

## 🛠️ Setup & Usage

### 1. **Enable Role-Based Navigation**

The system automatically redirects users based on their role when they login or access protected screens.

### 2. **Access AdminDashboard**

**Method 1: Login with admin/shop role**

- User với role `admin` hoặc `shop` sẽ được tự động redirect

**Method 2: Manual navigation**

```typescript
navigation.navigate("AdminDashboard");
```

### 3. **Test Role Switching (Development)**

Use the `RoleSwitcher` component for testing:

```typescript
import RoleSwitcher from "@/components/debug/RoleSwitcher";

// Add to any screen for testing
<RoleSwitcher />
```

## 📱 Admin Dashboard Features

### Dashboard Tab

- **Statistics Cards**:

  - Total Users
  - Total Products
  - Total Orders
  - Total Revenue
  - Categories
  - Conversations

- **Quick Actions**:
  - Add Product
  - Manage Users
  - View Orders
  - Chat Support

### Users Tab

- User list with search
- User information display
- Role and status management

### Products Tab

- Product list with search
- Product information
- Stock and pricing
- Status management

### Orders Tab

- Order list with search
- Order status tracking
- Customer and pricing info

### Analytics Tab

- Revenue analytics
- Order trends
- User statistics

## 🔧 Configuration

### 1. **Update User Role**

To test different roles, update user data in AsyncStorage:

```typescript
const user = {
  id: "123",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin", // Change this to "shop", "customer", "user"
};

await AsyncStorage.setItem("userInfo", JSON.stringify(user));
```

### 2. **Add New Role Requirements**

Update `AuthGuard` component:

```typescript
<AuthGuard requiredRole="admin">
  <AdminOnlyComponent />
</AuthGuard>

// Or multiple roles
<AuthGuard allowedRoles={["admin", "shop"]}>
  <AdminShopComponent />
</AuthGuard>
```

### 3. **Customize Dashboard**

Update `AdminDashboard.tsx`:

- Modify `loadDashboardData()` for real API calls
- Update UI components
- Add new tabs or features

## 🎨 UI/UX Features

### Design Elements:

- **Modern Design**: Clean, professional interface
- **Role-Based Header**: Shows different titles for admin vs shop
- **Responsive Layout**: Works on different screen sizes
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

### Color Scheme:

- **Primary**: #3b82f6 (Blue)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Orange)
- **Danger**: #ef4444 (Red)
- **Gray**: #6b7280 (Text)

## 🔍 Testing

### Test Scenarios:

1. **Customer Login**:

   - Should stay on normal app flow
   - No redirect to admin dashboard

2. **Admin Login**:

   - Should auto-redirect to AdminDashboard
   - Show "Admin Dashboard" in header

3. **Shop Login**:

   - Should auto-redirect to AdminDashboard
   - Show "Shop Dashboard" in header

4. **Permission Checks**:
   - Non-admin users should get "Access Denied"
   - Proper role-based redirects

### Debug Tools:

1. **RoleSwitcher Component**:

   ```typescript
   // Add to any screen for testing
   import RoleSwitcher from "@/components/debug/RoleSwitcher";
   <RoleSwitcher />
   ```

2. **Console Logs**:
   - AuthGuard logs role checks
   - Navigation logs redirects
   - Dashboard logs user info

## 📝 API Integration

### Required API Endpoints:

```typescript
// Dashboard stats
GET /api/admin/stats

// User management
GET /api/admin/users
DELETE /api/admin/users/:id

// Product management
GET /api/admin/products
DELETE /api/admin/products/:id

// Order management
GET /api/admin/orders
PUT /api/admin/orders/:id/status
```

### Mock Data:

Currently using mock data in `AdminDashboard.tsx`. Replace with real API calls:

```typescript
// Replace mock data
const loadDashboardData = async () => {
  const response = await fetch("/api/admin/stats");
  const data = await response.json();
  setDashboardStats(data);
};
```

## 🚨 Important Notes

1. **Security**: Role checking is done on frontend only. Always validate roles on backend APIs.

2. **Navigation**: AdminDashboard is added to RootStack, not TabNavigator.

3. **State Management**: User role is stored in AsyncStorage and managed by useAuth hook.

4. **Testing**: Use RoleSwitcher component in development only.

5. **Performance**: Dashboard loads data on tab changes for better UX.

## 🎯 Next Steps

1. **Connect Real APIs**: Replace mock data with actual backend calls
2. **Enhanced Permissions**: Add more granular permission controls
3. **Advanced Analytics**: Add charts and graphs
4. **Bulk Actions**: Add bulk operations for users/products
5. **Export Features**: Add data export functionality

---

**✅ Admin Dashboard is ready to use! Test with different roles to see the role-based navigation in action.**
