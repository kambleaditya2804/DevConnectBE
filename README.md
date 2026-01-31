# DevConnect Backend 🚀

## Overview
DevConnect is a **MERN stack** platform for developers to **connect and collaborate**, similar to a professional matchmaking system. The backend is built with **Node.js, Express, and MongoDB**, using a modular structure for scalability and maintainability.

## Tech Stack
- **Backend**: Node.js + Express  
- **Database**: MongoDB + Mongoose  
- **Authentication**: JWT + Cookies  
- **Encryption**: bcryptjs  
- **Env Management**: dotenv  
- **Testing**: Postman  

## Features
- **Authentication**: Signup, login, logout with JWT and password hashing  
- **Profile Management**: View/edit profiles, update passwords  
- **Connection System**: Send, accept,reject requests; prevent self/duplicate requests
- **Feed & Pagination**: Suggested developers with optimized queries  
- **Middleware**: Authentication & error handling  
- **Database Optimization**: Indexes & schema validations  

## API Highlights
- **Auth**: `/auth/signup`, `/auth/login`, `/auth/logout`  
- **Profile**: `/profile/view`, `/profile/edit`, `/profile/password`  
- **Connections**: `/request/send/:status/:toUserId`, `/request/review/:status/:requestId`, `/user/requests/received`, `/user/connections`  
- **Feed**: `/user/feed?page=1&limit=10`  

## Frontend Integration
🔗 [DevConnect Frontend](https://github.com/kambleaditya2804/DevConnectFE)
