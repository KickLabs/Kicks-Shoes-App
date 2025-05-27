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
│   ├── components/     # Reusable components
│   ├── screens/        # Main screens
│   ├── navigation/     # Navigation configuration
│   ├── store/         # Redux store and slices
│   ├── services/      # API services
│   └── utils/         # Utility functions
├── assets/            # Images and resources
└── ...
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See [LICENSE](LICENSE) file for details
