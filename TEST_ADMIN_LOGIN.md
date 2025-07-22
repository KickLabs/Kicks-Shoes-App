# Test Admin Login Navigation

## 🐛 Vấn đề

Admin login không navigate sang AdminDashboard

## 🔧 Đã sửa

1. **LoginForm.tsx**: Thêm logic kiểm tra role và navigate đúng trang
2. **Debug logs**: Thêm console.log để track role mapping

## 🧪 Test Steps

### 1. Kiểm tra User Role trong Database

```javascript
// Trong MongoDB hoặc admin panel
db.users.find({ role: "admin" });

// Hoặc tạo admin user
db.users.updateOne(
  { email: "admin@kicks.com" },
  {
    $set: {
      role: "admin",
      fullName: "Admin User",
      username: "admin",
      password: "$2b$12$...", // hash password
    },
  },
  { upsert: true }
);
```

### 2. Test Login Flow

1. Mở app và navigate đến Login screen
2. Nhập credentials của admin user
3. Kiểm tra console logs:
   ```
   🔍 LoginForm: Raw userProfile: { role: "admin", ... }
   🔍 LoginForm: userProfile.role: admin
   🔍 LoginForm: Mapped user object: { role: "admin", ... }
   🚀 LoginForm: Navigating admin/shop to AdminDashboard
   ```
4. App should navigate to AdminDashboard

### 3. Expected Navigation Logic

```typescript
if (user.role === "admin" || user.role === "shop") {
  // Navigate to AdminDashboard
  navigation.reset({
    index: 0,
    routes: [{ name: "AdminDashboard" as never }],
  });
} else {
  // Navigate to Profile (for customers)
  navigation.reset({
    index: 0,
    routes: [{ name: "Profile" as never }],
  });
}
```

## 📱 Test Accounts

### Admin Account

- **Email**: admin@kicks.com
- **Password**: admin123
- **Role**: admin
- **Expected**: Navigate to AdminDashboard

### Shop Account

- **Email**: shop@kicks.com
- **Password**: shop123
- **Role**: shop
- **Expected**: Navigate to AdminDashboard

### Customer Account

- **Email**: customer@kicks.com
- **Password**: customer123
- **Role**: customer
- **Expected**: Navigate to Profile

## 🔍 Debug Checklist

1. ✅ Backend `/api/auth/me` returns correct role
2. ✅ Frontend maps role correctly in LoginForm
3. ✅ Navigation logic checks role properly
4. ✅ AdminDashboard screen exists in navigation
5. ⏳ Test actual login with admin credentials

## 🚀 Next Steps

1. Test login với admin account
2. Verify console logs show correct role
3. Confirm navigation goes to AdminDashboard
4. Test AdminDashboard loads data from API
