const unboxButton = document.getElementById("unbox-button");

if (unboxButton) {
  unboxButton.addEventListener("click", () => {
    const originalText = "unbox";
    unboxButton.textContent = "not yet.";
    window.setTimeout(() => {
      unboxButton.textContent = originalText;
    }, 1200);
  });
}
