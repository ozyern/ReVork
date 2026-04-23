import { useEffect, useRef } from 'react';
import './Cursor.css';

export default function Cursor() {
  const curRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 900px) and (hover: none) and (pointer: coarse)').matches;
    if (isMobile) return;

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let curX = mouseX, curY = mouseY, ringX = mouseX, ringY = mouseY;
    let isMoving = false;

    const onMouseMove = (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      isMoving = true;
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });

    const render = () => {
      if (isMoving && curRef.current && ringRef.current) {
        curX += (mouseX - curX) * 0.3; curY += (mouseY - curY) * 0.3;
        ringX += (mouseX - ringX) * 0.15; ringY += (mouseY - ringY) * 0.15;
        
        curRef.current.style.transform = `translate3d(${curX - 4}px, ${curY - 4}px, 0)`;
        ringRef.current.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0)`;
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    return () => document.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <>
      <div id="cur" ref={curRef}></div>
      <div id="cur-ring" ref={ringRef}></div>
    </>
  );
}