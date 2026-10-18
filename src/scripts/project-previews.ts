type DataSavingNavigator = Navigator & { connection?: { saveData?: boolean } };

const saveData = (navigator as DataSavingNavigator).connection?.saveData === true;

document.querySelectorAll<HTMLVideoElement>("video[data-project-preview]").forEach((video) => {
  let visible = false;
  let manuallyPaused = false;

  const syncPlayback = () => {
    if (!visible || document.hidden) {
      video.pause();
    } else if (!saveData && !manuallyPaused) {
      // Native controls remain available when the browser declines autoplay.
      void video.play().catch(() => undefined);
    }
  };

  video.addEventListener("pause", () => {
    if (visible && !document.hidden) manuallyPaused = true;
  });
  video.addEventListener("play", () => { manuallyPaused = false; });
  document.addEventListener("visibilitychange", syncPlayback);
  window.addEventListener("pagehide", () => video.pause());

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  }, { threshold: 0.2 });
  observer.observe(video);
});
