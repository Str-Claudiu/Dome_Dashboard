export function OverviewSections({ onOpenRoundInfo }) {
  return (
    <>
      <section className="round-banner section-card" id="overview">
        <div className="round-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="icon-svg trophy-icon"><path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" /><path d="M6 5H4a2 2 0 0 0 2 4" /><path d="M18 5h2a2 2 0 0 1-2 4" /><path d="M12 11v4" /><path d="M9 19h6" /></svg>
        </div>
        <div>
          <p className="eyebrow">Seed Round Active</p>
          <strong>You're in early. Enjoy +87.5% more shares vs public buyers.</strong>
        </div>
        <button className="ghost-pill" type="button" data-open-round-info onClick={onOpenRoundInfo}>View Round Info</button>
      </section>
      <section className="hero-grid">
        <article className="panel section-card welcome-panel">
          <div className="welcome-head">
            <div className="welcome-avatar">
              <img src="/profile-picture.png" alt="Profile picture" />
            </div>
            <div>
              <p className="eyebrow">Welcome Back</p>
              <h1>Alex S.</h1>
              <p className="hero-subline">Apex Reserve - Seed Round</p>
              <span className="verified-pill">Verified Owner</span>
            </div>
          </div>
        </article>
        <article className="panel section-card founder-track-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Your Seed Status</p>
              <h2>Apex Reserve</h2>
            </div>
            <span className="small-chip success">Top 0.1%</span>
          </div>
          <div className="status-track">
            <div className="status-node">
              <span>
                <svg viewBox="0 0 24 24" className="icon-svg status-glyph"><path d="M12 4.5 18 9v7.5L12 21l-6-4.5V9l6-4.5Z" /></svg>
              </span>
              <strong>Origin</strong>
            </div>
            <div className="status-line" />
            <div className="status-node">
              <span>
                <svg viewBox="0 0 24 24" className="icon-svg status-glyph"><path d="m12 2.5 2.5 4 4.7.7.7 4.7 4 2.6-4 2.5-.7 4.7-4.7.7-2.5 4-2.5-4-4.7-.7-.7-4.7-4-2.5 4-2.6.7-4.7 4.7-.7 2.5-4Z" /></svg>
              </span>
              <strong>Signal</strong>
            </div>
            <div className="status-line" />
            <div className="status-node">
              <span>
                <svg viewBox="0 0 24 24" className="icon-svg status-glyph"><path d="m12 4 5.3 3.1v6.2L12 20l-5.3-6.7V7.1L12 4Z" /><path d="M12 4v16" /></svg>
              </span>
              <strong>Ascend</strong>
            </div>
            <div className="status-line" />
            <div className="status-node active">
              <span>
                <svg viewBox="0 0 24 24" className="icon-svg status-glyph"><path d="m12 2.8 2.7 5.5 6.1.9-4.4 4.3 1 6.2L12 16.8l-5.4 2.9 1-6.2L3.2 9.2l6.1-.9L12 2.8Z" /><path d="M12 7.5v5" /><path d="M9.6 11.2 12 9.7l2.4 1.5" /></svg>
              </span>
              <strong>Apex</strong>
            </div>
          </div>
          <p className="track-footnote">12 Seed packages available - major Seed allocation</p>
        </article>
      </section>
      <section className="stats-row">
        <article className="panel stat-card">
          <div className="stat-icon blue"><svg viewBox="0 0 24 24" className="icon-svg"><path d="M12 5a7 7 0 1 0 7 7" /><path d="M12 3v9h9" /></svg></div>
          <p>Total Shares</p>
          <strong data-count={31250}>0</strong>
          <span>0.094% of total supply</span>
        </article>
        <article className="panel stat-card">
          <div className="stat-icon green"><svg viewBox="0 0 24 24" className="icon-svg"><path d="M12 3v18" /><path d="M16 7.5a3.5 3.5 0 0 0-3.5-2.5H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-2.5A3.5 3.5 0 0 1 8 14.5" /></svg></div>
          <p>Avg Buy Price</p>
          <strong>$1.60</strong>
          <span>Seed benchmark price</span>
        </article>
        <article className="panel stat-card">
          <div className="stat-icon amber"><svg viewBox="0 0 24 24" className="icon-svg"><path d="M5 18h14" /><path d="M7 15V9" /><path d="M12 15V6" /><path d="M17 15v-4" /></svg></div>
          <p>Current Ref Price</p>
          <strong>$3.00</strong>
          <span>+87.5% vs buy price</span>
        </article>
        <article className="panel stat-card value-card">
          <div className="stat-icon violet"><svg viewBox="0 0 24 24" className="icon-svg"><path d="M6 8.5A2.5 2.5 0 0 1 8.5 6h7A2.5 2.5 0 0 1 18 8.5v7A2.5 2.5 0 0 1 15.5 18h-7A2.5 2.5 0 0 1 6 15.5v-7Z" /><path d="M9 10.5h6" /><path d="M9 13.5h4" /></svg></div>
          <p>Estimated Value</p>
          <strong>$93,750</strong>
          <span>Unrealized profit: +$43,750</span>
        </article>
      </section>
    </>
  );
}
