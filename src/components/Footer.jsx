import React from 'react';

const Footer = () => {
    return (
        <footer className="reveal-footer" id="contact">
            <div className="footer-content">
                <div className="footer-top">
                    <h2 className="footer-headline">Let's <br />Create.</h2>
                </div>
                <div className="footer-grid">
                    <div className="footer-col" style={{ gridColumn: 'span 2' }}>
                        <h4>Inquiries</h4>
                        <a href="mailto:hello@mt_ent.studio" className="email-link">
                            hello@mt_ent.studio
                        </a>
                    </div>
                    <div className="footer-col">
                        <h4>Socials</h4>
                        <a href="https://instagram.com" className="footer-link">Instagram</a>
                        <a href="https://vimeo.com" className="footer-link">Vimeo</a>
                        <a href="https://youtube.com" className="footer-link">YouTube</a>
                    </div>
                    <div className="footer-col">
                        <h4>Location</h4>
                        <p>Melbourne<br />South-East, AUS<br />Available Worlwide</p>
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
