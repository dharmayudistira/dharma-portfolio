const sessionKey = "dharma:intro-seen";
const intro = document.querySelector<HTMLElement>(".intro");

if (intro) {
  const hasPlayed = (() => {
    try {
      return sessionStorage.getItem(sessionKey) === "1";
    } catch {
      return false;
    }
  })();

  if (hasPlayed) {
    document.documentElement.dataset.intro = "seen";
    intro.remove();
  } else {
    try {
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      // The animation can still play when storage is unavailable.
    }

    document.documentElement.dataset.intro = "playing";

    const start = async () => {
      const hand = intro.querySelector<HTMLImageElement>(".intro__hand");

      if (!hand) {
        finishIntro();
        return;
      }

      await decodeImage(hand);

      const { gsap } = await import("gsap");
      const mode = intro.dataset.introMode;

      if (mode === "home") {
        await playHomeIntro(gsap);
      } else {
        playShellIntro(gsap);
      }
    };

    start().catch(finishIntro);
  }
}

function finishIntro() {
  document.documentElement.dataset.intro = "seen";
  intro?.remove();
}

async function decodeImage(image: HTMLImageElement) {
  if (typeof image.decode === "function") {
    await image.decode().catch(() => undefined);
    return;
  }

  if (image.complete) return;

  await new Promise<void>((resolve) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => resolve(), { once: true });
  });
}

const waitForLayout = () => new Promise<void>((resolve) => {
  requestAnimationFrame(() => resolve());
});

