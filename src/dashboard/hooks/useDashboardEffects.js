import { useEffect, useLayoutEffect } from "react";

const SECTION_IDS = ["overview", "earnings", "portfolio", "advantage", "marketplace", "upsell"];

export function useDarkTheme() {
  useLayoutEffect(() => {
    const previousTheme = document.body.dataset.theme;
    document.body.dataset.theme = "dark";
    window.localStorage.removeItem("strdome-theme");

    return () => {
      if (previousTheme) document.body.dataset.theme = previousTheme;
      else delete document.body.dataset.theme;
    };
  }, []);
}

export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}

export function useBackgroundMotion() {
  useEffect(() => {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let animationFrame = null;

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      document.body.style.setProperty("--bg-mx", currentX.toFixed(3));
      document.body.style.setProperty("--bg-my", currentY.toFixed(3));
      animationFrame =
        Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001
          ? window.requestAnimationFrame(tick)
          : null;
    };

    const onMouseMove = (event) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
      if (animationFrame === null) animationFrame = window.requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const ratio = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.5);
      document.body.style.setProperty("--bg-scroll", ratio.toFixed(3));
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, []);
}

export function useDashboardAnimations(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const counters = [...container.querySelectorAll("[data-count]")];
    const charts = [...container.querySelectorAll(".chart-block, .mini-chart")];
    const animationFrames = new Set();
    const cleanups = [];

    const animateCounter = (element) => {
      const endValue = Number(element.dataset.count);
      const start = performance.now();
      const formatter = new Intl.NumberFormat("en-US");
      const tick = (now) => {
        const progress = Math.min((now - start) / 1200, 1);
        const value = Math.round(endValue * (1 - Math.pow(1 - progress, 3)));
        element.textContent = formatter.format(value);
        if (progress < 1) {
          const id = window.requestAnimationFrame(tick);
          animationFrames.add(id);
        }
      };
      const id = window.requestAnimationFrame(tick);
      animationFrames.add(id);
    };

    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        }),
        { threshold: 0.4 },
      );
      counters.forEach((counter) => counterObserver.observe(counter));
      cleanups.push(() => counterObserver.disconnect());

      const chartObserver = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            chartObserver.unobserve(entry.target);
          }
        }),
        { threshold: 0.35 },
      );
      charts.forEach((chart) => chartObserver.observe(chart));
      cleanups.push(() => chartObserver.disconnect());
    } else {
      counters.forEach(animateCounter);
      charts.forEach((chart) => chart.classList.add("is-visible"));
    }

    charts.forEach((chart) => {
      const tooltip = chart.querySelector(".chart-tooltip");
      if (!tooltip) return;
      chart.querySelectorAll(".chart-node").forEach((node) => {
        const show = () => {
          tooltip.querySelector("strong").textContent = node.dataset.title || "";
          tooltip.querySelector("span").textContent = node.dataset.value || "";
          tooltip.querySelector("small").textContent = node.dataset.meta || "";
          const chartRect = chart.getBoundingClientRect();
          const nodeRect = node.getBoundingClientRect();
          const width = tooltip.offsetWidth || 154;
          const rawLeft = nodeRect.left - chartRect.left + nodeRect.width / 2;
          tooltip.style.left = `${Math.min(Math.max(rawLeft, width / 2 + 10), chartRect.width - width / 2 - 10)}px`;
          tooltip.style.top = "18px";
          tooltip.classList.add("is-visible");
          tooltip.setAttribute("aria-hidden", "false");
        };
        const hide = () => {
          tooltip.classList.remove("is-visible");
          tooltip.setAttribute("aria-hidden", "true");
        };
        ["mouseenter", "mousemove", "focus"].forEach((event) => node.addEventListener(event, show));
        ["mouseleave", "blur"].forEach((event) => node.addEventListener(event, hide));
        cleanups.push(() => {
          ["mouseenter", "mousemove", "focus"].forEach((event) => node.removeEventListener(event, show));
          ["mouseleave", "blur"].forEach((event) => node.removeEventListener(event, hide));
        });
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      animationFrames.forEach((id) => window.cancelAnimationFrame(id));
    };
  }, [containerRef]);
}

export function useActiveNavigation(mainRef, setActiveSection) {
  useEffect(() => {
    const main = mainRef.current;
    if (!main || !("IntersectionObserver" in window)) return undefined;
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { root: main, rootMargin: "-18% 0px -55% 0px", threshold: [0.2, 0.4, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [mainRef, setActiveSection]);
}

export function useNotificationPosition(isOpen, buttonRef, dropdownRef) {
  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current || !dropdownRef.current) return undefined;
    const position = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const width = Math.min(360, window.innerWidth - 24);
      const left = Math.min(
        Math.max(12, rect.left + rect.width / 2 - width / 2),
        window.innerWidth - width - 12,
      );
      dropdownRef.current.style.setProperty("--notif-top", `${rect.bottom + 12}px`);
      dropdownRef.current.style.setProperty("--notif-left", `${left}px`);
    };
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, { passive: true });
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position);
    };
  }, [isOpen, buttonRef, dropdownRef]);
}
