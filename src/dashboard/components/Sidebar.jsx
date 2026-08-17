import { useState } from "react";

const navGroups = [
  {
    label: "Overview",
    items: [
      ["overview", "Summary", <><path d="M4 11.5 12 5l8 6.5" /><path d="M6 10.5V20h12v-9.5" /></>],
      ["earnings", "Earnings", <><path d="M4 19h16" /><path d="M7 15V9" /><path d="M12 15V5" /><path d="M17 15v-3" /></>],
      ["portfolio", "Portfolio", <><path d="M4 18c3-4 5-6 8-6s5 2 8 6" /><circle cx="12" cy="8" r="3" /></>],
      ["advantage", "Advantage", <><path d="M12 3v18" /><path d="m5 10 7-7 7 7" /></>],
    ],
  },
  { label: "Access", ecosystem: true },
  {
    label: "Growth",
    items: [
      ["earnings", "Dividend Estimator", <><path d="M12 2v20" /><path d="m17 5-10 5 10 5-10 5" /></>],
      ["marketplace", "Marketplace", <><path d="M4 7h16l-1.3 12H5.3L4 7Z" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></>],
      ["upsell", "Increase Position", <><path d="M12 4v16" /><path d="m6 10 6-6 6 6" /></>],
    ],
  },
];

const ecosystemItems = [
  { label: "StrBusiness eSIM", color: "blue", esim: true },
  { label: "HostLess Storage", color: "violet", url: "https://hostless.strdome.com", title: "HostLess Storage" },
  { label: "STR Domain", color: "green", url: "https://www.str.domains", title: "STR Domains" },
  { label: "StrTalk", color: "cyan", url: "https://www.strtalk.net", title: "StrTalk" },
  { label: "IgniteHex", color: "amber", url: "https://www.ignitehex.com", title: "IgniteHex" },
  { label: "Ccoin", color: "gold", url: "https://www.ccoin.finance", title: "Ccoin" },
];

export function Sidebar({ activeSection, isOpen, onClose, onOpenApp, onOpenEsim }) {
  const [ecosystemOpen, setEcosystemOpen] = useState(false);

  return (
    <>
      <aside className={`sidebar${isOpen ? " is-open" : ""}`}>
        <div className="sidebar-scroll">
          <a className="brand brand-sidebar" href="#overview" aria-label="STRDOME Owners Dashboard">
            <span className="brand-mark" aria-hidden="true">
              <img src="/strdome-logo.png" alt="" />
            </span>
          </a>
          <section className="owner-card">
            <div className="owner-top">
              <div className="avatar">AS</div>
              <div>
                <div className="owner-name">Alex S.</div>
                <div className="owner-domain">str.alex</div>
              </div>
            </div>
            <button
              className="username-pill-badge"
              type="button"
              data-app-url="https://shop.strdome.com"
              data-app-title="STRDOME Shop"
              data-direct-shop
              onClick={() => onOpenApp({ url: "https://shop.strdome.com", title: "STRDOME Shop", direct: true })}
            >
              <span className="badge-prefix">StrDome User</span>
              <span className="badge-handle">Alexandru</span>
            </button>
          </section>
          <div className="sidebar-sticky">
            <nav className="sidebar-nav" aria-label="Dashboard sections">
              {navGroups.map((group) => (
                <div className="nav-group" key={group.label}>
                  <div className="nav-label">{group.label}</div>
                  {group.ecosystem ? (
                    <div className={`nav-item-dropdown-wrap${ecosystemOpen ? " is-open" : ""}`} id="ecosystemDropdownWrap">
                      <div className="nav-item-has-dropdown">
                        <a
                          className="nav-item nav-item-main"
                          href="#ecosystem"
                          onClick={(event) => {
                            event.preventDefault();
                            setEcosystemOpen((open) => !open);
                          }}
                        >
                          <span className="nav-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" className="icon-svg">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M3 12h18" />
                              <path d="M12 3a15 15 0 0 1 0 18" />
                              <path d="M12 3a15 15 0 0 0 0 18" />
                            </svg>
                          </span>
                          <span>Ecosystem</span>
                        </a>
                        <button
                          type="button"
                          className="nav-dropdown-toggle"
                          id="ecosystemDropdownToggle"
                          aria-expanded={ecosystemOpen}
                          aria-controls="ecosystemSubMenu"
                          aria-label="Toggle Ecosystem menu dropdown"
                          onClick={() => setEcosystemOpen((open) => !open)}
                        >
                          <svg viewBox="0 0 24 24" className="icon-svg dropdown-arrow">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>
                      <div className="nav-sub-menu" id="ecosystemSubMenu">
                        {ecosystemItems.map((item) => (
                          <button
                            type="button"
                            className="sub-nav-item"
                            data-open-esim-modal={item.esim || undefined}
                            data-app-url={item.url}
                            data-app-title={item.title}
                            key={item.label}
                            onClick={() => {
                              if (item.esim) onOpenEsim();
                              else onOpenApp({ url: item.url, title: item.title });
                            }}
                          >
                            <span className={`sub-nav-dot ${item.color}`} />
                            <span className="sub-nav-text">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : group.items.map(([section, label, icon]) => (
                    <a
                      className={`nav-item${activeSection === section ? " active" : ""}`}
                      href={`#${section}`}
                      key={label}
                    >
                      <span className="nav-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" className="icon-svg">{icon}</svg>
                      </span>
                      <span>{label}</span>
                    </a>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </aside>
      <div
        className={`sidebar-overlay${isOpen ? " is-open" : ""}`}
        id="sidebarOverlay"
        aria-hidden="true"
        onClick={onClose}
      />
    </>
  );
}
