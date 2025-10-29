import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTerminal } from '../lib/terminal.js';

export default function TerminalOverlay({ open, onClose }) {
  const overlayRef = useRef(null);
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const promptRef = useRef(null);
  const terminalRef = useRef(null);
  const navigate = useNavigate();
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!outputRef.current || !inputRef.current || !promptRef.current) return undefined;
    terminalRef.current = createTerminal({
      outputEl: outputRef.current,
      inputEl: inputRef.current,
      promptEl: promptRef.current,
      onNavigate: (path) => {
        navigate(path);
        closeRef.current?.();
      },
    });
    return () => {
      terminalRef.current?.destroy();
      terminalRef.current = null;
    };
  }, [navigate]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return undefined;

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        closeRef.current?.();
      }
    };

    if (open) {
      overlay.classList.remove('hidden');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      terminalRef.current?.boot();
      document.addEventListener('keydown', handleKey);
    } else {
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleKey);
    }

    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div
      ref={overlayRef}
      id="terminalOverlay"
      className="terminal-overlay hidden"
      role="dialog"
      aria-modal="true"
      aria-hidden="true"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          closeRef.current?.();
        }
      }}
    >
      <div className="terminal-panel">
        <div id="terminal-container">
          <div id="terminal-output" ref={outputRef} />
          <div id="terminal-input-line">
            <span id="prompt" className="prompt" ref={promptRef} />
            <input
              id="terminal-input"
              type="text"
              autoComplete="off"
              ref={inputRef}
              aria-label="Terminal input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
