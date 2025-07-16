import React, { useEffect } from 'react';
import Banner from '../Components/HomeComponents/Banner';
import FeaturedSection from '../Components/HomeComponents/FeaturedSection';
import AboutSection from '../Components/HomeComponents/AboutSection';
import FeaturedClasses from '../Components/HomeComponents/FeaturedClasses';
import TestimonialsSection from '../Components/HomeComponents/TestimonialsSection';
import CommunitySection from '../Components/HomeComponents/CommunitySection';
import NewsletterSection from '../Components/HomeComponents/NewsletterSection';
import TeamSection from '../Components/HomeComponents/TeamSection';
import { Meta, Title } from 'react-head';

const Home = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Title>Home | FitFlow</Title>

            <Banner />
            <FeaturedSection />
            <AboutSection />
            <FeaturedClasses />
            <TestimonialsSection />
            <CommunitySection />
            <TeamSection />
            <NewsletterSection />
        </>
    );
};

export default Home;
