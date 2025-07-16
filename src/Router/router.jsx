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
import DashboardLayout from "../Root/DashboardLayout";
import { ProtectedRoute } from "../Provider/ProtectedRoute";
import AdminRoute from "../Provider/AdminRoute";
import TrainersRoute from "../Provider/TrainersRoute";
import MemberRoute from "../Provider/MemberRoute";
import ActivityLog from "../Pages/Dashboard/Member/ActivityLog";
import BookedTrainers from "../Pages/Dashboard/Member/BookedTrainers";
import Subscribers from "../Pages/Dashboard/Admin/Subscribers";
import AllTrainers from "../Pages/Dashboard/Admin/AllTrainers";
import AppliedTrainers from "../Pages/Dashboard/Admin/AppliedTrainers";
import Balance from "../Pages/Dashboard/Admin/Balance";
import DashboardOverview from "../Pages/Dashboard/DashboardOverview";
import AddCommunity from "../Pages/Dashboard/AddCommunity";
import forbidden from "../Pages/Dashboard/forbidden";
import Community from "../Pages/Community/Community";
import Classes from "../Pages/Classes/Classes";
import CommunityDetails from "../Pages/Community/CommunityDetails";
import AddSlot from "../Pages/Dashboard/Trainer/AddSlot";
import ManageSlot from "../Pages/Dashboard/Trainer/ManageSlots";
import Profile from "../Pages/Dashboard/Member/Profile";
import AddNewClass from "../Pages/Dashboard/Admin/AddClass";
import Payment from "../Pages/Trainers/Payment";


export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        errorElement: <ErrorPage></ErrorPage>,
        children: [
            { index: true, path: '/', Component: Home },
            { path: '/be-trainer', element: <ProtectedRoute><BeTrainer /></ProtectedRoute> },
            { path: '/classes', Component: Classes },
            { path: '/trainers', Component: Trainers },
            { path: '/trainer/:id', Component: TrainerDetail },
            { path: '/book-trainer/:trainerId/:slotId', element: <ProtectedRoute><BookTrainerPage /></ProtectedRoute> },
            { path: '/payment/:trainerId/:slotId/:packageId', element: <ProtectedRoute><Payment /></ProtectedRoute> },
            { path: '/community', Component: Community },
            { path: '/community/:id', element: <CommunityDetails /> },
            { path: '/login', Component: Login },
            { path: '/register', Component: Register },
        ]
    },

    {
        path: "/dashboard",
        element: <ProtectedRoute> <DashboardLayout /> </ProtectedRoute>,
        children: [
            { index: true, path: '/dashboard', Component: DashboardOverview },
            { path: 'add-community', element: <ProtectedRoute> <AddCommunity /> </ProtectedRoute> },
            // member routes
            { path: 'activity-log', element: <MemberRoute><ActivityLog /></MemberRoute> },
            { path: 'profile', element: <MemberRoute><Profile /></MemberRoute> },
            { path: 'booked-trainers', element: <MemberRoute><BookedTrainers /></MemberRoute> },
            // admin routes
            { path: 'subscribers', element: <AdminRoute><Subscribers /></AdminRoute> },
            { path: 'trainers', element: <AdminRoute><AllTrainers /></AdminRoute> },
            { path: 'applied-trainers', element: <AdminRoute><AppliedTrainers /></AdminRoute> },
            { path: 'balance', element: <AdminRoute><Balance /></AdminRoute> },
            { path: 'add-class', element: <AddNewClass /> },
            // trainer routes
            { path: 'add-slot', element: <TrainersRoute><AddSlot /></TrainersRoute> },
            { path: 'manage-slots', element: <TrainersRoute><ManageSlot /></TrainersRoute> },
            { path: 'forbidden', Component: forbidden },
        ]
    }
]);