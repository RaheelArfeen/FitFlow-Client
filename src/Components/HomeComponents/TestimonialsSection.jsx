import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules'; // Import Swiper modules

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'; // Import Chevron and Quote icons

const TestimonialsSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0); // State to control the active slide for dynamic styling
    const [swiperInstance, setSwiperInstance] = useState(null); // State to hold the Swiper instance

    const testimonials = [
        {
            id: 1,
            name: "Jessica Martinez",
            role: "Marketing Manager",
            image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
            rating: 5,
            text: "FitFlow has completely transformed my fitness journey. The personalized training plans and supportive community keep me motivated every day. I've lost 30 pounds and gained so much confidence!"
        },
        {
            id: 2,
            name: "Michael Chen",
            role: "Software Engineer",
            image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
            rating: 5,
            text: "As someone with a busy schedule, FitFlow's flexible booking system is a game-changer. The quality of trainers is exceptional, and I love how I can track my progress in real-time."
        },
        {
            id: 3,
            name: "Sarah Johnson",
            role: "Teacher",
            image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150",
            rating: 5,
            text: "The variety of classes available is amazing! From yoga to HIIT, there's something for everyone. The instructors are knowledgeable and create such a positive environment."
        },
        {
            id: 4,
            name: "David Rodriguez",
            role: "Business Owner",
            image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150",
            rating: 5,
            text: "FitFlow's community aspect is what sets it apart. I've made genuine friendships here, and we all support each other's fitness goals. It's more than just a gym—it's a lifestyle."
        },
        {
            id: 5,
            name: "Emily Davis",
            role: "Nurse",
            image: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150",
            rating: 5,
            text: "Working long shifts, I needed a fitness solution that worked around my schedule. FitFlow's 24/7 support and flexible class times have been perfect for my lifestyle."
        },
        {
            id: 6,
            name: "James Wilson",
            role: "Student",
            image: "https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150",
            rating: 5,
            text: "The progress tracking features are incredible. Being able to see my improvement over time keeps me motivated to push harder. The trainers really know how to bring out your best."
        }
    ];

    // Refs for custom navigation buttons and pagination
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const paginationRef = useRef(null);

    useEffect(() => {
        if (swiperInstance && prevRef.current && nextRef.current && paginationRef.current) {
            swiperInstance.params.navigation.prevEl = prevRef.current;
            swiperInstance.params.navigation.nextEl = nextRef.current;
            swiperInstance.navigation.init();
            swiperInstance.navigation.update();

            swiperInstance.params.pagination.el = paginationRef.current;
            swiperInstance.pagination.init();
            swiperInstance.pagination.render();
            swiperInstance.pagination.update();
        }
    }, [swiperInstance, prevRef, nextRef, paginationRef])


    return (
        <section className="py-20 bg-gradient-to-br from-blue-50 to-orange-50">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        What Our Members Say
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Real stories from real people who've transformed their lives with FitFlow.
                    </p>
                </div>

                <div className="relative">
                    <Swiper
                        modules={[Navigation, Pagination, A11y]}
                        spaceBetween={30}
                        slidesPerView={1}
                        centeredSlides={true}
                        loop={true}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        pagination={{
                            clickable: true,
                            el: paginationRef.current,
                            bulletClass: 'swiper-pagination-bullet w-3 h-3 rounded-full bg-gray-300 transition-colors duration-200 inline-block mx-1 cursor-pointer',
                            bulletActiveClass: 'swiper-pagination-bullet-active bg-blue-700',
                        }}
                        onSwiper={setSwiperInstance} // Store the swiper instance
                        onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
                        breakpoints={{
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 20,
                            },
                        }}
                        className="pb-16"
                    >
                        {testimonials.map((testimonial) => (
                            <SwiperSlide key={testimonial.id}>
                                {({ isActive }) => (
                                    <div
                                        className={`relative px-2 py-8 transition-all duration-500 ease-in-out ${isActive
                                                ? 'scale-105 z-20 -translate-y-4'
                                                : 'scale-95 translate-y-8 z-10'
                                            }`}
                                    >
                                        <div className="bg-white px-8 py-12 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col justify-between text-left max-w-sm mx-auto min-h-[440px]">
                                            <Quote className="h-10 w-10 text-gray-300 mb-6" />

                                            <p className="text-gray-600 mb-6 italic leading-relaxed flex-grow">
                                                "{testimonial.text}"
                                            </p>

                                            <div className="w-full border-t-2 border-dashed border-gray-200 my-4"></div>

                                            <div className="flex items-center mt-auto">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-blue-500"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/cccccc/ffffff?text=${testimonial.name.charAt(0)}` }}
                                                />
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Navigation Buttons and Indicators */}
                    <div className="flex items-center mt-8 w-fit mx-auto space-x-4">
                        <button
                            ref={prevRef} // Assign ref to prev button
                            className="bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            aria-label="Previous Testimonial"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>

                        {/* Pagination container */}
                        <div ref={paginationRef} className="flex space-x-2">
                            {/* Swiper will render bullets here */}
                        </div>

                        <button
                            ref={nextRef} // Assign ref to next button
                            className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            aria-label="Next Testimonial"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
