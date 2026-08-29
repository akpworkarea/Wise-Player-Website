import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

 useEffect(() => {
  const start = window.scrollY;
  if (start === 0) return;
  const duration = 400; // ms
  const startTime = performance.now();

  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    window.scrollTo(0, start * (1 - eased));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}, [pathname]);

  return null;
};

export default ScrollToTop;