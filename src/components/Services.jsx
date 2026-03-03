import React, { useState } from 'react';

const Services = () => {
    const [activeService, setActiveService] = useState('photography');

    const handleServiceHover = (serviceId) => {
        setActiveService(serviceId);
    };

    return (
        <section className="services-section" id="services">
            <div className="services-header">
                <p>Our Offerings</p>
                <h3>Studio Capabilities</h3>
            </div>
            <div className="services-container">

                <div className="services-list">
                    <div className="service-item" onMouseEnter={() => handleServiceHover('photography')}>
                        <span className="service-num">01</span>
                        <div>
                            <h2 className="service-title">Photography</h2>
                        </div>
                    </div>
                    <div className="service-item" onMouseEnter={() => handleServiceHover('videography')}>
                        <span className="service-num">02</span>
                        <div>
                            <h2 className="service-title">Videography</h2>
                        </div>
                    </div>
                    <div className="service-item" onMouseEnter={() => handleServiceHover('cinematography')}>
                        <span className="service-num">03</span>
                        <div>
                            <h2 className="service-title">Cinematography</h2>
                        </div>
                    </div>
                    <div className="service-item" onMouseEnter={() => handleServiceHover('event-media')}>
                        <span className="service-num">04</span>
                        <div>
                            <h2 className="service-title">Event Media</h2>
                        </div>
                    </div>
                </div>

                <div className="media-preview-container">
                    <div className={`service-media-preview ${activeService === 'photography' ? 'active' : ''}`}>
                        <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop" alt="Photography" />
                    </div>
                    <div className={`service-media-preview ${activeService === 'videography' ? 'active' : ''}`}>
                        <img src="https://images.unsplash.com/photo-1594957973877-339ff7bdfeb6?q=80&w=2012&auto=format&fit=crop" alt="Videography" />
                    </div>
                    <div className={`service-media-preview ${activeService === 'cinematography' ? 'active' : ''}`}>
                        <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop" alt="Cinematography" />
                    </div>
                    <div className={`service-media-preview ${activeService === 'event-media' ? 'active' : ''}`}>
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop" alt="Event Media" />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Services;
