(function () {
  const SUPABASE_URL = "https://hureorftzhhvjqjonaml.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cmVvcmZ0emhodmpxam9uYW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjAxODgsImV4cCI6MjA5NTgzNjE4OH0.wG_Mo-q3iKRBpcx3NyHRbeA0ySlDhQMpyYc7kRZTdn8";
  const TOKEN_KEY = "click-token";
  const COUNT_KEY_PREFIX = "click-count:";
  const countEl = document.getElementById("click-count");
  const buttonEl = document.getElementById("click-button");
  const crumbsEl = document.getElementById("cookie-crumbs");
  const tokenValueEl = document.getElementById("click-token-value");
  const copyTokenButtonEl = document.getElementById("copy-token-button");
  const tokenImportInputEl = document.getElementById("token-import-input");
  const useTokenButtonEl = document.getElementById("use-token-button");
  const openTokenModalButtonEl = document.getElementById("open-token-modal-button");
  const closeTokenModalButtonEl = document.getElementById("close-token-modal-button");
  const tokenModalEl = document.getElementById("click-token-modal");
  const supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  const COOKIE_COLORS = {
    chip: "#4a2512",
    crumbLight: "#ef9f58",
    crumbMid: "#db8b45",
    crumbDark: "#bf7437",
  };

  function isValidToken(value) {
    return /^[a-f0-9-]{16,64}$/i.test(value);
  }

  function getOrCreateToken() {
    const existing = localStorage.getItem(TOKEN_KEY);
    if (existing && isValidToken(existing)) {
      return existing;
    }
    const token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
    return token;
  }

  function countStorageKey(token) {
    return `${COUNT_KEY_PREFIX}${token}`;
  }

  function readCount(token) {
    const saved = localStorage.getItem(countStorageKey(token));
    const parsed = Number.parseInt(saved ?? "0", 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  function writeCount(token, value) {
    localStorage.setItem(countStorageKey(token), String(value));
  }

  function renderCount(value) {
    if (countEl) {
      countEl.textContent = String(value);
    }
  }

  async function loadRemoteScore(token) {
    if (!supabaseClient) {
      return null;
    }
    const { data, error } = await supabaseClient
      .from("click_scores")
      .select("score")
      .eq("token", token)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const parsed = Number.parseInt(String(data.score), 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }

  async function saveRemoteScore(token, score) {
    if (!supabaseClient) {
      return;
    }
    await supabaseClient
      .from("click_scores")
      .upsert(
        {
          token,
          score,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "token" }
      );
  }

  function spawnCrumbs() {
    if (!crumbsEl) {
      return;
    }

    const crumbsToCreate = 14;
    for (let i = 0; i < crumbsToCreate; i += 1) {
      const crumb = document.createElement("span");
      const startX = 36 + Math.random() * 56;
      const startY = 46 + Math.random() * 28;
      const driftX = (Math.random() - 0.5) * 72;
      const driftY = 36 + Math.random() * 50;
      const duration = 220 + Math.random() * 170;

      crumb.className = "cookie-crumb";
      crumb.style.left = `${startX}px`;
      crumb.style.top = `${startY}px`;
      const roll = Math.random();
      if (roll < 0.2) {
        crumb.style.background = COOKIE_COLORS.chip;
      } else if (roll < 0.55) {
        crumb.style.background = COOKIE_COLORS.crumbDark;
      } else if (roll < 0.85) {
        crumb.style.background = COOKIE_COLORS.crumbMid;
      } else {
        crumb.style.background = COOKIE_COLORS.crumbLight;
      }
      crumb.style.setProperty("--crumb-x", `${driftX}px`);
      crumb.style.setProperty("--crumb-y", `${driftY}px`);
      crumb.style.animationDuration = `${duration}ms`;

      crumbsEl.appendChild(crumb);
      window.setTimeout(() => {
        crumb.remove();
      }, duration + 30);
    }
  }

  function animateCrumble() {
    buttonEl.classList.remove("is-crumbling");
    void buttonEl.offsetWidth;
    buttonEl.classList.add("is-crumbling");
    window.setTimeout(() => {
      buttonEl.classList.remove("is-crumbling");
    }, 90);
  }

  if (!buttonEl || !countEl || !crumbsEl || !tokenModalEl) {
    return;
  }

  let activeToken = getOrCreateToken();
  let count = readCount(activeToken);
  renderCount(count);
  if (tokenValueEl) {
    tokenValueEl.textContent = activeToken;
  }

  if (openTokenModalButtonEl) {
    openTokenModalButtonEl.addEventListener("click", () => {
      tokenModalEl.hidden = false;
    });
  }

  if (closeTokenModalButtonEl) {
    closeTokenModalButtonEl.addEventListener("click", () => {
      tokenModalEl.hidden = true;
    });
  }

  tokenModalEl.addEventListener("click", (event) => {
    if (event.target === tokenModalEl) {
      tokenModalEl.hidden = true;
    }
  });

  loadRemoteScore(activeToken).then((remoteScore) => {
    if (remoteScore === null) {
      saveRemoteScore(activeToken, count);
      return;
    }
    count = remoteScore;
    renderCount(count);
    writeCount(activeToken, count);
  });

  buttonEl.addEventListener("click", () => {
    count += 1;
    renderCount(count);
    writeCount(activeToken, count);
    saveRemoteScore(activeToken, count);
    animateCrumble();
    spawnCrumbs();
  });

  if (copyTokenButtonEl) {
    copyTokenButtonEl.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(activeToken);
        copyTokenButtonEl.textContent = "copied";
      } catch (error) {
        copyTokenButtonEl.textContent = "copy failed";
      }
      window.setTimeout(() => {
        copyTokenButtonEl.textContent = "copy";
      }, 900);
    });
  }

  if (useTokenButtonEl && tokenImportInputEl) {
    useTokenButtonEl.addEventListener("click", () => {
      const nextToken = tokenImportInputEl.value.trim();
      if (!isValidToken(nextToken)) {
        useTokenButtonEl.textContent = "invalid token";
        window.setTimeout(() => {
          useTokenButtonEl.textContent = "load";
        }, 900);
        return;
      }

      activeToken = nextToken;
      localStorage.setItem(TOKEN_KEY, activeToken);
      count = readCount(activeToken);
      renderCount(count);
      if (tokenValueEl) {
        tokenValueEl.textContent = activeToken;
      }
      loadRemoteScore(activeToken).then((remoteScore) => {
        if (remoteScore === null) {
          saveRemoteScore(activeToken, count);
          return;
        }
        count = remoteScore;
        renderCount(count);
        writeCount(activeToken, count);
      });
      tokenImportInputEl.value = "";
      useTokenButtonEl.textContent = "token loaded";
      window.setTimeout(() => {
        useTokenButtonEl.textContent = "load";
      }, 900);
    });
  }
})();
