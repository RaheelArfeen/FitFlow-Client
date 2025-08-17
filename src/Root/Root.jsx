import React, { useEffect } from 'react';
import Navbar from '../Components/Navbar';
import { Outlet } from 'react-router';
import Footer from '../Components/Footer';

const Root = () => {

    return (
        <div className='min-h-screen flex flex-col justify-between -z-50 bg-[#f9fafb] dark:bg-gray-900'>
            <Navbar></Navbar>
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
};

export default Root;