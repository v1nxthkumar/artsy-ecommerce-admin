import React, { useState, useEffect }from 'react';
import Title from '../components/Title.jsx';
import { assets } from '../assets/assets.js';
import { motion } from 'framer-motion';
import NewsLetterBox from '../components/NewsLetterBox.jsx';
import {
  Star,
  Users,
  CheckCircle,
  Globe,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import TimelineCircle from '../components/TimelineCircle.jsx';
import Spinner from '../components/Spinner.jsx';

const About = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const handleLoad = () => setLoading(false);

    if (document.readyState === 'complete') {
      // If already loaded
      handleLoad();
    } else {
      // Wait for the page to fully load
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
    <div className="px-4 md:px-12 lg:px-20 bg-white text-gray-900">

      {/* Header Summary */}
      <section className="text-center py-16 max-w-3xl mx-auto">
        <Title
          lead="About Us"
          headline="Style Meets Soul"
          subline="Driven by design. Defined by you."
        />
      </section>

      {/* About Introduction */}
      <section className="flex flex-col md:flex-row gap-12 mb-20 items-center">
        <img
          src={assets.about_img}
          alt="About Us"
          className="w-full md:max-w-[500px] rounded-xl shadow-lg"
        />
        <div className="flex flex-col gap-6 md:w-2/4">
          <Title text1="ABOUT" text2="US" />
          <p className="text-lg text-gray-700 leading-relaxed">
            We are a multidisciplinary team of creatives, engineers, and strategists passionate about delivering impactful digital solutions. Every decision—from concept to code—is informed by data, user insight, and a relentless pursuit of excellence.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-12 mb-24">
        <div className="p-8 border rounded-lg shadow-sm bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
          <p className="text-gray-600">
            To design and deliver purposeful digital experiences that solve real-world problems, foster human connection, and enable sustainable growth.
          </p>
        </div>
        <div className="p-8 border rounded-lg shadow-sm bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
          <p className="text-gray-600">
            To become the global innovation partner of choice — known for our integrity, creativity, and transformative impact.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <Title text1="OUR" text2="JOURNEY" />
        </div>
        <TimelineCircle />
      </section>

      {/* Why Choose Us */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <Title text1="WHY" text2="CHOOSE US" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Star size={28} />,
              title: 'Excellence at Every Step',
              desc: 'We push the boundaries of innovation and quality from start to finish.'
            },
            {
              icon: <CheckCircle size={28} />,
              title: 'End-to-End Partnership',
              desc: 'We provide comprehensive support — from ideation to launch and beyond.'
            },
            {
              icon: <Users size={28} />,
              title: 'Client-First Mindset',
              desc: 'Your goals drive our solutions. We listen, adapt, and deliver accordingly.'
            }
          ].map((item, index) => (
            <div key={index} className="p-8 border rounded-lg shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-4 text-indigo-600">
                {item.icon}
                <h4 className="text-lg font-medium text-gray-900">{item.title}</h4>
              </div>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <Title text1="OUR" text2="VALUES" />
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: <Globe size={28} />,
              label: 'Global Perspective',
              desc: 'We navigate international markets with cultural fluency and strategic insight.'
            },
            {
              icon: <ShieldCheck size={28} />,
              label: 'Integrity & Transparency',
              desc: 'We build trust through open communication and consistent delivery.'
            },
            {
              icon: <TrendingUp size={28} />,
              label: 'Continuous Growth',
              desc: 'We evolve with emerging tech, market trends, and our clients’ ambitions.'
            }
          ].map((value, index) => (
            <div key={index} className="bg-gray-50 p-8 border rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-indigo-600">
                {value.icon}
                <h4 className="text-lg font-medium text-gray-900">{value.label}</h4>
              </div>
              <p className="text-gray-600">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section className="flex flex-wrap justify-around text-center py-16 border-t border-b mb-20">
        {[
          { stat: '15K+', label: 'Active Clients' },
          { stat: '50+', label: 'Countries Served' },
          { stat: '100%', label: 'Satisfaction Rate' }
        ].map((item, index) => (
          <div key={index} className="m-6">
            <h3 className="text-4xl font-bold text-gray-900">{item.stat}</h3>
            <p className="text-gray-500 text-sm">{item.label}</p>
          </div>
        ))}
      </section>

      {/* Newsletter CTA */}
      <NewsLetterBox />
    </div>
  );
};

export default About;
