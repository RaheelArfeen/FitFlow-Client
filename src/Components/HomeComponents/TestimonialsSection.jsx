import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

import useAxiosSecure from '../../Provider/UseAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import Loader from '../../Pages/Loader';

const TestimonialsSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState(null);

    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const paginationRef = useRef(null);

    const axiosSecure = useAxiosSecure();

    const { data: reviews = [], isLoading, isError, error } = useQuery({
        queryKey: ['reviews'],
        queryFn: async () => {
            const response = await axiosSecure.get('/reviews');
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    const testimonials = reviews.map(review => ({
        id: review._id,
        name: review.reviewerName || "Anonymous User",
        role: review.reviewerEmail || "Member",
        image: review.reviewerPhotoURL || `https://placehold.co/150x150/cccccc/ffffff?text=${review.reviewerName?.charAt(0).toUpperCase() || '?'}` || "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
        rating: review.rating || 5,
        text: review.comment ? review.comment.trim() : null,
        createdAt: review.createdAt
    }));


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
    }, [swiperInstance, prevRef, nextRef, paginationRef, testimonials.length]);


    if (isLoading) {
        return <Loader />;
    }

    if (isError) {
        return (
            <section className="py-20 bg-white dark:bg-gray-800 text-center">
                <div className="container mx-auto px-4">
                    <p className="text-red-600 dark:text-red-400 text-lg">Error loading testimonials: {error?.message || "Please try again later."}</p>
                </div>
            </section>
        );
    }

    if (!testimonials || testimonials.length === 0) {
        return (
            <section className="py-20 bg-white dark:bg-gray-800 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        No Testimonials Yet
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Be the first to share your experience with FitFlow!
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-white dark:bg-gray-800">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        What Our Members Say
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
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
                            bulletClass: 'swiper-pagination-bullet w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-200 inline-block mx-1 cursor-pointer',
                            bulletActiveClass: 'swiper-pagination-bullet-active bg-blue-700 dark:bg-blue-400',
                        }}
                        onSwiper={setSwiperInstance}
                        onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
                        breakpoints={{
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 20,
                            },
                        }}
                        className="pb-16"
                    >
                        {testimonials.slice(0, 9).map((testimonial) => (
                            <SwiperSlide key={testimonial.id}>
                                {({ isActive }) => (
                                    <div
                                        className={`relative px-2 py-8 transition-all duration-500 ease-in-out ${isActive
                                            ? 'scale-105 z-20 md:-translate-y-4 translate-y-4'
                                            : 'scale-95 translate-y-8 z-10'
                                            }`}
                                    >
                                        <div className="bg-white dark:bg-gray-900 px-8 py-12 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col justify-between text-left max-w-sm mx-auto min-h-[440px]">
                                            <Quote className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-6" />

                                            {testimonial.text && (
                                                <p className="text-gray-600 dark:text-gray-400 mb-6 italic leading-relaxed flex-grow">
                                                    "{testimonial.text}"
                                                </p>
                                            )}

                                            <div className="w-full border-t-2 border-dashed border-gray-200 dark:border-gray-700 my-4"></div>

                                            <div className="flex items-center mt-auto">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-blue-500"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/cccccc/ffffff?text=${testimonial.name.charAt(0)}` }}
                                                />
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{testimonial.name}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                                                    <div className="flex mt-1">
                                                        {Array.from({ length: 5 }, (_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className="flex items-center md:mt-8 w-fit mx-auto space-x-4">
                        <button
                            ref={prevRef}
                            className="bg-white dark:bg-gray-900 p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            aria-label="Previous Testimonial"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>

                        <div ref={paginationRef} className="flex space-x-2">
                            {/* Swiper will render bullets here */}
                        </div>

                        <button
                            ref={nextRef}
                            className="bg-white dark:bg-gray-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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