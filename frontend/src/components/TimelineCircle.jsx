import React, { useEffect, useState, useRef } from 'react';

const timelineEvents = [
  { year: 2015, text: 'Established as a local boutique offering handpicked fashion items.' },
  { year: 2016, text: 'Launched our first curated online fashion store.' },
  { year: 2017, text: 'Introduced seasonal lookbooks and partnered with influencers.' },
  { year: 2018, text: 'Expanded product range to include accessories and footwear.' },
  { year: 2019, text: 'Released our mobile shopping app on iOS and Android.' },
  { year: 2020, text: 'Launched virtual try-on features for selected garments.' },
  { year: 2021, text: 'Achieved carbon neutrality and adopted sustainable packaging.' },
  { year: 2022, text: 'Enabled international shipping and opened pop-up stores globally.' },
  { year: 2023, text: 'Introduced AI-powered stylist and personalized recommendations.' },
  { year: 2024, text: 'Reached one million customers with a global fashion campaign.' },
];

const CircularTimeline = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ size: 800, radius: 280, center: 400 });
  const touchStart = useRef(null);

  const total = timelineEvents.length;
  const anglePerItem = 360 / total;
  const rotationAngle = -selectedIndex * anglePerItem;

  // Responsive resizing
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({ size: 300, radius: 100, center: 150 });
      } else if (width < 1024) {
        setDimensions({ size: 500, radius: 180, center: 250 });
      } else {
        setDimensions({ size: 800, radius: 280, center: 400 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(interval);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev + 1) % total);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev - 1 + total) % total);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [total]);

  // Touch swipe logic
  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStart.current;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setSelectedIndex((prev) => (prev - 1 + total) % total);
      } else {
        setSelectedIndex((prev) => (prev + 1) % total);
      }
    }
    touchStart.current = null;
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center bg-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative"
        style={{
          width: `${dimensions.size}px`,
          height: `${dimensions.size}px`,
        }}
      >
        {/* Rotating ring */}
        <div
          className="absolute w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `rotate(${rotationAngle}deg)` }}
        >
          {timelineEvents.map((event, index) => {
            const angle = (index * anglePerItem - 90) * (Math.PI / 180);
            const x = dimensions.center + dimensions.radius * Math.cos(angle);
            const y = dimensions.center + dimensions.radius * Math.sin(angle);
            const isActive = selectedIndex === index;

            return (
              <div
                key={event.year}
                className="absolute flex flex-col items-center cursor-pointer"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) rotate(${-rotationAngle}deg)`,
                }}
                onClick={() => setSelectedIndex(index)}
              >
                <span
                  className={`text-[10px] sm:text-xs mb-1 ${
                    isActive ? 'text-gray-800 font-semibold' : 'text-gray-400'
                  }`}
                >
                  {event.year}
                </span>
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive ? 'w-3 h-3 bg-black' : 'w-2 h-2 bg-gray-400'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Center card */}
        <div
          className="absolute top-1/2 left-1/2 text-center p-4 sm:p-6 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 shadow-lg transition-all duration-700 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            width: dimensions.size < 400 ? '220px' : '300px',
          }}
        >
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">
            {timelineEvents[selectedIndex].year}
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            {timelineEvents[selectedIndex].text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CircularTimeline;
