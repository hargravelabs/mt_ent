import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const projects = [
    {
        id: 1,
        title: "The Fall Collection",
        client: "Acme Corp",
        type: "Videography",
        img: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=2940&auto=format&fit=crop",
        col: "col-span-12 md:col-span-8",
        height: "h-[500px] md:h-[800px]",
        mt: "mt-0"
    },
    {
        id: 2,
        title: "Alpine Escape",
        client: "Peak Gear",
        type: "Event Media",
        img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2948&auto=format&fit=crop",
        col: "col-span-12 md:col-span-4",
        height: "h-[400px] md:h-[500px]",
        mt: "md:mt-[300px]"
    },
    {
        id: 3,
        title: "Urban Dynamics",
        client: "Metro",
        type: "Photography",
        img: "https://images.unsplash.com/photo-1493606371202-6275828f90f3?q=80&w=2940&auto=format&fit=crop",
        col: "col-span-12 md:col-span-5",
        height: "h-[450px] md:h-[600px]",
        mt: "md:-mt-[100px]"
    },
    {
        id: 4,
        title: "Silent Symphony",
        client: "SoundHouse",
        type: "Cinematography",
        img: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=2940&auto=format&fit=crop",
        col: "col-span-12 md:col-span-7",
        height: "h-[500px] md:h-[700px]",
        mt: "mt-12 md:mt-[100px]"
    }
];

const Works = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const y4 = useTransform(scrollYProgress, [0, 1], [0, -250]);

    const getParallaxY = (id) => {
        switch (id) {
            case 1: return y1;
            case 2: return y2;
            case 3: return y3;
            case 4: return y4;
            default: return y1;
        }
    };

    return (
        <section id="works" ref={containerRef} className="bg-mt-black text-mt-white w-full py-24 md:py-40 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-16">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 border-b border-mt-gray/20 pb-12">
                    <h2 className="font-display text-4xl md:text-5xl font-light uppercase tracking-widest text-mt-white/90">
                        Selected Works
                    </h2>
                    <button className="mt-8 md:mt-0 font-sans text-xs tracking-[0.2em] font-medium uppercase px-6 py-3 border border-mt-white/30 rounded-full hover:bg-mt-white hover:text-mt-black transition-all duration-300">
                        View All Projects
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-8 md:gap-12 relative">
                    {projects.map((project) => (
                        <motion.div
                            key={project.id}
                            style={{ y: getParallaxY(project.id) }}
                            className={`${project.col} ${project.mt} flex flex-col group cursor-none project-card relative z-10`}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className={`w-full overflow-hidden ${project.height}`}>
                                <img
                                    src={project.img}
                                    alt={project.title}
                                    className="w-full h-full object-cover transform transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 filter grayscale-[80%] brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
                                />
                            </div>
                            <div className="pt-6 flex justify-between items-start">
                                <div>
                                    <h3 className="font-display text-2xl font-light tracking-tight text-mt-white">{project.title}</h3>
                                    <p className="font-sans text-sm text-mt-gray mt-2 font-light">{project.client}</p>
                                </div>
                                <div className="font-sans text-xs uppercase tracking-widest text-mt-white/50 hidden md:block">
                                    {project.type}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Works;
