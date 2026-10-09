const setupPronunciation = () => {
  const button = document.querySelector<HTMLButtonElement>("[data-pronunciation]");
  const audio = document.querySelector<HTMLAudioElement>("[data-pronunciation-audio]");
  const status = document.querySelector<HTMLElement>("[data-pronunciation-status]");
  if (!button || !audio || !status) return;

  const waves = button.querySelectorAll<SVGPathElement>("[data-pronunciation-wave]");
  let playbackRequest = 0;

  const stop = () => {
    playbackRequest++;
    audio.pause();
    audio.currentTime = 0;
  };

  button.addEventListener("click", () => {
    stop();
    const request = playbackRequest;
    status.hidden = true;
    waves.forEach((wave, index) => {
      wave.getAnimations().forEach((animation) => animation.cancel());
      wave.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 150, delay: 100 * (index + 1), fill: "backwards" },
      );
    });

    void audio.play().catch(() => {
      if (request !== playbackRequest) return;
      status.hidden = false;
      status.textContent = "Pronunciation could not play. Please try again.";
    });
  });

  button.hidden = false;
  button.disabled = !audio.getAttribute("src");
  if (button.disabled) button.title = "Pronunciation unavailable";
  window.addEventListener("pagehide", stop);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
};

setupPronunciation();
