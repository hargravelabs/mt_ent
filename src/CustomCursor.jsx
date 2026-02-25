import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './CustomCursor.css';

const CustomCursor = () => {
    const cursorRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;

        // Follow mouse
        const setX = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3" });
        const setY = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3" });

        const moveCursor = (e) => {
            setX(e.clientX - 10);
            setY(e.clientY - 10);
        };

        window.addEventListener("mousemove", moveCursor);

        // Hover effects on interactive elements
        // Re-query dynamically or use event delegation for React
        const handleMouseOver = (e) => {
            const target = e.target.closest('a, button, .magnetic-btn, .showreel-container');
            if (!target) return;

            if (target.classList.contains('showreel-container')) {
                gsap.to(cursor, {
                    scale: 6,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    border: "0.5px solid rgba(255, 255, 255, 0.4)",
                    duration: 0.4,
                    ease: "power2.out"
                });
                cursor.classList.add('glass-cursor');
                cursor.innerHTML = "<span style='font-size: 3px; font-weight: 600; font-family: \"Inter\", sans-serif; letter-spacing: 0.1em; color: #fff; text-align: center; line-height: 1.2;'>PLAY<br/>REEL</span>";
            } else {
                gsap.to(cursor, {
                    scale: 2.5,
                    backgroundColor: "rgba(26, 26, 26, 0.1)",
                    border: "1px solid rgba(26, 26, 26, 0.5)",
                    duration: 0.2
                });
                cursor.innerHTML = "";
                cursor.classList.remove('glass-cursor');
            }
        };

        const handleMouseOut = (e) => {
            const target = e.target.closest('a, button, .magnetic-btn, .showreel-container');
            if (!target) return;

            gsap.to(cursor, {
                scale: 1,
                backgroundColor: "var(--text-dark)",
                border: "none",
                duration: 0.2
            });
            cursor.innerHTML = "";
            cursor.classList.remove('glass-cursor');
        };

        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, []);

    return <div ref={cursorRef} className="custom-cursor"></div>;
};

export default CustomCursor;
