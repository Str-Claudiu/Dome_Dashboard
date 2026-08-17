export function DashboardFooter({ onOpenApp }) {
  return (
    <>
      <section className="bottom-upgrade-strip panel">
        <div className="bottom-upgrade-left">
          <div className="bottom-upgrade-icon">
            <svg viewBox="0 0 24 24" className="icon-svg"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          </div>
          <div>
            <h2>Want to Increase Your Position?</h2>
            <p>Upgrade your package before this round sells out.</p>
          </div>
        </div>
        <div className="bottom-upgrade-steps">
          <span>Apex -&gt; Genesis</span>
          <span>+100% more shares</span>
          <span>Seed</span>
        </div>
        <button
          className="bottom-upgrade-button"
          type="button"
          data-app-url="https://shop.strdome.com"
          data-app-title="STRDOME Shop"
          onClick={() => onOpenApp({ url: "https://shop.strdome.com", title: "STRDOME Shop" })}
        >
          Upgrade Now
        </button>
      </section>
      <footer className="dashboard-footer">
        <a className="brand footer-brand" href="#overview" aria-label="STRDOME footer home">
          <span className="brand-mark" aria-hidden="true">
            <img src="/strdome-logo.png" alt="" />
          </span>
          <span className="brand-copy">
            <strong>STRDOME</strong>
            <span>Owners Dashboard</span>
          </span>
        </a>
        <div className="footer-center">
          <p>This is a private dashboard for verified share owners only.</p>
          <div className="footer-meta">
            <span>* Current price is reference price.</span>
            <span>Public listing on 1 Jan 2027.</span>
            <span>Dividends paid quarterly from net profit.</span>
            <span>Not financial advice.</span>
          </div>
        </div>
        <div className="footer-security">
          <span>Secured</span>
          <span>Encrypted</span>
          <span>On-Chain Verified</span>
        </div>
      </footer>
    </>
  );
}