async function playHomeIntro(
  gsap: typeof import("gsap").gsap,
) {
  const mat = intro?.querySelector<HTMLElement>(".intro__mat");
  const drawing = intro?.querySelector<HTMLElement>(".intro__drawing");
  const handAnchor = intro?.querySelector<HTMLElement>(".intro__hand-anchor");
  const heroContent = document.querySelector<HTMLElement>(".hero__content");
  const heroRatio = document.querySelector<SVGSVGElement>("[data-hero-ratio]");

  if (!intro || !mat || !drawing || !handAnchor || !heroContent || !heroRatio) {
    finishIntro();
    return;
  }

  const introRatio = heroRatio.cloneNode(true) as SVGSVGElement;
  introRatio.classList.replace("hero__golden-ratio", "intro__golden-ratio");
  introRatio.removeAttribute("data-hero-ratio");
  drawing.append(introRatio);

  const ratioGuides = introRatio.querySelector<SVGGElement>("[data-ratio-guides]");
  const ratioCurve = introRatio.querySelector<SVGPathElement>("[data-ratio-curve]");

  if (!ratioGuides || !ratioCurve) {
    finishIntro();
    return;
  }

  await waitForLayout();

  if (!intro.isConnected) return;

  const heroBounds = heroContent.getBoundingClientRect();
  const targetGridSize = 48;
  const gridColumns = Math.max(1, Math.round(heroBounds.width / targetGridSize));
  const gridSize = heroBounds.width / gridColumns;
  const majorInterval = 5;
  const fragment = document.createDocumentFragment();

  const addLine = (
    orientation: "vertical" | "horizontal",
    position: number,
    index: number,
    isAnchor = false,
  ) => {
    const line = document.createElement("span");
    const isMajor = index % majorInterval === 0;

    line.className = [
      "intro__line",
      `intro__line--${orientation}`,
      isMajor ? "intro__line--major" : "",
      isAnchor ? "intro__line--anchor" : "",
    ]
      .filter(Boolean)
      .join(" ");

    line.style[orientation === "vertical" ? "left" : "top"] = `${position}px`;
    fragment.append(line);
  };

  for (let index = 0, x = heroBounds.left; x >= 0; index += 1, x -= gridSize) {
    addLine("vertical", x, index, index === 0);
  }

  for (
    let index = 1, x = heroBounds.left + gridSize;
    x <= window.innerWidth;
    index += 1, x += gridSize
  ) {
    addLine("vertical", x, index, Math.abs(x - heroBounds.right) < 0.5);
  }

  for (let index = 0, y = heroBounds.top; y >= 0; index += 1, y -= gridSize) {
    addLine("horizontal", y, index, index === 0);
  }

  for (
    let index = 1, y = heroBounds.top + gridSize;
    y <= window.innerHeight;
    index += 1, y += gridSize
  ) {
    addLine("horizontal", y, index);
  }

  mat.append(fragment);

  const verticalLines = mat.querySelectorAll<HTMLElement>(".intro__line--vertical");
  const horizontalLines = mat.querySelectorAll<HTMLElement>(".intro__line--horizontal");
  const randomVerticalOrigin = gsap.utils.random(["top", "center", "bottom"], true);
  const randomHorizontalOrigin = gsap.utils.random(["left", "center", "right"], true);
  const curveLength = ratioCurve.getTotalLength();
  const curveMatrix = ratioCurve.getScreenCTM();

  if (!curveMatrix) {
    finishIntro();
    return;
  }

  const renderedCurveLength = curveLength * Math.hypot(curveMatrix.a, curveMatrix.b);
  const handEntryState = { progress: 0 };

  const getScreenPoint = (distance: number) => {
    const point = ratioCurve.getPointAtLength(distance);
    const matrix = ratioCurve.getScreenCTM();

    if (!matrix) return null;

    return {
      x: point.x * matrix.a + point.y * matrix.c + matrix.e,
      y: point.x * matrix.b + point.y * matrix.d + matrix.f,
    };
  };

  const findVisibleStartDistance = () => {
    const sampleCount = 400;

    for (let index = 0; index <= sampleCount; index += 1) {
      const distance = (curveLength * index) / sampleCount;
      const point = getScreenPoint(distance);

      if (!point) continue;

      if (
        point.x >= heroBounds.left &&
        point.x <= heroBounds.right &&
        point.y >= heroBounds.top &&
        point.y <= heroBounds.bottom
      ) {
        return distance;
      }
    }

    return 0;
  };

  const visibleStartDistance = findVisibleStartDistance();
  const visibleStartProgress = visibleStartDistance / curveLength;
  const initialDashOffset = renderedCurveLength * (1 - visibleStartProgress);
  const setHandLeft = gsap.quickSetter(handAnchor, "left", "px");
  const setHandTop = gsap.quickSetter(handAnchor, "top", "px");

  const renderHandEntry = () => {
    const point = getScreenPoint(visibleStartDistance);

    if (!point) return;

    const remainingProgress = 1 - handEntryState.progress;

    setHandLeft(point.x + 60 * remainingProgress);
    setHandTop(point.y + (window.innerHeight + 180 - point.y) * remainingProgress);
  };

  const renderHandFromStroke = () => {
    const strokeOffset = Number.parseFloat(
      String(gsap.getProperty(ratioCurve, "strokeDashoffset")),
    );

    if (!Number.isFinite(strokeOffset)) return;

    const hiddenProgress = Math.min(
      1,
      Math.max(0, Math.abs(strokeOffset) / renderedCurveLength),
    );
    const drawnDistance = curveLength * (1 - hiddenProgress);
    const point = getScreenPoint(drawnDistance);

    if (!point) return;

    setHandLeft(point.x);
    setHandTop(point.y);
  };

  const drawingStart = getScreenPoint(visibleStartDistance);

  if (!drawingStart) {
    finishIntro();
    return;
  }

  gsap.set(verticalLines, {
    opacity: 0,
    scaleY: 0,
    transformOrigin: randomVerticalOrigin,
  });
  gsap.set(horizontalLines, {
    opacity: 0,
    scaleX: 0,
    transformOrigin: randomHorizontalOrigin,
  });
  gsap.set(ratioGuides, { opacity: 0 });
  gsap.set(ratioCurve, {
    // Non-scaling strokes measure dash values in rendered CSS pixels.
    strokeDasharray: `${renderedCurveLength}px`,
    strokeDashoffset: `${initialDashOffset}px`,
  });
  gsap.set(handAnchor, {
    autoAlpha: 0,
    left: drawingStart.x + 60,
    top: window.innerHeight + 180,
  });

  gsap
    .timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: finishIntro,
    })
    .to(
      verticalLines,
      {
        opacity: 1,
        scaleY: 1,
        duration: 0.75,
        stagger: { amount: 1.2, from: "random" },
      },
      0.45,
    )
    .to(
      horizontalLines,
      {
        opacity: 1,
        scaleX: 1,
        duration: 0.75,
        stagger: { amount: 1.2, from: "random" },
      },
      0.62,
    )
    .to(
      handAnchor,
      {
        autoAlpha: 1,
        duration: 0.85,
        ease: "power3.out",
      },
      ">-0.2",
    )
    .to(
      handEntryState,
      {
        progress: 1,
        duration: 0.85,
        ease: "power3.out",
        onStart: renderHandEntry,
        onUpdate: renderHandEntry,
      },
      "<",
    )
    .call(renderHandFromStroke)
    .to(ratioCurve, {
      strokeDashoffset: 0,
      duration: 3.45,
      ease: "sine.inOut",
      onUpdate: renderHandFromStroke,
    })
    .to(
      handAnchor,
      {
        autoAlpha: 0,
        duration: 0.45,
      },
      ">-0.45",
    )
    .to(intro, {
      autoAlpha: 0,
      duration: 0.85,
      ease: "power2.inOut",
    });
}

