const ROOT_PATH = 'C:\\portfolio';

const structure = {
  portfolio: {
    about: null,
    projects: {
      uni: null,
      personal: null,
    },
    contact: null,
  },
};

const bootLines = [
  "unnecessary terminal [Version 1.0.0]",
  '(c) 2025 Antonio Palmeirim. All rights reserved.',
  '',
  'Starting services...',
  'Mounting drives...',
  'Loading terminal environment...',
  'System ready.',
  '',
  "Type 'help' to get started.",
];

export function createTerminal({ outputEl, inputEl, promptEl, onNavigate }) {
  if (!outputEl || !inputEl || !promptEl) {
    return {
      boot: () => {},
      destroy: () => {},
    };
  }

  const state = { path: ROOT_PATH };
  let bootIndex = 0;
  let bootTimer = null;

  const print = (text, type = 'output-line') => {
    const line = document.createElement('div');
    line.className = type;
    line.textContent = text;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  };

  const getCurrentDir = () => {
    const parts = state.path.split('\\').slice(1);
    return parts.reduce((dir, segment) => dir?.[segment], structure) ?? {};
  };

  const updatePrompt = () => {
    promptEl.textContent = `${state.path}> `;
  };

  const commands = {
    help() {
      print(
        `Available commands:
help          Show this help message
ls            List directory contents
cd [folder]   Change directory
cd ..         Go up one directory
cd /          Return to root directory
open [page]   Open a page (if available in current dir)
clear         Clear the terminal`,
      );
    },
    ls() {
      const dir = getCurrentDir();
      const keys = Object.keys(dir);
      print(keys.length ? keys.join('\n') : '(empty)');
    },
    cd(arg) {
      if (!arg) {
        print('Usage: cd [folder]');
        return;
      }
      const dir = getCurrentDir();
      if (arg === '/') {
        state.path = ROOT_PATH;
      } else if (arg === '..') {
        const parts = state.path.split('\\');
        if (parts.length > 2) parts.pop();
        state.path = parts.join('\\');
      } else if (dir[arg] && typeof dir[arg] === 'object') {
        state.path = `${state.path}\\${arg}`;
      } else {
        print(`The system cannot find the path specified: ${arg}`);
        return;
      }
      updatePrompt();
    },
    open(arg) {
      if (!arg) {
        print('Usage: open [page]');
        return;
      }
      const lower = arg.toLowerCase();
      const dir = getCurrentDir();
      if (!dir[lower] && lower !== 'about' && lower !== 'contact' && lower !== 'projects') {
        print(`Cannot open: ${arg} (not available here)`);
        return;
      }
      if (state.path !== ROOT_PATH) {
        print('Access denied: can only open pages from root directory.');
        return;
      }
      if (lower === 'about' && typeof onNavigate === 'function') {
        onNavigate('/about');
      } else if (lower === 'contact' && typeof onNavigate === 'function') {
        onNavigate('/links');
      } else if (lower === 'projects' && typeof onNavigate === 'function') {
        onNavigate('/projects');
      } else {
        print(`Cannot open: ${arg}`);
      }
    },
    clear() {
      outputEl.innerHTML = '';
    },
  };

  const handleInputKey = (event) => {
    if (event.key !== 'Enter' || inputEl.disabled) return;
    const cmdText = inputEl.value.trim();
    if (!cmdText) return;
    print(`${state.path}> ${cmdText}`, 'info');
    const [cmd, ...args] = cmdText.split(' ');
    const command = commands[cmd.toLowerCase()];
    if (command) command(args[0]);
    else print(`'${cmd}' is not recognized as an internal or external command.`, 'error');
    inputEl.value = '';
  };

  const clearBootTimer = () => {
    if (bootTimer) {
      clearTimeout(bootTimer);
      bootTimer = null;
    }
  };

  const finishBoot = () => {
    clearBootTimer();
    updatePrompt();
    inputEl.disabled = false;
    inputEl.value = '';
    inputEl.focus();
  };

  const showNextBootLine = () => {
    if (bootIndex < bootLines.length) {
      print(bootLines[bootIndex++]);
      bootTimer = setTimeout(showNextBootLine, 350);
    } else {
      finishBoot();
    }
  };

  const boot = () => {
    clearBootTimer();
    outputEl.innerHTML = '';
    inputEl.value = '';
    inputEl.disabled = true;
    inputEl.blur();
    state.path = ROOT_PATH;
    updatePrompt();
    bootIndex = 0;
    showNextBootLine();
  };

  inputEl.addEventListener('keydown', handleInputKey);

  updatePrompt();

  return {
    boot,
    destroy() {
      clearBootTimer();
      inputEl.removeEventListener('keydown', handleInputKey);
    },
  };
}
