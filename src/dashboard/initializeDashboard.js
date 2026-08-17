export function initializeDashboard() {
  if (typeof window === "undefined") return;
  if (window.__domeDashboardInitialized) return;
  window.__domeDashboardInitialized = true;

  const THEME_KEY = "strdome-theme";
  const TOTAL_SHARES = 31250;

  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const navItems = Array.from(document.querySelectorAll(".nav-item"));
  const counterItems = Array.from(document.querySelectorAll("[data-count]"));
  const sectionIds = ["overview", "earnings", "portfolio", "advantage", "ecosystem", "beta", "marketplace", "status", "upsell"];

  const revenueSlider = document.querySelector("[data-estimator-revenue]");
  const growthSlider = document.querySelector("[data-estimator-growth]");
  const revenuePresets = Array.from(document.querySelectorAll("[data-revenue-preset]"));
  const revenueLabel = document.querySelector("[data-estimator-revenue-label]");
  const profitLabel = document.querySelector("[data-estimator-profit-label]");
  const ownershipLabel = document.querySelector("[data-estimator-ownership]");
  const payoutLabel = document.querySelector("[data-estimator-payout]");
  const noteLabel = document.querySelector("[data-estimator-note]");
  const chartContainers = Array.from(document.querySelectorAll(".chart-block, .mini-chart"));

  initializeTheme();
  initializeBurgerMenu();
  initializeNavigation();
  initializeCounters();
  initializeEstimator();
  initializeCharts();
  initializeBackgroundMotion();
  initializeEcosystemModals();
  initializeNotificationsDropdown();
  initializeEcosystemScroll();

  function initializeEcosystemScroll() {
    const slider = document.getElementById("ecosystemSlider");
    const leftBtn = document.getElementById("ecoScrollLeft");
    const rightBtn = document.getElementById("ecoScrollRight");

    if (slider && leftBtn && rightBtn) {
      leftBtn.addEventListener("click", () => {
        slider.scrollBy({ left: -300, behavior: "smooth" });
      });

      rightBtn.addEventListener("click", () => {
        slider.scrollBy({ left: 300, behavior: "smooth" });
      });
    }
  }

  function initializeBurgerMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!menuToggle || !sidebar || !overlay) return;

    function openMenu() {
      sidebar.classList.add("is-open");
      overlay.classList.add("is-open");
      menuToggle.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
      body.style.overflow = "hidden";
    }

    function closeMenu() {
      sidebar.classList.remove("is-open");
      overlay.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      body.style.overflow = "";
    }

    menuToggle.addEventListener("click", () => {
      const isOpen = sidebar.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });

    overlay.addEventListener("click", closeMenu);

    // ÃŽnchide meniul cÃ¢nd user-ul apasÄƒ pe un nav item pe mobile
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (window.innerWidth <= 860) closeMenu();
      });
    });

    // ÃŽnchide la ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  function initializeTheme() {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    const preferredLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const nextTheme = savedTheme || (preferredLight ? "light" : "dark");
    applyTheme(nextTheme);

    themeToggle?.addEventListener("click", () => {
      const next = body.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
      window.localStorage.setItem(THEME_KEY, next);
    });
  }

  function applyTheme(theme) {
    body.dataset.theme = theme;
  }

  function initializeNavigation() {
    const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
    const scrollToSection = (targetId, behavior = "smooth") => {
      const target = targetId ? document.getElementById(targetId) : null;
      const mainEl = document.querySelector(".main");

      if (!target || !mainEl) return false;

      const topbarHeight = document.querySelector(".topbar")?.offsetHeight || 90;
      const scrollClearance = topbarHeight + 44;
      const targetTop = target.getBoundingClientRect().top + mainEl.scrollTop - mainEl.getBoundingClientRect().top - scrollClearance;
      mainEl.scrollTo({ top: Math.max(targetTop, 0), behavior });
      return true;
    };

    anchorLinks.forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        const targetId = item.getAttribute("href")?.replace("#", "");

        setActiveNav(targetId);

        if (scrollToSection(targetId)) {
          history.replaceState(null, "", `#${targetId}`);
        }
      });
    });

    if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      window.requestAnimationFrame(() => scrollToSection(targetId, "auto"));
    }

    const ecosystemDropdownToggle = document.getElementById("ecosystemDropdownToggle");
    const ecosystemDropdownWrap = document.getElementById("ecosystemDropdownWrap");

    if (ecosystemDropdownToggle && ecosystemDropdownWrap) {
      ecosystemDropdownToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = ecosystemDropdownWrap.classList.toggle("is-open");
        ecosystemDropdownToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    const mainEl = document.querySelector(".main");
    if (!("IntersectionObserver" in window) || sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveNav(visible.target.id);
        }
      },
      {
        root: mainEl,
        rootMargin: "-18% 0px -55% 0px",
        threshold: [0.2, 0.4, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));
  }

  function setActiveNav(id) {
    navItems.forEach((item) => {
      item.classList.toggle("active", item.getAttribute("href") === `#${id}`);
    });
  }

  function initializeCounters() {
    if (counterItems.length === 0) {
      return;
    }

    const runCounter = (element) => {
      const endValue = Number(element.dataset.count);
      const duration = 1200;
      const start = performance.now();
      const formatter = new Intl.NumberFormat("en-US");

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = formatter.format(Math.round(endValue * eased));

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          element.textContent = formatter.format(endValue);
        }
      };

      window.requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      counterItems.forEach(runCounter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );

    counterItems.forEach((item) => observer.observe(item));
  }

  function initializeEstimator() {
    if (!revenueSlider || !growthSlider) {
      return;
    }

    revenuePresets.forEach((button) => {
      button.addEventListener("click", () => {
        revenueSlider.value = button.dataset.revenuePreset || revenueSlider.value;
        updateEstimator();
      });
    });

    revenueSlider.addEventListener("input", updateEstimator);
    growthSlider.addEventListener("input", updateEstimator);
    updateEstimator();
  }

  function updateEstimator() {
    const revenueMillions = Number(revenueSlider.value);
    const growthMultiplier = Number(growthSlider.value);
    const margin = 0.25 * growthMultiplier;
    const profitDollars = revenueMillions * 1_000_000 * margin;
    const ownerShare = 0.0009375;
    const payout = profitDollars * ownerShare;

    if (revenueLabel) {
      revenueLabel.textContent = formatCurrency(revenueMillions * 1_000_000);
    }

    if (profitLabel) {
      profitLabel.textContent = `${Math.round(margin * 100)}% (${formatCurrency(profitDollars)})`;
    }

    if (ownershipLabel) {
      ownershipLabel.textContent = "0.094%";
    }

    if (payoutLabel) {
      payoutLabel.textContent = `${formatCurrency(Math.round(payout))} / quarter`;
    }

    if (noteLabel) {
      noteLabel.textContent = `${formatCurrency(Math.round(payout))} / quarter`;
    }

    revenuePresets.forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.revenuePreset) === revenueMillions);
    });
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function initializeCharts() {
    if (chartContainers.length === 0) {
      return;
    }

    initializeChartReveal();
    initializeChartTooltips();
  }

  function initializeBackgroundMotion() {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId = null;

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      body.style.setProperty("--bg-mx", `${currentX.toFixed(3)}`);
      body.style.setProperty("--bg-my", `${currentY.toFixed(3)}`);

      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    const queueTick = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener(
      "mousemove",
      (event) => {
        targetX = (event.clientX / window.innerWidth - 0.5) * 2;
        targetY = (event.clientY / window.innerHeight - 0.5) * 2;
        queueTick();
      },
      { passive: true },
    );

    window.addEventListener(
      "scroll",
      () => {
        const scrollRatio = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.5);
        body.style.setProperty("--bg-scroll", `${scrollRatio.toFixed(3)}`);
      },
      { passive: true },
    );
  }

  function initializeChartReveal() {
    if (!("IntersectionObserver" in window)) {
      chartContainers.forEach((container) => container.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 },
    );

    chartContainers.forEach((container) => observer.observe(container));
  }

  function initializeChartTooltips() {
    chartContainers.forEach((container) => {
      const tooltip = container.querySelector(".chart-tooltip");
      const nodes = Array.from(container.querySelectorAll(".chart-node"));

      if (!tooltip || nodes.length === 0) {
        return;
      }

      nodes.forEach((node) => {
        node.addEventListener("mouseenter", () => showChartTooltip(container, tooltip, node));
        node.addEventListener("mousemove", () => showChartTooltip(container, tooltip, node));
        node.addEventListener("focus", () => showChartTooltip(container, tooltip, node));
        node.addEventListener("mouseleave", () => hideChartTooltip(tooltip));
        node.addEventListener("blur", () => hideChartTooltip(tooltip));
      });
    });
  }

  function showChartTooltip(container, tooltip, node) {
    const title = node.dataset.title || "";
    const value = node.dataset.value || "";
    const meta = node.dataset.meta || "";

    const titleElement = tooltip.querySelector("strong");
    const valueElement = tooltip.querySelector("span");
    const metaElement = tooltip.querySelector("small");

    if (titleElement) {
      titleElement.textContent = title;
    }

    if (valueElement) {
      valueElement.textContent = value;
    }

    if (metaElement) {
      metaElement.textContent = meta;
    }

    const containerRect = container.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth || 154;
    const rawLeft = nodeRect.left - containerRect.left + nodeRect.width / 2;
    const left = Math.min(Math.max(rawLeft, tooltipWidth / 2 + 10), containerRect.width - tooltipWidth / 2 - 10);
    const top = 18;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
  }

  function hideChartTooltip(tooltip) {
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  }

  function initializeEcosystemModals() {
    const appWindowModal = document.getElementById("appWindowModal");
    const appWinIframe = document.getElementById("appWinIframe");
    const appWinTitle = document.getElementById("appWinTitle");
    const appWinExternalLink = document.getElementById("appWinExternalLink");
    const appWinFallbackLink = document.getElementById("appWinFallbackLink");
    const appWinLoading = document.getElementById("appWinLoading");
    const appWinClose = document.getElementById("appWinClose");
    const appWinCloseTextBtn = document.getElementById("appWinCloseTextBtn");
    const appWinMaximize = document.getElementById("appWinMaximize");
    const dashWindow = document.querySelector(".dash-window");

    const esimModal = document.getElementById("esimModal");
    const esimCloseBtn = document.getElementById("esimCloseBtn");
    const esimFooterClose = document.getElementById("esimFooterClose");
    const roundInfoModal = document.getElementById("roundInfoModal");
    const roundInfoCloseBtn = document.getElementById("roundInfoCloseBtn");

    let shopAnimTimer = null;

    function triggerShopConnectionAnimation({ autoOpen = false, onComplete } = {}) {
      const badge = document.getElementById("shopStatusBadge");
      const tag1 = document.getElementById("shopTag1");
      const tag2 = document.getElementById("shopTag2");
      const tag3 = document.getElementById("shopTag3");

      const status1 = document.getElementById("shopTagStatus1");
      const status2 = document.getElementById("shopTagStatus2");
      const status3 = document.getElementById("shopTagStatus3");

      const launchBtn = document.getElementById("shopLaunchBtn");
      const btnText = document.getElementById("shopBtnText");

      // 1. Initial State: All Pending, Button Disabled
      if (badge) {
        badge.textContent = "Establishing Connection...";
        badge.style.color = "var(--amber)";
        badge.style.borderColor = "rgba(255, 201, 94, 0.4)";
        badge.style.background = "rgba(255, 201, 94, 0.15)";
      }

      if (tag1) tag1.setAttribute("data-status", "pending");
      if (tag2) tag2.setAttribute("data-status", "pending");
      if (tag3) tag3.setAttribute("data-status", "pending");

      if (status1) status1.textContent = "Connecting...";
      if (status2) status2.textContent = "Connecting...";
      if (status3) status3.textContent = "Connecting...";

        if (launchBtn) {
          launchBtn.classList.add("is-disabled");
          launchBtn.classList.remove("just-unlocked");
        }
      if (btnText) btnText.textContent = autoOpen ? "Opening STRDOME Shop..." : "Connecting Secure Node...";

      // 2. Timeline Sequence
      setTimeout(() => { if (tag1) tag1.setAttribute("data-status", "loading"); }, 200);

      setTimeout(() => {
        if (tag1) tag1.setAttribute("data-status", "active");
        if (status1) status1.textContent = "VERIFIED";
      }, 700);

      setTimeout(() => { if (tag2) tag2.setAttribute("data-status", "loading"); }, 900);

      setTimeout(() => {
        if (tag2) tag2.setAttribute("data-status", "active");
        if (status2) status2.textContent = "ENCRYPTED";
      }, 1400);

      setTimeout(() => { if (tag3) tag3.setAttribute("data-status", "loading"); }, 1600);

      setTimeout(() => {
        if (tag3) tag3.setAttribute("data-status", "active");
        if (status3) status3.textContent = "ALLOCATED";
      }, 2100);

      setTimeout(() => {
        if (badge) {
          badge.textContent = "Node Online • Secure";
          badge.style.color = "var(--green)";
          badge.style.borderColor = "rgba(46, 213, 115, 0.4)";
          badge.style.background = "rgba(46, 213, 115, 0.15)";
        }
        if (launchBtn) {
          launchBtn.classList.remove("is-disabled");
          launchBtn.classList.add("just-unlocked");
        }
        if (btnText) btnText.textContent = autoOpen ? "Opening STRDOME Shop..." : "Launch STRDOME Shop";
        if (typeof onComplete === "function") {
          window.setTimeout(onComplete, 350);
        }
      }, 2400);
    }

    function loadAppUrlInFrame(url) {
      if (appWinLoading) {
        appWinLoading.classList.remove("is-hidden");
        appWinLoading.style.opacity = "1";
      }

      if (appWinIframe) {
        appWinIframe.removeAttribute("srcdoc");
        const targetSrc = url.includes("strtalk.net")
          ? `/proxy?url=${encodeURIComponent(url)}&v=${Date.now()}`
          : (url.startsWith("http") ? `/proxy?url=${encodeURIComponent(url)}` : url);
        appWinIframe.src = targetSrc;

        let loaded = false;
        appWinIframe.onload = () => {
          loaded = true;
          if (appWinLoading) {
            appWinLoading.classList.add("is-hidden");
            appWinLoading.style.opacity = "0";
          }
        };

        setTimeout(() => {
          if (!loaded && appWinLoading) {
            appWinLoading.classList.add("is-hidden");
            appWinLoading.style.opacity = "0";
          }
        }, 2500);
      }
    }

    function externalUrlFor(url) {
      const externalMap = {
        "/hostless-storage": "https://drive-dev.aresai.tech/",
        "https://www.ccoin.finance": "https://card.ccoin.finance/en/sign-in",
        "https://card.ccoin.finance/en/sign-in": "https://card.ccoin.finance/en/sign-in",
      };
      return externalMap[url] || url;
    }

    // In-Dashboard App Window Open Trigger
    document.querySelectorAll("[data-app-url]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const url = btn.getAttribute("data-app-url");
        const title = btn.getAttribute("data-app-title") || "Web Portal";

        if (!url) return;
        const externalUrl = externalUrlFor(url);

        if (appWinTitle) appWinTitle.textContent = title;
        if (appWinExternalLink) {
          appWinExternalLink.href = externalUrl;
          appWinExternalLink.onclick = (event) => {
            event.preventDefault();
            window.open(externalUrl, "_blank", "noopener,noreferrer");
          };
        }
        if (appWinFallbackLink) appWinFallbackLink.href = externalUrl;
        if (shopLaunchBtn) shopLaunchBtn.href = externalUrl;

        const isShop = url.includes("shop.strdome.com");
        const opensShopDirectly = btn.hasAttribute("data-direct-shop");

        if (isShop && shopPortalCard) {
          shopPortalCard.classList.remove("is-hidden");
          shopPortalCard.classList.toggle("is-auto-opening", opensShopDirectly);
          if (appWinLoading) appWinLoading.classList.add("is-hidden");
          if (appWinIframe) appWinIframe.src = "about:blank";
          triggerShopConnectionAnimation({
            autoOpen: opensShopDirectly,
            onComplete: opensShopDirectly
              ? () => {
                  shopPortalCard.classList.add("is-hidden");
                  shopPortalCard.classList.remove("is-auto-opening");
                  loadAppUrlInFrame(url);
                }
              : undefined,
          });
        } else {
          if (shopPortalCard) shopPortalCard.classList.add("is-hidden");
          shopPortalCard?.classList.remove("is-auto-opening");
          loadAppUrlInFrame(url);
        }

        appWindowModal?.classList.add("is-open");
        appWindowModal?.setAttribute("aria-hidden", "false");
        body.style.overflow = "hidden";
      });
    });

    // Web3 Wallet Connect Modal Logic
    const walletConnectBtn = document.getElementById("walletConnectBtn");
    const walletConnectModal = document.getElementById("walletConnectModal");
    const walletModalClose = document.getElementById("walletModalClose");
    const walletOptionsGrid = document.getElementById("walletOptionsGrid");
    const walletQrBox = document.getElementById("walletQrBox");
    const backToWalletsBtn = document.getElementById("backToWalletsBtn");
    const disconnectWalletBtn = document.getElementById("disconnectWalletBtn");
    const activeWalletName = document.getElementById("activeWalletName");
    const walletAddress = document.getElementById("walletAddress");

    function openWalletModal() {
      walletConnectModal?.classList.add("is-open");
      walletConnectModal?.setAttribute("aria-hidden", "false");
      body.style.overflow = "hidden";
    }

    function closeWalletModal() {
      walletConnectModal?.classList.remove("is-open");
      walletConnectModal?.setAttribute("aria-hidden", "true");
      if (walletQrBox) walletQrBox.classList.add("is-hidden");
      if (walletOptionsGrid) walletOptionsGrid.classList.remove("is-hidden");
      body.style.overflow = "";
    }

    walletConnectBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      openWalletModal();
    });

    walletModalClose?.addEventListener("click", closeWalletModal);

    // Wallet Option Selection
    document.querySelectorAll(".wallet-option-card").forEach((card) => {
      card.addEventListener("click", () => {
        const walletType = card.dataset.wallet;
        const walletName = card.dataset.name || "Web3 Wallet";
        const walletAddr = card.dataset.addr || "0x... Connected";

        if (walletType === "walletconnect") {
          if (walletOptionsGrid) walletOptionsGrid.classList.add("is-hidden");
          if (walletQrBox) walletQrBox.classList.remove("is-hidden");
        } else {
          document.querySelectorAll(".wallet-option-card").forEach((c) => {
            c.classList.remove("is-active");
            const tag = c.querySelector(".wallet-status-tag");
            if (tag) {
              tag.classList.remove("active");
              tag.textContent = c.dataset.wallet === "walletconnect" ? "Scan QR" : (c.dataset.wallet === "ledger" ? "Hardware" : "Connect");
            }
          });

          card.classList.add("is-active");
          const activeTag = card.querySelector(".wallet-status-tag");
          if (activeTag) {
            activeTag.classList.add("active");
            activeTag.textContent = "Connected";
          }

          if (activeWalletName) activeWalletName.textContent = walletName;
          if (walletAddress) walletAddress.textContent = walletAddr;
        }
      });
    });

    backToWalletsBtn?.addEventListener("click", () => {
      if (walletQrBox) walletQrBox.classList.add("is-hidden");
      if (walletOptionsGrid) walletOptionsGrid.classList.remove("is-hidden");
    });

    disconnectWalletBtn?.addEventListener("click", () => {
      document.querySelectorAll(".wallet-option-card").forEach((c) => {
        c.classList.remove("is-active");
        const tag = c.querySelector(".wallet-status-tag");
        if (tag) {
          tag.classList.remove("active");
          tag.textContent = "Connect";
        }
      });
      if (activeWalletName) activeWalletName.textContent = "Disconnected";
      if (walletAddress) walletAddress.textContent = "No active wallet session";
    });

    // Close Web App Window
    function closeAppWindow() {
      appWindowModal?.classList.remove("is-open");
      appWindowModal?.setAttribute("aria-hidden", "true");
      if (appWinIframe) appWinIframe.src = "about:blank";
      if (appWinLoading) appWinLoading.classList.remove("is-hidden");
      body.style.overflow = "";
    }

    appWinClose?.addEventListener("click", closeAppWindow);
    appWinCloseTextBtn?.addEventListener("click", closeAppWindow);

    // Toggle Fullscreen / Maximize
    appWinMaximize?.addEventListener("click", () => {
      dashWindow?.classList.toggle("is-fullscreen");
    });

    // eSIM Modal Triggers
    document.querySelectorAll("[data-open-esim-modal]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        esimModal?.classList.add("is-open");
        esimModal?.setAttribute("aria-hidden", "false");
        body.style.overflow = "hidden";
      });
    });

    function closeEsimModal() {
      esimModal?.classList.remove("is-open");
      esimModal?.setAttribute("aria-hidden", "true");
      body.style.overflow = "";
    }

    esimCloseBtn?.addEventListener("click", closeEsimModal);
    esimFooterClose?.addEventListener("click", closeEsimModal);

    document.querySelectorAll("[data-open-round-info]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        roundInfoModal?.classList.add("is-open");
        roundInfoModal?.setAttribute("aria-hidden", "false");
        body.style.overflow = "hidden";
      });
    });

    function closeRoundInfoModal() {
      roundInfoModal?.classList.remove("is-open");
      roundInfoModal?.setAttribute("aria-hidden", "true");
      body.style.overflow = "";
    }

    roundInfoCloseBtn?.addEventListener("click", closeRoundInfoModal);

    // Backdrop Overlay Click & ESC to close
    [appWindowModal, esimModal, roundInfoModal].forEach((modal) => {
      modal?.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("is-open");
          modal.setAttribute("aria-hidden", "true");
          if (modal === appWindowModal && appWinIframe) appWinIframe.src = "about:blank";
          body.style.overflow = "";
        }
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAppWindow();
        closeEsimModal();
        closeRoundInfoModal();
      }
    });
  }

  function initializeNotificationsDropdown() {
    const notifBellBtn = document.getElementById("notifBellBtn");
    const notifDropdown = document.getElementById("notifDropdown");

    if (notifBellBtn && notifDropdown) {
      const positionDropdown = () => {
        const bellRect = notifBellBtn.getBoundingClientRect();
        const dropdownWidth = Math.min(360, window.innerWidth - 24);
        const left = Math.min(
          Math.max(12, bellRect.left + bellRect.width / 2 - dropdownWidth / 2),
          window.innerWidth - dropdownWidth - 12
        );
        notifDropdown.style.setProperty("--notif-top", `${bellRect.bottom + 12}px`);
        notifDropdown.style.setProperty("--notif-left", `${left}px`);
      };

      notifBellBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = notifDropdown.classList.toggle("is-open");
        if (isOpen) positionDropdown();
        notifDropdown.setAttribute("aria-hidden", isOpen ? "false" : "true");
        notifBellBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });

      window.addEventListener("resize", () => {
        if (notifDropdown.classList.contains("is-open")) positionDropdown();
      });
      window.addEventListener("scroll", () => {
        if (notifDropdown.classList.contains("is-open")) positionDropdown();
      }, { passive: true });

      document.addEventListener("click", (e) => {
        if (!notifDropdown.contains(e.target) && !notifBellBtn.contains(e.target)) {
          notifDropdown.classList.remove("is-open");
          notifDropdown.setAttribute("aria-hidden", "true");
          notifBellBtn.setAttribute("aria-expanded", "false");
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          notifDropdown.classList.remove("is-open");
          notifDropdown.setAttribute("aria-hidden", "true");
          notifBellBtn.setAttribute("aria-expanded", "false");
        }
      });
    }
  }
}
