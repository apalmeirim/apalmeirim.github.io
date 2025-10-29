import { useEffect, useRef } from 'react';
import { createRunnerGame } from '../lib/runner.js';

export default function RunnerGate({ open, onClose }) {
  const overlayRef = useRef(null);
  const canvasRef = useRef(null);
  const scoreRef = useRef(null);
  const runnerRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!canvasRef.current || !scoreRef.current) return undefined;
    runnerRef.current = createRunnerGame({
      canvas: canvasRef.current,
      scoreEl: scoreRef.current,
      onRequestClose: () => closeRef.current?.(),
    });
    return () => {
      runnerRef.current?.destroy();
      runnerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !runnerRef.current) return;

    if (open) {
      overlay.classList.remove('hidden');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      runnerRef.current.open();
    } else {
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      runnerRef.current.close();
    }
  }, [open]);

  return (
    <div
      ref={overlayRef}
      id="gameGate"
      className="gate-overlay hidden"
      role="dialog"
      aria-modal="true"
      aria-hidden="true"
      onClick={(event) => {
        if (event.target === overlayRef.current) closeRef.current?.();
      }}
    >
      <div className="gate-panel" role="document">
        <h1 id="runnerGameTitle">scratch cat runner</h1>
        <p className="gate-sub">
          tap, click, or press <span className="key">space</span> / <span className="key">cmd+`</span> to jump.
          rack up as many points as you like!
        </p>
        <div className="runner-wrap">
          <canvas
            id="runner"
            ref={canvasRef}
            width={800}
            height={240}
            aria-label="Runner game"
          />
          <div className="hud">
            <div className="score">
              SCORE: <span id="scoreVal" ref={scoreRef}>0</span>
            </div>
          </div>
        </div>
        <div className="gate-cta">
          <button
            id="resetBtn"
            className="ui-btn"
            type="button"
            onClick={() => runnerRef.current?.reset()}
          >
            reset
          </button>
          <button
            id="closeGameBtn"
            className="ui-btn"
            type="button"
            onClick={() => closeRef.current?.()}
          >
            close
          </button>
        </div>
      </div>
    </div>
  );
}
