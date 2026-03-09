import React from 'react';

const Footer = () => {
    return (
        <footer className="reveal-footer" id="contact">
            {/* Marquee Background */}
            <div className="footer-marquee">
                <div className="marquee-track">
                    <span>FILM • PHOTOGRAPHY • CREATIVE DIRECTION • EVENT MEDIA • </span>
                    <span>FILM • PHOTOGRAPHY • CREATIVE DIRECTION • EVENT MEDIA • </span>
                    <span>FILM • PHOTOGRAPHY • CREATIVE DIRECTION • EVENT MEDIA • </span>
                </div>
            </div>

            <div className="footer-noise"></div>

            <div className="footer-content">
                <div className="footer-top">
                    <h2 className="footer-headline">Let's <br />Create.</h2>
                </div>
                <div className="footer-grid">
                    <div className="footer-col" style={{ gridColumn: 'span 2' }}>
                        <h4>Inquiries</h4>
                        <a href="mailto:milan@mt-entertainment.com" className="email-link">
                            milan@mt-entertainment.com
                        </a>
                        <a href="tel:+6142208093" className="phone-link">
                            +61 422 080 93
                        </a>
                    </div>
                    <div className="footer-col">
                        <h4>Socials</h4>
                        <a href="https://www.instagram.com/mt_ent_/?hl=en" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a>
                        <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" className="footer-link">Vimeo</a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-link">YouTube</a>
                    </div>
                    <div className="footer-col">
                        <h4>Location</h4>
                        <p>Melbourne<br />South-East, AUS<br />Available Worldwide</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 MT Entertainment. Visual Architecture.</p>
                    <div className="small-logo">mt_ent_</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
