import { useCallback, useEffect, useRef, useState } from "react";
import { AppWindowModal } from "./components/AppWindowModal.jsx";
import { DashboardFooter } from "./components/DashboardFooter.jsx";
import { EarningsColumn } from "./components/EarningsColumn.jsx";
import { EsimModal } from "./components/EsimModal.jsx";
import { NotificationsDropdown } from "./components/NotificationsDropdown.jsx";
import { OverviewSections } from "./components/OverviewSections.jsx";
import { PortfolioSections } from "./components/PortfolioSections.jsx";
import { RoundInfoModal } from "./components/RoundInfoModal.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Topbar } from "./components/Topbar.jsx";
import { WalletModal } from "./components/WalletModal.jsx";
import {
  useActiveNavigation,
  useBackgroundMotion,
  useBodyScrollLock,
  useDarkTheme,
  useDashboardAnimations,
  useNotificationPosition,
} from "./hooks/useDashboardEffects.js";

export function Dashboard() {
  const dashboardRef = useRef(null);
  const mainRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roundInfoOpen, setRoundInfoOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [esimOpen, setEsimOpen] = useState(false);
  const [app, setApp] = useState(null);

  useDarkTheme();
  useBackgroundMotion();
  useDashboardAnimations(dashboardRef);
  useActiveNavigation(mainRef, setActiveSection);
  useNotificationPosition(notificationsOpen, notificationButtonRef, notificationDropdownRef);
  useBodyScrollLock(sidebarOpen || roundInfoOpen || walletOpen || esimOpen || Boolean(app));

  const scrollToSection = useCallback((id, behavior = "smooth") => {
    const target = document.getElementById(id);
    const main = mainRef.current;
    if (!target || !main) return;
    const topbarHeight = main.querySelector(".topbar")?.offsetHeight || 90;
    const top = target.getBoundingClientRect().top + main.scrollTop - main.getBoundingClientRect().top - topbarHeight - 44;
    main.scrollTo({ top: Math.max(top, 0), behavior });
    setActiveSection(id);
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const animationFrame = window.requestAnimationFrame(() => scrollToSection(window.location.hash.slice(1), "auto"));
      return () => window.cancelAnimationFrame(animationFrame);
    }
    return undefined;
  }, [scrollToSection]);

  useEffect(() => {
    const closeTransientUi = (event) => {
      if (event.key !== "Escape") return;
      setSidebarOpen(false);
      setNotificationsOpen(false);
      setRoundInfoOpen(false);
      setWalletOpen(false);
      setEsimOpen(false);
      setApp(null);
    };
    document.addEventListener("keydown", closeTransientUi);
    return () => document.removeEventListener("keydown", closeTransientUi);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (
        !notificationButtonRef.current?.contains(event.target) &&
        !notificationDropdownRef.current?.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [notificationsOpen]);

  const handleDashboardClick = (event) => {
    if (event.defaultPrevented) return;
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || !dashboardRef.current?.contains(anchor)) return;
    const id = anchor.getAttribute("href").slice(1);
    if (!id) return;
    event.preventDefault();
    scrollToSection(id);
    window.history.replaceState(null, "", `#${id}`);
    if (window.innerWidth <= 860) setSidebarOpen(false);
  };

  return (
    <div ref={dashboardRef} onClick={handleDashboardClick}>
      <div className="bg-canvas" aria-hidden="true"><span /></div>
      <div className="app-shell">
        <Sidebar
          activeSection={activeSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenApp={setApp}
          onOpenEsim={() => setEsimOpen(true)}
        />
        <main className="main" ref={mainRef}>
          <Topbar
            menuOpen={sidebarOpen}
            notificationButtonRef={notificationButtonRef}
            notificationsOpen={notificationsOpen}
            onOpenWallet={() => setWalletOpen(true)}
            onToggleMenu={() => setSidebarOpen((open) => !open)}
            onToggleNotifications={() => setNotificationsOpen((open) => !open)}
          />
          <OverviewSections onOpenRoundInfo={() => setRoundInfoOpen(true)} />
          <section className="content-grid">
            <div className="content-left">
              <PortfolioSections />
            </div>
            <EarningsColumn onOpenApp={setApp} />
          </section>
          <DashboardFooter onOpenApp={setApp} />
        </main>
      </div>
      <RoundInfoModal isOpen={roundInfoOpen} onClose={() => setRoundInfoOpen(false)} />
      <AppWindowModal app={app} isOpen={Boolean(app)} onClose={() => setApp(null)} />
      <EsimModal isOpen={esimOpen} onClose={() => setEsimOpen(false)} />
      <NotificationsDropdown
        dropdownRef={notificationDropdownRef}
        isOpen={notificationsOpen}
      />
      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
    </div>
  );
}
