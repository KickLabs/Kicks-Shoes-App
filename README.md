# Kicks Shoes E-commerce Project

A full-stack e-commerce application for selling shoes, built with React Native (Mobile App) and Node.js (Backend).

## Features

- User authentication (Register/Login)
- Product listing and details
- Shopping cart functionality
- Order management
- Admin dashboard
- Search and filter products
- User profile management

## Technologies Used

### Mobile App

- React Native
- Expo
- TypeScript
- React Navigation
- Redux Toolkit
- AsyncStorage

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- Multer (for file uploads)

## System Requirements

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android)
- Xcode (for iOS, macOS only)
- MongoDB

## Installation

1. Clone the repository:

```bash
git clone [REPOSITORY_URL]
cd Kicks-Shoes-App
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
API_URL=your_api_url
```

4. Start the application:

```bash
npm start
# or
yarn start
```

## Running on Devices

1. Install Expo Go app on your mobile device
2. Scan the QR code from the terminal after running start command
3. Or run on emulators:
   - Android: `npm run android`
   - iOS: `npm run ios`

## Project Structure

```
Kicks-Shoes-App/
├── src/
│   ├── assets/         # Images, fonts, and other static resources
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Shared components (buttons, inputs, etc.)
│   │   ├── layout/     # Layout components (headers, footers, etc.)
│   │   └── product/    # Product-specific components
│   ├── screens/        # Main screen components
│   │   ├── auth/       # Authentication screens
│   │   ├── cart/       # Shopping cart screens
│   │   ├── home/       # Home screen and related
│   │   ├── product/    # Product details screens
│   │   └── profile/    # User profile screens
│   ├── navigation/     # Navigation configuration
│   │   ├── AppNavigator.tsx    # Main navigation stack
│   │   ├── AuthNavigator.tsx   # Auth navigation stack
│   │   └── TabNavigator.tsx    # Bottom tab navigation
│   ├── store/          # Redux store configuration
│   │   ├── slices/     # Redux slices
│   │   └── index.ts    # Store configuration
│   ├── services/       # API services and data fetching
│   │   ├── api.ts      # API configuration
│   │   └── auth.ts     # Authentication services
│   ├── hooks/          # Custom React hooks
│   ├── constants/      # App constants and configuration
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
└── ...
```

## UI Development Process

### 1. Component Structure

- **Common Components** (`components/common/`): Reusable UI elements like buttons, inputs, cards
- **Layout Components** (`components/layout/`): Page layouts, headers, navigation bars
- **Feature Components** (`components/product/`, etc.): Components specific to features

### 2. Screen Development Process

1. **Create Screen Component** (`screens/`):

   ```typescript
   // screens/home/HomeScreen.tsx
   import React from "react";
   import { View, Text } from "react-native";
   import { styles } from "./styles";

   const HomeScreen = () => {
     return (
       <View style={styles.container}>
         <Text>Home Screen</Text>
       </View>
     );
   };

   export default HomeScreen;
   ```

2. **Add Styles** (`screens/home/styles.ts`):

   ```typescript
   import { StyleSheet } from "react-native";

   export const styles = StyleSheet.create({
     container: {
       flex: 1,
       padding: 16,
     },
   });
   ```

3. **Add Navigation** (`navigation/`):

   ```typescript
   // navigation/AppNavigator.tsx
   import { createStackNavigator } from "@react-navigation/stack";
   import HomeScreen from "../screens/home/HomeScreen";

   const Stack = createStackNavigator();

   export const AppNavigator = () => {
     return (
       <Stack.Navigator>
         <Stack.Screen name="Home" component={HomeScreen} />
       </Stack.Navigator>
     );
   };
   ```

### 3. State Management

- Use Redux for global state (`store/slices/`)
- Use local state for component-specific data
- Use custom hooks for reusable logic (`hooks/`)

### 4. API Integration

- Create API services in `services/`
- Use TypeScript interfaces in `types/`
- Handle API responses and errors

### 5. Testing

- Test components and screens
- Test navigation flow
- Test state management
- Test API integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See [LICENSE](LICENSE) file for details
