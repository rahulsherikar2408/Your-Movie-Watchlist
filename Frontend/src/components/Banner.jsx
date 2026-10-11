import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import carouselData from '../utility/carouselData';

function Banner() {
    const items = carouselData.map((item, index) => (
        <div key={index} className='w-full h-[40vh] sm:h-[50vh] md:h-[75vh] bg-cover bg-center flex items-end' style={{ backgroundImage: `url(${item.image})` }}>
            <div className='w-full text-white text-md p-2 text-center bg-gray-900/60 md:text-xl md:p-3'>{item.title}</div>
        </div>
    ));

    return (
        <AliceCarousel
            autoPlay
            infinite
            mouseTracking
            autoPlayInterval={2500}
            animationDuration={1000}
            disableButtonsControls
            items={items}
        />
    );
}

export default Banner;
