(() => {
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
    "Antonio's Portfolio Terminal [Version 1.0.0]",
    '(c) 2025 Antonio Palmeirim. All rights reserved.',
    '',
    'Starting services...',
    'Mounting drives...',
    'Loading terminal environment...',
    'System ready.',
    '',
    "Type 'help' to get started.",
  ];

  const state = {
    path: ROOT_PATH,
  };

  let output;
  let input;
  let promptEl;
  let bootIndex = 0;
  let bootTimer = null;

  const commands = {
    help() {
      print(
        `Available commands:
        help          Show this help message
        ls            List directory contents
        cd [folder]   Change directory
        cd ..         Go up one directory
        cd /          Return to root directory
        open [file]   Open a page (if available in current dir)
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

      if (lower === 'about') {
        window.location.href = 'about.html';
      } else if (lower === 'contact') {
        window.location.href = 'links.html';
      } else if (lower === 'projects') {
        window.location.href = 'projects.html';
      } else {
        print(`Cannot open: ${arg}`);
      }
    },

    clear() {
      if (output) output.innerHTML = '';
    },
  };

  function updatePrompt() {
    if (promptEl) promptEl.textContent = `${state.path}> `;
  }

  function getCurrentDir() {
    const parts = state.path.split('\\').slice(1); // remove drive letter
    let dir = structure;
    parts.forEach((segment) => {
      dir = dir?.[segment];
    });
    return dir || {};
  }

  function print(text, type = 'output-line') {
    if (!output) return;
    const line = document.createElement('div');
    line.className = type;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function handleInputKey(event) {
    if (event.key !== 'Enter' || !input || input.disabled) return;

    const cmdText = input.value.trim();
    if (!cmdText) return;

    print(`${state.path}> ${cmdText}`, 'info');

    const [cmd, ...args] = cmdText.split(' ');
    const command = commands[cmd.toLowerCase()];
    if (command) command(args[0]);
    else print(`'${cmd}' is not recognized as an internal or external command.`, 'error');

    input.value = '';
  }

  function clearBootTimer() {
    if (bootTimer) {
      clearTimeout(bootTimer);
      bootTimer = null;
    }
  }

  function showNextBootLine() {
    if (!output) return;

    if (bootIndex < bootLines.length) {
      print(bootLines[bootIndex++]);
      bootTimer = setTimeout(showNextBootLine, 350);
    } else {
      finishBoot();
    }
  }

  function finishBoot() {
    clearBootTimer();
    updatePrompt();
    if (!input) return;
    input.disabled = false;
    input.removeAttribute('disabled');
    input.value = '';
    input.focus();
  }

  function bootTerminal() {
    if (!output || !input) return;

    clearBootTimer();
    output.innerHTML = '';
    input.value = '';
    input.disabled = true;
    input.blur();
    state.path = ROOT_PATH;
    updatePrompt();
    bootIndex = 0;
    showNextBootLine();
  }

  document.addEventListener('DOMContentLoaded', () => {
    output = document.getElementById('terminal-output');
    input = document.getElementById('terminal-input');
    promptEl = document.getElementById('prompt');

    if (!output || !input || !promptEl) return;

    updatePrompt();
    input.addEventListener('keydown', handleInputKey);

    window.bootTerminal = bootTerminal;
    bootTerminal();
  });
})();

