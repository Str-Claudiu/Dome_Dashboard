import { useMemo, useState } from "react";

const revenuePresets = [10, 50, 100];
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function EarningsColumn({ onOpenApp }) {
  const [revenue, setRevenue] = useState(50);
  const [growth, setGrowth] = useState(1.2);
  const estimate = useMemo(() => {
    const margin = 0.25 * growth;
    const profit = revenue * 1_000_000 * margin;
    return {
      profit,
      margin: Math.round(margin * 100),
      payout: Math.round(profit * 0.0009375),
    };
  }, [growth, revenue]);

  return (
        <aside className="content-right">
          <section className="panel section-card" id="earnings">
            <div className="panel-head">
              <div>
                <h2>Live Dividend Estimator</h2>
                <p className="muted-copy">Based on platform profitability and your shareholding</p>
              </div>
              <span className="small-chip success">Starting Jan 2027</span>
            </div>
            <div className="scenario-box">
              <p className="scenario-title">Example Scenario</p>
              <div className="scenario-row"><span>Platform Revenue (Quarter)</span><strong data-estimator-revenue-label>{currency.format(revenue * 1_000_000)}</strong></div>
              <div className="scenario-row"><span>Net Profit Margin</span><strong data-estimator-profit-label>{estimate.margin}% ({currency.format(estimate.profit)})</strong></div>
              <div className="scenario-row"><span>Your Ownership</span><strong data-estimator-ownership>0.094%</strong></div>
            </div>
            <div className="payout-box">
              <span>Estimated Payout to You</span>
              <strong data-estimator-payout>{currency.format(estimate.payout)} / quarter</strong>
            </div>
            <div className="revenue-buttons">
              {revenuePresets.map((preset) => (
                <button
                  className={`revenue-option${revenue === preset ? " active" : ""}`}
                  type="button"
                  data-revenue-preset={preset}
                  key={preset}
                  onClick={() => setRevenue(preset)}
                >
                  ${preset}M/Q
                </button>
              ))}
            </div>
            <div className="slider-stack">
              <label>
                <span>Revenue</span>
                <input type="range" min={10} max={100} step={5} value={revenue} onChange={(event) => setRevenue(Number(event.target.value))} data-estimator-revenue />
              </label>
              <label>
                <span>Growth</span>
                <input type="range" min={1} max={2} step="0.1" value={growth} onChange={(event) => setGrowth(Number(event.target.value))} data-estimator-growth />
              </label>
            </div>
            <p className="estimator-note">You'll earn <strong data-estimator-note>{currency.format(estimate.payout)} / quarter</strong> in the selected case.</p>
          </section>
          <section className="panel section-card compact-advantage-card" id="advantage">
            <div className="compact-advantage-icon">
              <svg viewBox="0 0 24 24" className="icon-svg"><path d="m5 18 2-8 5 4 5-9 2 13" /><path d="M4 20h16" /></svg>
            </div>
            <h2>Your Seed Advantage</h2>
            <p className="muted-copy">You secured a strong Seed Round edge.</p>
            <div className="bar-stat">
              <div><span>Your Share (Seed)</span><strong>31,250</strong></div>
              <div className="bar-track"><span className="owner-fill" /></div>
            </div>
            <div className="bar-stat">
              <div><span>Public Equivalent</span><strong>16,667</strong></div>
              <div className="bar-track"><span className="public-fill" /></div>
            </div>
            <div className="compact-highlight">
              <strong>Extra Shares Gained</strong>
              <span>+14,583 shares</span>
              <small>(+87.5% more)</small>
            </div>
          </section>
          <section className="panel section-card upsell-card" id="upsell">
            <div className="upsell-top">
              <div className="upgrade-icon">
                <svg viewBox="0 0 24 24" className="icon-svg"><path d="M12 4v16" /><path d="m6 10 6-6 6 6" /><path d="m6 16 6-6 6 6" /></svg>
              </div>
              <div>
                <p className="eyebrow">Increase Position</p>
                <h2>Upgrade to Genesis Crown</h2>
                <p className="muted-copy">62,500 shares, highest Seed position.</p>
              </div>
            </div>
            <div className="upgrade-benefits">
              <span>+100% More Shares</span>
              <span>5 Seed Packages</span>
              <span>Highest Seed Tier</span>
            </div>
            <button
              className="upgrade-button"
              type="button"
              data-app-url="https://shop.strdome.com"
              data-app-title="STRDOME Shop"
              onClick={() => onOpenApp({ url: "https://shop.strdome.com", title: "STRDOME Shop" })}
            >
              Upgrade Package
            </button>
            <div className="upgrade-timer">Round ends in: 14d 22h 33m 12s</div>
          </section>
        </aside>
  );
}
