import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const SuccessPage = ({
  message = "Your payment was processed successfully!",
  redirectTo = '/orders',
  delay = 4000,
  showCountdown = true
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(Math.floor(delay / 1000));
  const circleRef = useRef(null);
  const checkRef = useRef(null);
  const animationFrame = useRef(null);
  const particlesRef = useRef(null);

  const CIRCLE_SIZE = 120;
  const STROKE_WIDTH = 10;
  const radius = CIRCLE_SIZE / 2 - STROKE_WIDTH / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const redirectTimer = setTimeout(() => navigate(redirectTo), delay);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    runAnimations();
    createParticles();

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownInterval);
      cancelAnimationFrame(animationFrame.current);
      if (particlesRef.current) {
        document.body.removeChild(particlesRef.current);
      }
    };
  }, [delay, redirectTo]);

  const runAnimations = () => {
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;

      // Animate circle (0–500ms)
      if (circleRef.current) {
        const progress = Math.min(elapsed / 500, 1);
        circleRef.current.style.strokeDashoffset = circumference * (1 - easeOutBack(progress));
      }

      // Animate checkmark (after 300ms–800ms)
      if (checkRef.current) {
        const checkElapsed = elapsed - 300;
        if (checkElapsed > 0) {
          const progress = Math.min(checkElapsed / 500, 1);
          checkRef.current.style.strokeDashoffset = 80 * (1 - easeOutElastic(progress));
        }
      }

      if (elapsed < 1000) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);
  };

  const easeOutBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  const easeOutElastic = (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  };

  const createParticles = () => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.overflow = 'hidden';
    container.style.zIndex = '9999';
    particlesRef.current = container;
    document.body.appendChild(container);

    const count = 30;
    const particles = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const size = Math.random() * 8 + 4;
      el.style.position = 'absolute';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundColor = `hsl(${Math.random() * 20 + 140}, 70%, 45%)`;
      el.style.borderRadius = '50%';
      el.style.opacity = Math.random() * 0.6 + 0.3;
      el.style.transform = `translate(${Math.random() * window.innerWidth}px, ${Math.random() * window.innerHeight}px)`;
      container.appendChild(el);

      particles.push({
        el,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: Math.random() * 1.5 - 0.75,
        vy: Math.random() * 1.5 - 0.75,
      });
    }

    const move = () => {
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      });

      requestAnimationFrame(move);
    };

    move();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ position: 'relative', width: CIRCLE_SIZE, height: CIRCLE_SIZE, marginBottom: 32 }}>
        <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          <circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            ref={circleRef}
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={radius}
            fill="none"
            stroke="#10B981"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
          />
        </svg>

        <svg
          width={CIRCLE_SIZE * 0.6}
          viewBox="0 0 80 60"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <path
            ref={checkRef}
            d="M10 30L30 50L70 10"
            stroke="#10B981"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={80}
            strokeDashoffset={80}
          />
        </svg>
      </div>

      <h1 style={{
        fontSize: 'clamp(24px, 5vw, 32px)',
        fontWeight: 600,
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center'
      }}>Order Successful</h1>

      <p style={{
        fontSize: 'clamp(16px, 4vw, 18px)',
        color: '#6b7280',
        marginBottom: 32,
        textAlign: 'center',
        maxWidth: 400,
        lineHeight: 1.5,
        padding: '0 16px'
      }}>{message}</p>

      {showCountdown && (
        <p style={{
          fontSize: 14,
          color: '#9ca3af',
          opacity: 0.8,
          textAlign: 'center'
        }}>
          Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>
      )}
    </div>
  );
};

SuccessPage.propTypes = {
  message: PropTypes.string,
  redirectTo: PropTypes.string,
  delay: PropTypes.number,
  showCountdown: PropTypes.bool,
};

export default SuccessPage;
