import React, { useState, useEffect, useRef } from 'react';
import Hero from '../components/Hero.jsx';
import LatestCollection from '../components/LatestCollection.jsx';
import BestSeller from '../components/BestSeller.jsx';
import OurPolicy from '../components/OurPolicy.jsx';
import NewsLetterBox from '../components/NewsLetterBox.jsx';
import Spinner from '../components/Spinner.jsx';
import SpecialForYou from '../components/SpecialForYou.jsx';

const Home = () => {
  const [loading, setLoading] = useState(true);

  // Refs for scrolling
  const latestRef = useRef(null);
  const bestSellerRef = useRef(null);

  // Function passed to Hero for navigation
  const handleNavigate = (section) => {
    if (section === 'latest' && latestRef.current) {
      latestRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (section === 'best' && bestSellerRef.current) {
      bestSellerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleLoad = () => setLoading(false);

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div style={{ position: 'relative'}}>
        <Hero onNavigate={handleNavigate} />
      </div>
      <SpecialForYou />
      <div ref={latestRef}>
        <LatestCollection />
      </div>
      <div ref={bestSellerRef}>
        <BestSeller />
      </div>
      <OurPolicy />
      <NewsLetterBox />
    </div>
  );
};

export default Home;
