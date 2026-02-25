import React from 'react';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-6 mix-blend-difference text-mt-white">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <div className="font-sans text-xl font-medium tracking-widest uppercase">
                    MT // Media
                </div>
                <div className="hidden md:flex space-x-8 text-sm font-medium tracking-widest uppercase">
                    <a href="#about" className="hover:opacity-60 transition-opacity">About</a>
                    <a href="#works" className="hover:opacity-60 transition-opacity">Works</a>
                    <a href="#contact" className="hover:opacity-60 transition-opacity">Contact</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
