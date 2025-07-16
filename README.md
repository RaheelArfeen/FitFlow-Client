# FitFlow

**Live Site:** [https://fitflow-raheel.netlify.app](https://fitflow-raheel.netlify.app)

**FitFlow** is a comprehensive fitness web application built with the MERN stack. It empowers users to connect with certified trainers, join diverse fitness classes, participate in a vibrant community forum, and manage their wellness journey—all in one place.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [License](#license)

---

## Features

### Role-Based Access

- **Member**: Discover trainers, register for classes, book personal sessions, and monitor personal progress.
- **Trainer**: Apply to become a trainer, manage availability and slots, and oversee session bookings.
- **Admin**: Approve or reject trainer applications, oversee user roles and content, and view key platform metrics.

### Core Functionality

- Real-time trainer booking system with slot/day selection
- Seamless and secure payment processing via Stripe
- Fitness class creation, management, and registration
- Interactive community forum with voting (upvote/downvote)
- Newsletter subscription with subscriber management
- Role-specific dashboards with real-time metrics
- Smooth page transitions and animations using Framer Motion
- Fully responsive and optimized for all devices

---

## Tech Stack

**Frontend**  
React, Tailwind CSS, Framer Motion, React Router, TanStack Query

**Backend**  
Node.js, Express.js, MongoDB

**Authentication**  
Firebase Authentication

**Payment Processing**  
Stripe

**Deployment Platforms**  
Frontend: Netlify  
Backend: Vercel

**State & Data Management**  
React Context, TanStack Query

---

## Getting Started

### Prerequisites

To run this project locally, ensure you have:

- Node.js and npm installed
- A MongoDB Atlas cluster
- A Firebase project (with Email/Password Authentication enabled)
- A Stripe account with API keys

---

## Environment Variables

Set the following environment variables in both frontend and backend environments:

### Backend (`.env`)

PORT=

MONGODB_URI=

STRIPE_SECRET_KEY=

FIREBASE_ADMIN_KEY= (or service account path if used)

Copy
Edit

### Frontend (`.env`)

VITE_API_URL=

VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_APP_ID=

VITE_FIREBASE_MEASUREMENT_ID=

VITE_STRIPE_PUBLISHABLE_KEY=

Copy
Edit

---

## Deployment

The application is deployed in two parts:

- **Frontend**: Deployed to [Netlify](https://www.netlify.com/)
- **Backend**: Hosted via [Vercel](https://vercel.com/)

Ensure proper configuration of environment variables and route rewrites on both platforms. For Netlify, enable SPA mode by redirecting all routes to `index.html`.

---

## License

This project is licensed for educational and demonstration purposes. You are welcome to fork and extend it, but please provide appropriate attribution.
