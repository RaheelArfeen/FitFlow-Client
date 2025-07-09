import React from "react";
import {
    createBrowserRouter,
} from "react-router";
import Root from "../Root/Root";
import Login from "../Pages/Login";
import Home from "../Pages/Home";
import Register from "../Pages/Register";
import BeTrainer from "../Pages/BeTrainer";
import ErrorPage from "../Pages/Error/ErrorPage";
import Trainers from "../Pages/Trainers/Trainers";
import TrainerDetail from "../Pages/Trainers/TrainerDetail";
import BookTrainerPage from "../Pages/Trainers/BookTrainer";
import Payment from "../Pages/Trainers/Payment";
import DashboardLayout from "../Root/DashboardLayout";
import { ProtectedRoute } from "../Provider/ProtectedRoute";
import AdminRoute from "../Provider/AdminRoute";
import Subscribers from "../Pages/Dashboard/Admin/Subscribers";
import DashboardOverview from "../Pages/Dashboard/Admin/DashboardOverview";
import AddCommunity from "../Pages/Dashboard/AddCommunity";
import forbidden from "../Pages/Dashboard/forbidden";


export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        errorElement: <ErrorPage></ErrorPage>,
        children: [
            { index: true, path: '/', Component: Home },
            { path: '/be-trainer', Component: BeTrainer },
            { path: '/trainers', Component: Trainers },
            { path: '/trainer/:id', Component: TrainerDetail },
            { path: '/book-trainer/:trainerId/:slotId', Component: BookTrainerPage },
            { path: '/payment/:trainerId/:slotId/:packageId', Component: Payment },
            { path: '/login', Component: Login },
            { path: '/register', Component: Register },
        ]
    },

    {
        path: "/dashboard",
        element: <ProtectedRoute> <DashboardLayout /> </ProtectedRoute>,
        children: [
            { index: true, path: '/dashboard', Component: DashboardOverview },
            { path: 'subscribers', element: (<AdminRoute><Subscribers /></AdminRoute>) },
            { path: 'add-community', Component: AddCommunity },
            { path: 'forbidden', Component: forbidden },
        ]
    }
]);