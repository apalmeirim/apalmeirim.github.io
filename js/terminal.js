document.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("terminal-output");
  const input = document.getElementById("terminal-input");

  const state = {
    path: "C:\\portfolio",
    structure: {
      portfolio: {
        about: null,
        projects: {
          uni: null,
          personal: null
        },
        contact: null
      }
    }
  };

  const promptEl = document.getElementById("prompt");
    function updatePrompt() {
    // Single-line prompt
    promptEl.textContent = `${state.path}> `;
  }

  const commands = {
    help() {
        print(`Available commands:
        help          Show this help message
        ls            List directory contents
        cd [folder]   Change directory
        cd ..         Go up one directory
        cd /          Return to root directory
        open [file]   Open a page (if available in current dir)
        clear         Clear the terminal`);
    },
    ls() {
      const dir = getCurrentDir();
      const keys = Object.keys(dir);
      print(keys.length ? keys.join("\n") : "(empty)");
    },

    
    cd(arg) {
        if (!arg) return print("Usage: cd [folder]");

        const dir = getCurrentDir();

        if (arg === "/") {
            // go back to root
            state.path = "C:\\portfolio";
        } 
        else if (arg === "..") {
            // go up one level
            const split = state.path.split("\\");
            if (split.length > 2) split.pop();
            state.path = split.join("\\");
        } 
        else if (dir[arg] && typeof dir[arg] === "object") {
            // valid folder in current directory
            state.path += "\\" + arg;
        } 
        else {
            print(`The system cannot find the path specified: ${arg}`);
            return;
        }

        updatePrompt();
        },
    

    open(arg) {
        if (!arg) return print("Usage: open [page]");

        const dir = getCurrentDir();
        const lower = arg.toLowerCase();

        // Only allow open if the current directory contains that file/key
        if (!dir[lower] && lower !== "about" && lower !== "contact" && lower !== "projects") {
            return print(`Cannot open: ${arg} (not available here)`);
        }

        // Only root allows navigation pages
        if (state.path !== "C:\\portfolio") {
            return print("Access denied: can only open pages from root directory.");
        }

        // Otherwise open the correct page
        if (lower === "about") window.location.href = "about.html";
        else if (lower === "contact") window.location.href = "contact.html";
        else if (lower === "projects") window.location.href = "projects.html";
        else print(`Cannot open: ${arg}`);
    },

    clear() {
      output.innerHTML = "";
    }
  };

  // helper: current dir
  function getCurrentDir() {
    const pathParts = state.path.split("\\").slice(1); // remove C:
    let dir = state.structure;
    pathParts.forEach(p => dir = dir[p]);
    return dir || {};
  }

  // helper: print to terminal
  function print(text, type = "output-line") {
    const line = document.createElement("div");
    line.className = type;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  // process input
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const cmdText = input.value.trim();
      if (!cmdText) return;

      print(`${state.path}> ${cmdText}`, "info");

      const [cmd, ...args] = cmdText.split(" ");
      const command = commands[cmd.toLowerCase()];
      if (command) command(args[0]);
      else print(`'${cmd}' is not recognized as an internal or external command.`, "error");

      input.value = "";
    }
  });

  // startup message
  const bootLines = [
    "Antonio's Portfolio Terminal [Version 1.0.0]",
    "(c) 2025 Antonio Palmeirim. All rights reserved.",
    "",
    "Starting services...",
    "Mounting drives...",
    "Loading terminal environment...",
    "System ready.",
    "",
    "Type 'help' to get started."
    ];

    let bootIdx = 0;

    // Disable input during boot
    input.disabled = true;
    input.blur();
    output.innerHTML = "";

    function showNextBootLine() {
    if (bootIdx < bootLines.length) {
        print(bootLines[bootIdx++]);
        setTimeout(showNextBootLine, 350);
    } else {
        finishBoot();
    }
    }

    function finishBoot() {
    updatePrompt();

    // Explicitly re-enable input
    input.disabled = false;
    input.removeAttribute("disabled");
    input.value = "";
    input.focus();

    // Safety: reattach keydown listener here
    input.addEventListener("keydown", onInputKey);

    output.scrollTop = output.scrollHeight;
    }

    // Start boot sequence
    showNextBootLine();

    // Separate handler function (so we can attach after boot)
    function onInputKey(e) {
    if (e.key === "Enter") {
        const cmdText = input.value.trim();
        if (!cmdText) return;

        print(`${state.path}> ${cmdText}`, "info");

        const [cmd, ...args] = cmdText.split(" ");
        const command = commands[cmd.toLowerCase()];
        if (command) command(args[0]);
        else print(`'${cmd}' is not recognized as an internal or external command.`, "error");

        input.value = "";
    }
    }
    
});

