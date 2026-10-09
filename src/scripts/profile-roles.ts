const roleLine = document.querySelector<HTMLElement>("[data-profile-roles]");

if (roleLine) {
  const roles = Array.from(roleLine.querySelectorAll<HTMLElement>("[data-profile-role]"));
  let currentIndex = 0;
  let inView = false;
  let timer: number | undefined;

  const shimmer = (role: HTMLElement) => role.animate(
    [{ backgroundPosition: "100% 0" }, { backgroundPosition: "0 0" }],
    { duration: 1500, easing: "linear" },
  );

  let animations = [shimmer(roles[currentIndex])];
  animations[0].pause();

  const flip = async () => {
    const previousRole = roles[currentIndex];
    const exit = previousRole.animate(
      [
        { transform: "translateY(0)", opacity: 1, filter: "blur(0)" },
        { transform: "translateY(40%)", opacity: 0, filter: "blur(1px)" },
      ],
      { duration: 300, easing: "ease-out" },
    );
    animations = [exit];
    await exit.finished;

    delete previousRole.dataset.active;
    currentIndex = (currentIndex + 1) % roles.length;
    const nextRole = roles[currentIndex];
    nextRole.dataset.active = "";
    animations = [
      nextRole.animate(
        [
          { transform: "translateY(-20%)", opacity: 0, filter: "blur(1px)" },
          { transform: "translateY(0)", opacity: 1, filter: "blur(0)" },
        ],
        { duration: 300, easing: "ease-out" },
      ),
      shimmer(nextRole),
    ];
  };

  const updatePlayback = () => {
    window.clearInterval(timer);
    const playing = inView && !document.hidden;
    for (const animation of animations) {
      if (animation.playState !== "finished") {
        if (playing) animation.play();
        else animation.pause();
      }
    }
    if (playing) timer = window.setInterval(flip, 3000);
  };

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    updatePlayback();
  });
  observer.observe(roleLine);
  document.addEventListener("visibilitychange", updatePlayback);
}
