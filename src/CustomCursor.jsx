import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './CustomCursor.css';

const INTERACTIVE_SELECTOR = 'a, button, .magnetic-btn, [role="button"], .service-card, .masonry-item-clickable';

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

        let isHidden = false;

        const hideCursor = () => {
            if (isHidden) return;
            isHidden = true;
            gsap.to(cursor, { opacity: 0, duration: 0.15 });
        };

        const showCursor = () => {
            if (!isHidden) return;
            isHidden = false;
            gsap.to(cursor, { opacity: 1, duration: 0.15 });
        };

        // Watch for video lightbox open/close via data attribute
        const checkVideoLightbox = () => {
            const videoLightbox = document.querySelector('[data-lightbox-video]');
            if (videoLightbox) {
                hideCursor();
            } else {
                showCursor();
            }
        };

        const observer = new MutationObserver(checkVideoLightbox);
        observer.observe(document.body, { childList: true, subtree: true });

        const moveCursor = (e) => {
            setX(e.clientX - 10);
            setY(e.clientY - 10);

            if (!cursorVisible) {
                cursorVisible = true;
                cursor.style.opacity = '1';
            }

            // If video lightbox is open, stay hidden
            if (isHidden) return;

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
            observer.disconnect();
        };
    }, [isTouchDevice]);

    if (isTouchDevice) return null;

    return <div ref={cursorRef} className="custom-cursor"></div>;
};

export default CustomCursor;
