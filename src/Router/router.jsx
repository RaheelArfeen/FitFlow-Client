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
import Trainers from "../Pages/Trainers";


export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        errorElement: <ErrorPage></ErrorPage>,
        children: [
            { index: true, path: '/', Component: Home },
            { path: '/be-trainer', Component: BeTrainer },
            { path: '/trainers', Component: Trainers },
            { path: '/trainers', Component: Trainers },
            { path: '/login', Component: Login },
            { path: '/register', Component: Register },
        ]
    },
]);