function playShellIntro(
  gsap: typeof import("gsap").gsap,
) {
  const mat = intro?.querySelector<HTMLElement>(".intro__mat");
  const handAnchor = intro?.querySelector<HTMLElement>(".intro__hand-anchor");
  const leftGuide = document.querySelector<HTMLElement>(".guide--left");
  const rightGuide = document.querySelector<HTMLElement>(".guide--right");
  const headerGuide = document.querySelector<HTMLElement>(".guide--header");

  if (!intro || !mat || !handAnchor || !leftGuide || !rightGuide || !headerGuide) {
    finishIntro();
    return;
  }

  const leftX = leftGuide.getBoundingClientRect().left;
  const rightX = rightGuide.getBoundingClientRect().left;
  const headerY = headerGuide.getBoundingClientRect().top;
  const bottomY = window.innerHeight;
  const leftLine = createShellLine("vertical", leftX, headerY);
  const headerLine = createShellLine("horizontal", headerY, headerY);
  const rightLine = createShellLine("vertical", rightX, headerY);

  mat.append(leftLine, headerLine, rightLine);

  const setHandLeft = gsap.quickSetter(handAnchor, "left", "px");
  const setHandTop = gsap.quickSetter(handAnchor, "top", "px");
  const moveHand = (fromX: number, fromY: number, toX: number, toY: number) => {
    const state = { progress: 0 };

    return {
      state,
      render: () => {
        setHandLeft(fromX + (toX - fromX) * state.progress);
        setHandTop(fromY + (toY - fromY) * state.progress);
      },
    };
  };

  const headerPass = moveHand(0, headerY, window.innerWidth, headerY);
  const rightPass = moveHand(rightX, headerY, rightX, bottomY);
  const leftPass = moveHand(leftX, bottomY, leftX, headerY);

  gsap.set(leftLine, { scaleY: 0, transformOrigin: "bottom" });
  gsap.set(headerLine, { scaleX: 0, transformOrigin: "left" });
  gsap.set(rightLine, { scaleY: 0, transformOrigin: "top" });
  gsap.set(handAnchor, {
    autoAlpha: 0,
    left: -80,
    top: headerY + 100,
  });

  gsap
    .timeline({
      defaults: { ease: "sine.inOut" },
      onComplete: finishIntro,
    })
    .to(handAnchor, {
      autoAlpha: 1,
      left: 0,
      top: headerY,
      duration: 0.45,
      ease: "power3.out",
    })
    .to(
      headerLine,
      {
        scaleX: 1,
        duration: 0.85,
      },
      ">",
    )
    .to(
      headerPass.state,
      {
        progress: 1,
        duration: 0.85,
        onUpdate: headerPass.render,
      },
      "<",
    )
    .to(handAnchor, {
      left: rightX,
      top: headerY,
      duration: 0.25,
      ease: "power1.inOut",
    })
    .to(rightLine, {
      scaleY: 1,
      duration: 0.65,
    })
    .to(
      rightPass.state,
      {
        progress: 1,
        duration: 0.65,
        onUpdate: rightPass.render,
      },
      "<",
    )
    .to(handAnchor, { autoAlpha: 0, duration: 0.2 })
    .set(handAnchor, { left: leftX, top: bottomY + 100 })
    .to(handAnchor, {
      autoAlpha: 1,
      left: leftX,
      top: bottomY,
      duration: 0.35,
      ease: "power3.out",
    })
    .to(leftLine, {
      scaleY: 1,
      duration: 0.65,
    })
    .to(
      leftPass.state,
      {
        progress: 1,
        duration: 0.65,
        onUpdate: leftPass.render,
      },
      "<",
    )
    .to(handAnchor, { autoAlpha: 0, duration: 0.3 })
    .to(intro, { autoAlpha: 0, duration: 0.65, ease: "power2.inOut" }, "<-0.1");
}

function createShellLine(
  orientation: "vertical" | "horizontal",
  position: number,
  headerY: number,
) {
  const line = document.createElement("span");
  line.className = `intro__line intro__line--${orientation} intro__line--anchor intro__line--shell`;

  if (orientation === "vertical") {
    line.style.left = `${position}px`;
    line.style.top = `${headerY}px`;
  } else {
    line.style.top = `${position}px`;
  }

  return line;
}
