import { useEffect, useMemo, useState } from "react";

const externalUrls = {
  "/hostless-storage": "https://drive-dev.aresai.tech/",
  "https://www.ccoin.finance": "https://card.ccoin.finance/en/sign-in",
  "https://card.ccoin.finance/en/sign-in": "https://card.ccoin.finance/en/sign-in",
};

function proxiedUrl(url) {
  if (!url) return "about:blank";
  if (!url.startsWith("http")) return url;
  const cacheBuster = url.includes("strtalk.net") ? `&v=${Date.now()}` : "";
  return `/proxy?url=${encodeURIComponent(url)}${cacheBuster}`;
}

const shopFeatures = [
  { title: "Verified Owner Packages", copy: "Apex Reserve, Genesis Crown & Seed tiers", color: "green", final: "VERIFIED" },
  { title: "On-Chain Encryption", copy: "Instant share reservation & smart contract delivery", color: "cyan", final: "ENCRYPTED" },
  { title: "Bonus Share Allocations", copy: "+87.5% extra Seed shares vs public", color: "amber", final: "ALLOCATED" },
];

export function AppWindowModal({ app, isOpen, onClose }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [frameSrc, setFrameSrc] = useState("about:blank");
  const [loading, setLoading] = useState(false);
  const [shopStep, setShopStep] = useState(-1);
  const [shopReady, setShopReady] = useState(false);
  const isShop = Boolean(app?.url?.includes("shop.strdome.com"));
  const externalUrl = useMemo(() => externalUrls[app?.url] || app?.url || "#", [app?.url]);

  useEffect(() => {
    if (!isOpen || !app?.url) {
      setFrameSrc("about:blank");
      setLoading(false);
      return undefined;
    }

    const timers = [];
    const loadFrame = () => {
      setLoading(true);
      setFrameSrc(proxiedUrl(app.url));
      timers.push(window.setTimeout(() => setLoading(false), 2500));
    };

    setShopStep(-1);
    setShopReady(false);
    if (!isShop) {
      loadFrame();
    } else {
      setFrameSrc("about:blank");
      [200, 700, 900, 1400, 1600, 2100].forEach((delay, index) => {
        timers.push(window.setTimeout(() => setShopStep(index), delay));
      });
      timers.push(window.setTimeout(() => {
        setShopReady(true);
        if (app.direct) timers.push(window.setTimeout(loadFrame, 350));
      }, 2400));
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [app, isOpen, isShop]);

  const featureStatus = (index) => {
    if (shopStep >= index * 2 + 1) return "active";
    if (shopStep >= index * 2) return "loading";
    return "pending";
  };

  const shopVisible = isShop && !(app?.direct && frameSrc !== "about:blank");

  return (
    <div
      className={`dash-modal-overlay${isOpen ? " is-open" : ""}`}
      id="appWindowModal"
      aria-hidden={!isOpen}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={`dash-window${fullscreen ? " is-fullscreen" : ""}`} role="dialog" aria-modal="true" aria-labelledby="appWinTitle">
        <div className="dash-window-header">
          <div className="window-controls">
            <button className="win-btn win-close" id="appWinClose" type="button" title="Close window" aria-label="Close window" onClick={onClose} />
            <span className="win-btn win-minimize" id="appWinMinimize" title="Minimize" aria-hidden="true" />
            <button className="win-btn win-maximize" id="appWinMaximize" type="button" title="Toggle Fullscreen" aria-label="Toggle fullscreen" onClick={() => setFullscreen((value) => !value)} />
          </div>
          <div className="window-title-container">
            <h4 id="appWinTitle" className="window-title">{app?.title || "Web Portal"}</h4>
          </div>
          <div className="window-actions">
            <a id="appWinExternalLink" href={externalUrl} target="_blank" rel="noopener noreferrer" className="win-action-btn" title="Open in new browser tab">
              <svg viewBox="0 0 24 24" className="icon-svg"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              <span>Open External</span>
            </a>
            <button id="appWinCloseTextBtn" type="button" className="win-action-btn close-text-btn" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="dash-window-body">
          <div className={`window-loading${loading ? "" : " is-hidden"}`} id="appWinLoading">
            <div className="window-spinner" />
            <span>Connecting to web portal...</span>
          </div>
          <div className={`shop-portal-card${shopVisible ? "" : " is-hidden"}${app?.direct ? " is-auto-opening" : ""}`} id="shopPortalCard">
            <div className="shop-portal-glow" />
            <div className="shop-portal-content">
              <div
                className="shop-portal-badge"
                id="shopStatusBadge"
                style={shopReady
                  ? { color: "var(--green)", borderColor: "rgba(46, 213, 115, 0.4)", background: "rgba(46, 213, 115, 0.15)" }
                  : { color: "var(--amber)", borderColor: "rgba(255, 201, 94, 0.4)", background: "rgba(255, 201, 94, 0.15)" }}
              >
                {shopReady ? "Node Online • Secure" : "Establishing Connection..."}
              </div>
              <h2>STRDOME Shares &amp; Package Portal</h2>
              <p className="muted-copy">Access official package upgrades, Seed share allocations, and instant liquidity controls.</p>
              <div className="shop-portal-features">
                {shopFeatures.map((feature, index) => {
                  const status = featureStatus(index);
                  return (
                    <div className="shop-feature-item" id={`shopTag${index + 1}`} data-status={status} key={feature.title}>
                      <span className={`shop-feature-icon ${feature.color}`}>
                        <svg viewBox="0 0 24 24" className="icon-svg"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                      <div><strong>{feature.title}</strong><span>{feature.copy}</span></div>
                      <span className="tag-status-indicator" id={`shopTagStatus${index + 1}`}>
                        {status === "active" ? feature.final : "Connecting..."}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="shop-portal-actions">
                <a href={externalUrl} target="_blank" rel="noopener noreferrer" className={`shop-launch-btn${shopReady ? " just-unlocked" : " is-disabled"}`} id="shopLaunchBtn" aria-disabled={!shopReady}>
                  <span className="launch-btn-spinner" id="shopBtnSpinner" />
                  <svg viewBox="0 0 24 24" className="icon-svg shop-btn-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  <span id="shopBtnText">{shopReady ? (app?.direct ? "Opening STRDOME Shop..." : "Launch STRDOME Shop") : (app?.direct ? "Opening STRDOME Shop..." : "Connecting Secure Node...")}</span>
                </a>
                <p className="shop-secure-note">Secured by SSL 256-bit encryption &amp; Web3 Gateway</p>
              </div>
            </div>
          </div>
          <iframe
            id="appWinIframe"
            src={frameSrc}
            title="In-Dashboard Web Application"
            frameBorder="0"
            allow="camera; microphone; geolocation; clipboard-read; clipboard-write; autoplay; payment; encrypted-media; midi"
            allowFullScreen
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
