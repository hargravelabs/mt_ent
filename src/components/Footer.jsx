import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { client } from '../sanityClient';

const Footer = () => {
    const [companyInfo, setCompanyInfo] = useState({
        email: 'milan@mt-entertainment.com',
        socials: [
            { platform: 'Instagram', url: 'https://www.instagram.com/mt_ent_/' },
        ]
    });

    useEffect(() => {
        const fetchCompanyInfo = async () => {
            try {
                const data = await client.fetch(`*[_type == "companyInfo"][0]`);
                if (data) {
                    setCompanyInfo({
                        email: data.email || 'milan@mt-entertainment.com',
                        socials: data.socials || []
                    });
                }
            } catch (error) {
                console.error("Error fetching company info:", error);
            }
        };

        fetchCompanyInfo();
    }, []);

    const scrollToTop = () => {
        if (window.lenis) {
            window.lenis.scrollTo(0, { duration: 1.5 });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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

            {/* Ambient Noise */}
            <div className="footer-noise"></div>

            <div className="footer-content">
                
                <div className="footer-top">
                    <div className="footer-cta-wrapper">
                        <h2 className="footer-headline">Let's <br />Create.</h2>
                        <div className="footer-action">
                            <p className="footer-subtext">Ready to tell your story? Reach out directly.</p>
                            <a href={`mailto:${companyInfo.email}`} target="_blank" rel="noopener noreferrer" className="email-cta hover-underline">
                                {companyInfo.email}
                                <ArrowUpRight className="cta-icon" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-divider"></div>

                <div className="footer-middle">
                    <div className="footer-col">
                        <span className="col-label">Location</span>
                        <p>Melbourne<br />South-East, AUS</p>
                    </div>
                    
                    <div className="footer-col">
                        <span className="col-label">Contact</span>
                        <div className="social-links">
                            <a href="tel:+6142208093" className="footer-link-text hover-underline">+61 422 080 93</a>
                        </div>
                    </div>
                    
                    <div className="footer-col">
                        <span className="col-label">Socials</span>
                        <div className="social-links">
                            {companyInfo.socials.map((social, index) => (
                                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="footer-link-text hover-underline">
                                    {social.platform}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-copyright">
                        &copy; {new Date().getFullYear()} MT Entertainment.
                    </div>
                    <div className="footer-brand">
                        Website by <a href="https://www.hargravelabs.com/" target="_blank" rel="noopener noreferrer" className="hover-underline">Hargrave Labs</a>
                    </div>
                    <button className="back-to-top" onClick={scrollToTop}>
                        Back to Top &uarr;
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
