(function () {
  const phraseEl = document.getElementById("labels-phrase");
  const layoutEl = phraseEl.closest("main");

  // a word, or the {answer} slot filled with what the reader typed into an ask box
  const WORD_RE = /\{answer\}|[\p{L}\p{N}’']+/gu;
  const ANSWER = "{answer}";
  const ANSWER_KEY = "labels-answer";
  const byId = new Map(PHRASES.map((p) => [p.id, p]));

  function normalize(word) {
    return word.toLowerCase().replace(/[’']/g, "'");
  }

  function countWord(phrase, word) {
    return (phrase.text.match(WORD_RE) || []).filter((w) => normalize(w) === normalize(word)).length;
  }

  // "phraseId:word:n" -> [{ to, lands, landsN }, ...]
  const outgoing = new Map();
  const hasIncoming = new Set();

  function addLink(fromId, l, toId) {
    const key = `${fromId}:${normalize(l.word)}:${l.n || 1}`;
    if (!outgoing.has(key)) outgoing.set(key, []);
    outgoing.get(key).push({ to: toId, lands: l.lands || l.word, landsN: l.landsN || 1 });
    hasIncoming.add(toId);
  }

  PHRASES.forEach((p) => {
    if (p.ask) hasIncoming.add(p.ask.to);
    if (p.all) hasIncoming.add(p.all);
    if (p.next) hasIncoming.add(p.next);
    (p.from || []).forEach((l) => addLink(l.phrase, l, p.id));
    (p.to || []).forEach((l) => {
      if (l.url) {
        const key = `${p.id}:${normalize(l.word)}:${l.n || 1}`;
        if (!outgoing.has(key)) outgoing.set(key, []);
        outgoing.get(key).push({ url: l.url });
      } else {
        addLink(p.id, l, l.phrase);
      }
    });
  });

  // warn about broken links and phrases nothing leads to
  outgoing.forEach((targets, key) => {
    const [fromId, word, n] = key.split(":");
    const source = byId.get(Number(fromId));
    if (!source || countWord(source, word) < Number(n)) console.warn(`labels: "${word}" (#${n}) not found in phrase ${fromId}`);
    targets.forEach((t) => {
      if (t.url) return;
      const target = byId.get(t.to);
      if (!target) console.warn(`labels: phrase ${t.to} does not exist`);
      else if (countWord(target, t.lands) < t.landsN) console.warn(`labels: "${t.lands}" (#${t.landsN}) not found in phrase ${t.to}`);
    });
  });
  PHRASES.slice(1).forEach((p) => {
    if (!hasIncoming.has(p.id)) console.warn(`labels: nothing leads to phrase ${p.id}`);
  });

  // the word to light up when the next render is reached by clicking a word
  let landing = null;

  let answer = "";
  try {
    answer = sessionStorage.getItem(ANSWER_KEY) || "";
  } catch (e) {}

  function currentId() {
    const id = Number(location.hash.slice(1));
    return byId.has(id) ? id : PHRASES[0].id;
  }

  function span(text) {
    const el = document.createElement("span");
    el.textContent = text;
    return el;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // the part of the clicked word that carries over into the landed word:
  // mean -> meaningless keeps all of "mean", labeled -> labels keeps "label"
  function sharedPart(clicked, landed) {
    const c = normalize(clicked);
    const l = normalize(landed);
    const at = l.indexOf(c);
    if (at >= 0) return { at, len: c.length };
    let len = 0;
    while (len < c.length && c[len] === l[len]) len++;
    return { at: 0, len };
  }

  function follow(target, el) {
    const word = el.textContent;
    const from = el.getBoundingClientRect();
    // letters of the clicked word that don't carry over ("ed" in labeled) fade out where they were
    const { len } = target.lands ? sharedPart(word, target.lands) : { len: 0 };
    const ghost =
      len > 0 && len < word.length
        ? { text: word.slice(len), left: from.left + (from.width * len) / word.length, top: from.top, height: from.height }
        : null;
    landing = { ...target, word, from, ghost };
    if (target.to === currentId()) render();
    else location.hash = `#${target.to}`;
  }

  // go to a phrase with nothing carried over: the screen just changes
  function fadeTo(to) {
    landing = { to, fade: true };
    location.hash = `#${to}`;
  }

  // a text box whose answer opens phrase `to`, carrying the typed word over like a clicked one
  function askBox(to) {
    const form = document.createElement("form");
    form.className = "labels-ask";
    const input = document.createElement("input");
    input.className = "labels-input";
    input.type = "text";
    input.maxLength = 40;
    input.autocomplete = "off";
    input.setAttribute("aria-label", "your answer");
    input.spellcheck = false;
    // one word only: spaces can't be typed or pasted in
    input.addEventListener("input", () => {
      const oneWord = input.value.replace(/\s+/g, "");
      if (oneWord !== input.value) input.value = oneWord;
    });
    form.append(input);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      answer = value;
      try {
        sessionStorage.setItem(ANSWER_KEY, value);
      } catch (e) {}
      landing = { to, lands: ANSWER, landsN: 1, word: value, from: input.getBoundingClientRect(), center: true };
      input.blur();
      location.hash = `#${to}`;
    });
    return form;
  }

  function render() {
    const phrase = byId.get(currentId());
    const land = landing && landing.to === phrase.id ? landing : null;
    landing = null;

    // every word and the text between words is its own piece, so each can fade in on its own
    const pieces = [];
    const seen = new Map();
    let last = 0;
    let wordIndex = 0;
    let landIndex = -1;
    for (const match of phrase.text.matchAll(WORD_RE)) {
      if (match.index > last) pieces.push({ el: span(phrase.text.slice(last, match.index)), index: wordIndex });

      const word = normalize(match[0]);
      const shown = match[0] === ANSWER ? answer || "______" : match[0];
      const n = (seen.get(word) || 0) + 1;
      seen.set(word, n);

      const targets = outgoing.get(`${phrase.id}:${word}:${n}`);
      let el;
      if (targets) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        el = document.createElement("a");
        el.className = "link labels-word";
        el.textContent = shown;
        if (target.url) {
          el.href = target.url;
          el.target = "_blank";
          el.rel = "noreferrer";
        } else {
          el.href = `#${target.to}`;
          el.addEventListener("click", (event) => {
            event.preventDefault();
            follow(target, el);
          });
        }
      } else if (phrase.all) {
        el = document.createElement("a");
        el.className = "link labels-word";
        el.textContent = shown;
        el.href = `#${phrase.all}`;
        el.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          fadeTo(phrase.all);
        });
      } else {
        el = span(shown);
      }

      if (land && land.lands && normalize(land.lands) === word && land.landsN === n) {
        landIndex = wordIndex;
        // only the part shared with the clicked word moves; the rest of this word pops in
        const { at, len } = sharedPart(land.word, shown);
        if (len > 0 && len < shown.length) {
          const end = at + len;
          const core = span(shown.slice(at, end));
          core.classList.add("labels-landed");
          el.replaceChildren(
            ...[span(shown.slice(0, at)), core, span(shown.slice(end))].filter((s) => s.textContent)
          );
          el.querySelectorAll(":scope > :not(.labels-landed)").forEach((s) => {
            s.classList.add("labels-rest");
            s.style.animationDelay = "0.7s";
          });
        } else {
          el.classList.add("labels-landed");
        }
      }

      pieces.push({ el, index: wordIndex, isWord: true });
      last = match.index + match[0].length;
      wordIndex++;
    }
    if (last < phrase.text.length) pieces.push({ el: span(phrase.text.slice(last)), index: wordIndex - 1 });
    if (phrase.ask) pieces.push({ el: askBox(phrase.ask.to), index: wordIndex });

    // the rest of the phrase pops in, spreading out from the landed word (or in reading order)
    if (landIndex >= 0) {
      const maxDist = Math.max(landIndex, wordIndex - 1 - landIndex) || 1;
      pieces.forEach((p) => {
        if (p.isWord && p.index === landIndex) return;
        p.el.classList.add("labels-rest");
        const delay =
          phrase.reveal === "order"
            ? 0.7 + p.index * 0.35
            : 0.7 + (Math.abs(p.index - landIndex) / maxDist) * 1.2;
        p.el.style.animationDelay = `${delay}s`;
      });
    } else if (land && land.fade) {
      // nothing carries over: the whole phrase pops in, in reading order
      pieces.forEach((p) => {
        p.el.classList.add("labels-rest");
        p.el.style.animationDelay = `${0.3 + (p.index / (wordIndex || 1)) * 1.6}s`;
      });
    }

    phraseEl.replaceChildren(...pieces.map((p) => p.el));
    layoutEl.classList.toggle("labels-blank", Boolean(phrase.next));

    // start with the landed word exactly where the clicked word was, then glide the phrase to its place
    phraseEl.style.transition = "none";
    phraseEl.style.transform = "";
    const landedEl = phraseEl.querySelector(".labels-landed");
    if (land && land.from && landedEl && !reduceMotion.matches) {
      const to = landedEl.getBoundingClientRect();
      // typed answers sit centered in the box, so line up centers instead of left edges
      const dx = land.center
        ? land.from.left + land.from.width / 2 - (to.left + to.width / 2)
        : land.from.left - to.left;
      const dy = land.from.top + land.from.height / 2 - (to.top + to.height / 2);
      phraseEl.style.transform = `translate(${dx}px, ${dy}px)`;
      phraseEl.getBoundingClientRect();
      phraseEl.style.transition = "";
      phraseEl.style.transform = "";

      if (land.ghost) {
        const ghostEl = span(land.ghost.text);
        ghostEl.className = "labels-ghost";
        ghostEl.style.left = `${land.ghost.left}px`;
        ghostEl.style.top = `${land.ghost.top}px`;
        ghostEl.style.lineHeight = `${land.ghost.height}px`;
        ghostEl.addEventListener("animationend", () => ghostEl.remove());
        document.body.append(ghostEl);
      }
    }
  }

  // on a blank phrase, a click anywhere (except the footer buttons) moves on
  document.addEventListener("click", (event) => {
    const phrase = byId.get(currentId());
    if (!phrase.next || event.target.closest(".page-footer")) return;
    fadeTo(phrase.next);
  });

  window.addEventListener("hashchange", render);
  render();
})();
