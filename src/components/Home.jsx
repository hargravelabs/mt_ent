import React from 'react';
import useSmoothScroll from '../hooks/useSmoothScroll';
import Hero from './Hero';
import AboutMT from './AboutMT';
import HorizontalReel from './HorizontalReel';
import Services from './Services';

const Home = () => {
    useSmoothScroll();

    return (
        <div className="home-content">
            <Hero />
            <AboutMT />
            <HorizontalReel />
            <Services />
        </div>
    );
};

export default Home;
