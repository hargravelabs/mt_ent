import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './CustomCursor.css';

const INTERACTIVE_SELECTOR = 'a, button, .magnetic-btn, [role="button"], .service-card';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    }, []);

    useEffect(() => {
        if (isTouchDevice) return;

        const cursor = cursorRef.current;

        const setX = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3" });
        const setY = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3" });

        let cursorVisible = false;
        let isExpanded = false;

        const expandCursor = () => {
            if (isExpanded) return;
            isExpanded = true;
            gsap.to(cursor, {
                scale: 2.5,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                duration: 0.2
            });
        };

        const shrinkCursor = () => {
            if (!isExpanded) return;
            isExpanded = false;
            gsap.to(cursor, {
                scale: 1,
                backgroundColor: "#ffffff",
                border: "none",
                duration: 0.2
            });
        };

        const moveCursor = (e) => {
            setX(e.clientX - 10);
            setY(e.clientY - 10);

            if (!cursorVisible) {
                cursorVisible = true;
                cursor.style.opacity = '1';
            }

            // Check if the element under the cursor (or any ancestor) is interactive
            const target = e.target;
            if (target && target.closest(INTERACTIVE_SELECTOR)) {
                expandCursor();
            } else {
                shrinkCursor();
            }
        };

        window.addEventListener("mousemove", moveCursor);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
        };
    }, [isTouchDevice]);

    if (isTouchDevice) return null;

    return <div ref={cursorRef} className="custom-cursor"></div>;
};

export default CustomCursor;
