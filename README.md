# 📸 PhotoBook Server API

A complete backend API for a photographer & videographer booking system built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication** (JWT-based)
- **Role-based Access Control** (User, Photographer, Admin)
- **Profile Management** for photographers
- **Booking System** with status tracking
- **Review & Rating System**
- **Admin Dashboard** for profile approval

## 🛠️ Tech Stack

- **Node.js** with ES6 modules
- **Express.js** for API framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

## 📁 Project Structure

```
server/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── profileController.js # Profile management
│   ├── bookingController.js # Booking operations
│   ├── reviewController.js  # Review system
│   └── adminController.js   # Admin operations
├── middleware/
│   └── auth.js            # JWT authentication & authorization
├── models/
│   ├── User.js            # User model
│   ├── Profile.js         # Photographer profile model
│   ├── Booking.js         # Booking model
│   └── Review.js          # Review model
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   ├── profileRoutes.js   # Profile routes
│   ├── bookingRoutes.js   # Booking routes
│   ├── reviewRoutes.js    # Review routes
│   └── adminRoutes.js     # Admin routes
├── server.js              # Main server file
└── package.json           # Dependencies
```

## 🗄️ Database Models

### User Model
- `name`, `email`, `password`, `role` (user/photographer/admin)
- Password hashing with bcrypt
- JWT token generation

### Profile Model
- `displayName`, `bio`, `genres`, `pricing`
- `rating`, `ratingCount`, `portfolio`, `status`
- `location` (city, state, country)

### Booking Model
- `user`, `photographer`, `date`, `timeSlot`
- `notes`, `status` (pending/approved/rejected/completed)

### Review Model
- `booking`, `user`, `photographer`, `rating`, `comment`
- Automatic rating aggregation

## 🔧 Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the server directory:
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/photobook
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES=7d
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system

4. **Run the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Profiles
- `GET /api/profiles` - List approved profiles (public)
- `GET /api/profiles/me` - Get my profile (photographer)
- `PUT /api/profiles/me` - Update my profile (photographer)

### Bookings
- `POST /api/bookings` - Create booking (user)
- `GET /api/bookings/mine` - Get my bookings (user/photographer)
- `PATCH /api/bookings/:id/status` - Update booking status (photographer/admin)

### Reviews
- `POST /api/reviews` - Add review (user)

### Admin
- `PATCH /api/admin/profiles` - Approve/block profiles (admin)
- `GET /api/admin/stats` - Get system statistics (admin)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🎯 Usage Examples

### Register a Photographer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "photographer"
  }'
```

### Create a Profile
```bash
curl -X PUT http://localhost:5000/api/profiles/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Photography",
    "bio": "Professional wedding photographer",
    "genres": ["wedding", "portrait"],
    "pricing": {
      "currency": "INR",
      "baseRate": 5000
    },
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra"
    }
  }'
```

### Create a Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "photographerId": "photographer_id_here",
    "date": "2024-01-15",
    "timeSlot": "14:00-16:00",
    "notes": "Wedding photography session"
  }'
```

## 🚀 Ready to Use

The server is now ready to handle:
- User registration and authentication
- Photographer profile management
- Booking creation and management
- Review and rating system
- Admin operations for profile approval

Start the server and begin testing the API endpoints!
