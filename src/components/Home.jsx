import React from 'react';
import Hero from './Hero';
import AboutMT from './AboutMT';
import HorizontalReel from './HorizontalReel';
import Services from './Services';

const Home = () => {
    return (
        <div className="home-content">
            <Hero />
            <HorizontalReel />
            <Services />
            <AboutMT />
        </div>
    );
};

export default Home;
