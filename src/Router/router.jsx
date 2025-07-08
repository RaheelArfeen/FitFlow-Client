import React from "react";
import {
    createBrowserRouter,
} from "react-router";
import Root from "../Root/Root";
import Login from "../Pages/Login";
import Home from "../Pages/Home";
import Register from "../Pages/Register";
import Trainers from "../Pages/Trainers";
import BeTrainer from "../Pages/BeTrainer";


export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        children: [
            { index: true, path: '/', Component: Home },
            { path: '/trainers', Component: Trainers },
            { path: '/be-trainer', Component: BeTrainer },
            { path: '/login', Component: Login },
            { path: '/register', Component: Register },
        ]
    },
]);