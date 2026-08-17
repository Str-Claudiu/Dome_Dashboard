export function Topbar({
  menuOpen,
  notificationButtonRef,
  notificationsOpen,
  onOpenWallet,
  onToggleMenu,
  onToggleNotifications,
}) {
  return (
      <header className="topbar">
        <div className="topbar-left">
          <button className={`menu-toggle${menuOpen ? " is-open" : ""}`} id="menuToggle" type="button" aria-expanded={menuOpen} aria-label="Toggle menu" onClick={onToggleMenu}>
            <span />
            <span />
            <span />
          </button>
          <div className="domain-pill">str.alex</div>
        </div>
        <div className="topbar-right">
          <div className="topbar-meta">Seed since Jun 2026</div>
          <div className="notifications-wrapper">
            <button ref={notificationButtonRef} className="icon-button" id="notifBellBtn" type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={onToggleNotifications}>
              <svg viewBox="0 0 24 24" className="icon-svg"><path d="M6 9a6 6 0 1 1 12 0v4l1.5 2.5H4.5L6 13V9" /><path d="M10 18a2 2 0 0 0 4 0" /></svg>
              <span className="notif-badge-dot" />
            </button>
          </div>
          <button className="icon-button" type="button" aria-label="Owner activity">
            <svg viewBox="0 0 24 24" className="icon-svg"><circle cx={12} cy={8} r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
          </button>
          <button className="wallet-pill" id="walletConnectBtn" type="button" onClick={onOpenWallet}>
            <svg viewBox="0 0 24 24" className="icon-svg wallet-icon"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" /></svg>
            <span>STR Wallet</span>
            <span className="wallet-connected-dot" title="Connected" />
          </button>
        </div>
      </header>
  );
}
