import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { assets } from '../assets/assets';
import clsx from 'clsx';

const Hero = ({ onNavigate }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const colors = {
    champagne: '#F7E7CE',
    blush: '#F8CECC',
    lavender: '#E6E6FA',
    mint: '#C8E8E4',
    pearl: '#F8F8F8',
    gold: '#D4AF37',
    roseGold: '#B76E79',
    deepBlue: '#1A1A2E',
    emerald: '#2E8B57'
  };

  const collections = [
    {
      id: 1,
      title: "Next Wave",
      subline: "Lead the Trend",
      image: assets.hero_img,
      action: () => onNavigate?.('latest'), // scroll to latest section
      accentColor: colors.lavender
    },
    {
      id: 2,
      title: "Best Sellers",
      subline: "Flying Off the Shelves",
      image: assets.hero_img2,
      action: () => onNavigate?.('best'), // scroll to best seller
      accentColor: colors.mint
    },
    {
      id: 3,
      title: "Timeless Chic",
      subline: "Dresses for Every Moment",
      image: assets.hero_img3,
      action: () => navigate('/collection'),
      accentColor: colors.blush
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const floatingElements = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % collections.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    floatingElements.current.forEach((element) => {
      if (!element) return;
      const randomX = (Math.random() * 200 - 100) / 2;
      const randomY = (Math.random() * 200 - 100) / 2;
      const randomRotate = Math.random() * 360;
      const duration = 20000 + Math.random() * 10000;

      element.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 0.3 },
          { transform: `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`, opacity: 0.8 },
          { transform: `translate(${-randomX}px, ${-randomY}px) rotate(${randomRotate * 2}deg)`, opacity: 0.4 }
        ],
        {
          duration,
          iterations: Infinity,
          direction: 'alternate',
          easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
        }
      );
    });
  }, []);

  const Title = ({ headline, subline }) => (
    <div className="max-w-screen-xl mx-auto text-center text-white">
      <div className="relative inline-block group">
        <h2
          className={clsx(
            'kaushan-script-regular font-normal leading-none m-0 relative z-10 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]',
            'text-[4rem] sm:text-[3rem] md:text-[5rem] lg:text-[8rem]',
            "after:content-[''] after:absolute after:bottom-[5px] after:left-0 after:w-full after:h-[2px] after:bg-white after:transform after:scale-x-0 after:origin-right"
          )}
          data-text={headline}
        >
          {headline}
        </h2>
      </div>
      {subline && (
        <div className="flex items-center justify-center gap-6">
          <div className="h-px w-[60px] bg-gradient-to-r from-transparent via-white to-transparent" />
          <p className={clsx(
            'kaushan-script-regular tracking-[0.2em] font-medium whitespace-nowrap text-white',
            'text-[1rem] sm:text-[0.75rem] md:text-[1rem] lg:text-[1.2rem]'
          )}>
            {subline}
          </p>
          <div className="h-px w-[60px] bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: colors.pearl }}
    >

      {/* Aspect ratio wrapper */}
      <div className="relative w-full pt-[100%] sm:pt-[75%] md:pt-[56.25%] lg:pt-[40%] xl:pt-[33.33%]">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Clickable hero */}
          <div
            className="absolute inset-0 cursor-pointer z-20"
            onClick={collections[activeIndex].action}
          >
            <motion.div style={{ y: yBg, scale: scaleBg }} className="absolute inset-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={collections[activeIndex].id}
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 2, ease: [0.25, 0.1, 0.25, 1] } }}
                  exit={{ opacity: 1, transition: { duration: 2, ease: [0.25, 0.1, 0.25, 1] } }}
                >
                  <img
                    src={collections[activeIndex].image}
                    alt={collections[activeIndex].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />
                  <div
                    className="absolute inset-0 mix-blend-overlay opacity-20 pointer-events-none"
                    style={{
                      background: `linear-gradient(45deg, ${collections[activeIndex].accentColor} 0%, rgba(255,255,255,0.1) 50%, ${collections[activeIndex].accentColor} 100%)`
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(25)].map((_, i) => {
                const randomSize = Math.random() * 20 + 10;
                const randomShape = Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm';
                const randomColor = [colors.champagne, colors.blush, colors.lavender, colors.mint, colors.gold, colors.deepBlue][Math.floor(Math.random() * 6)];
                return (
                  <div
                    key={i}
                    ref={el => (floatingElements.current[i] = el)}
                    className={`absolute ${randomShape} opacity-40`}
                    style={{
                      width: `${randomSize}px`,
                      height: `${randomSize}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      backgroundColor: randomColor,
                      filter: 'blur(1px)',
                      boxShadow: `0 0 10px ${randomColor}`
                    }}
                  />
                );
              })}
            </div>

            {/* Subtle particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(100)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: colors.pearl,
                    opacity: 0.3
                  }}
                  animate={{
                    x: [0, Math.random() * 10 - 5],
                    y: [0, Math.random() * 10 - 5],
                    opacity: [0.1, 0.5, 0.1],
                    transition: {
                      duration: 5 + Math.random() * 10,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                />
              ))}
            </div>

            {/* Title */}
            <div className="relative z-10 flex flex-col justify-center h-full px-4 sm:px-6 md:px-10 lg:px-16 py-12">
              <Title
                headline={collections[activeIndex].title}
                subline={collections[activeIndex].subline}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
