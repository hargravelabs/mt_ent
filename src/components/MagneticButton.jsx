import React from 'react';
import gsap from 'gsap';

const MagneticButton = ({ children, className = '', onClick }) => {
    const handleMagneticMove = (e) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const x = (e.clientX - rect.left) - (rect.width / 2);
        const y = (e.clientY - rect.top) - (rect.height / 2);

        gsap.to(target, { x: x * 0.2, y: y * 0.2, duration: 0.7, ease: "power3.out" });
        const text = target.querySelector('.btn-text');
        if (text) gsap.to(text, { x: x * 0.1, y: y * 0.1, duration: 0.7, ease: "power3.out" });
    };

    const handleMagneticLeave = (e) => {
        const target = e.currentTarget;
        gsap.to(target, { x: 0, y: 0, duration: 0.9, ease: "expo.out" });
        const text = target.querySelector('.btn-text');
        if (text) gsap.to(text, { x: 0, y: 0, duration: 0.9, ease: "expo.out" });
    };

    return (
        <button
            className={`magnetic-btn ${className}`}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default MagneticButton;
