import { useEffect, useRef } from 'react';
import Footer from '../components/Footer.jsx';
import { createLinksSimulation } from '../lib/linksSimulation.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function LinksPage() {
  const canvasRef = useRef(null);
  const gravityBtnRef = useRef(null);
  const popupRef = useRef(null);
  const popupTextRef = useRef(null);
  const popupButtonsRef = useRef(null);

  usePageTitle('links');

  useEffect(() => {
    const instance = createLinksSimulation({
      canvas: canvasRef.current,
      gravityButton: gravityBtnRef.current,
      popup: popupRef.current,
      popupText: popupTextRef.current,
      popupButtons: popupButtonsRef.current,
    });
    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <>
      <main>
        <h1>links</h1>
        <div className="contact-canvas-wrap">
          <canvas id="world" ref={canvasRef} />
        </div>
        <p className="hint">drag the blocks - throw them - or click a block to open the contact link.</p>
        <div className="contact-controls">
          <button id="gravityBtn" ref={gravityBtnRef} type="button">
            Toggle Gravity
          </button>
        </div>
        <div id="popup" ref={popupRef} className="popup hidden">
          <div className="popup-content">
            <p id="popupText" ref={popupTextRef} />
            <div id="popupButtons" ref={popupButtonsRef} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
