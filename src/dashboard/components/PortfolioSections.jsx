export function PortfolioSections() {
  return (
    <>
          <section className="panel section-card" aria-labelledby="projection-title">
            <div className="panel-head">
              <div>
                <h2 id="projection-title">Profit Projection at Public Listing</h2>
                <p className="muted-copy">See your potential value at different listing prices</p>
              </div>
              <span className="small-chip">Listing: 1 January 2027</span>
            </div>
            <div className="chart-block">
              <svg viewBox="0 0 760 280" role="img" aria-label="Profit projection chart">
                <defs>
                  <linearGradient id="projectionLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2f93ff" />
                    <stop offset="55%" stopColor="#55dfff" />
                    <stop offset="100%" stopColor="#b768ff" />
                  </linearGradient>
                  <linearGradient id="projectionFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(79, 162, 255, 0.28)" />
                    <stop offset="100%" stopColor="rgba(79, 162, 255, 0)" />
                  </linearGradient>
                </defs>
                <path className="grid-line" d="M40 38H720M40 106H720M40 174H720M40 242H720M120 24V242M340 24V242M560 24V242" />
                <path className="area-fill" fill="url(#projectionFill)" d="M120 202L340 146L560 80L560 242L120 242Z" />
                <path className="glow-line" stroke="url(#projectionLine)" d="M120 202L340 146L560 80" />
                <circle className="dot-point chart-node" cx={120} cy={202} r={7} tabIndex={0} data-title="Conservative" data-value="$93,750" data-meta="@ $3.00 listing" />
                <circle className="dot-point chart-node" cx={340} cy={146} r={7} tabIndex={0} data-title="Growth Case" data-value="$156,250" data-meta="@ $5.00 listing" />
                <circle className="dot-point strong chart-node" cx={560} cy={80} r={8} tabIndex={0} data-title="High Case" data-value="$312,500" data-meta="@ $10.00 listing" />
              </svg>
              <div className="chart-tooltip" aria-hidden="true">
                <strong />
                <span />
                <small />
              </div>
              <div className="chart-label left">
                <strong>$3.00</strong>
                <span>$93,750</span>
                <small>Conservative Launch Price</small>
              </div>
              <div className="chart-label center">
                <strong>$5.00</strong>
                <span>$156,250</span>
                <small>Growth Case</small>
              </div>
              <div className="chart-label right">
                <strong>$10.00</strong>
                <span>$312,500</span>
                <small>High Case</small>
              </div>
            </div>
            <div className="callout-card">
              <strong>You got 1.875x more shares than public investors.</strong>
              <span>If you invested the same amount in the public round, you'd have only 16,667 shares.</span>
            </div>
          </section>
          <section className="lower-grid">
            <article className="panel section-card portfolio-overview-card" id="portfolio">
              <div className="panel-head">
                <div>
                  <h2>Portfolio Growth</h2>
                </div>
                <div className="mini-tabs">
                  <span>7D</span>
                  <span>30D</span>
                  <span>90D</span>
                  <span className="active">ALL</span>
                </div>
              </div>
              <div className="mini-chart">
                <svg viewBox="0 0 620 210" role="img" aria-label="Portfolio growth chart">
                  <path className="grid-line" d="M26 24H594M26 76H594M26 128H594M26 180H594M82 18V186M194 18V186M306 18V186M418 18V186M530 18V186" />
                  <defs>
                    <linearGradient id="portfolioLine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4cb2ff" />
                      <stop offset="58%" stopColor="#6ce7ff" />
                      <stop offset="100%" stopColor="#c45eff" />
                    </linearGradient>
                    <linearGradient id="portfolioFill" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(136, 95, 255, 0.26)" />
                      <stop offset="100%" stopColor="rgba(136, 95, 255, 0)" />
                    </linearGradient>
                  </defs>
                  <path className="area-fill" fill="url(#portfolioFill)" d="M42 170L118 150L194 132L270 116L346 96L422 92L498 74L574 40L574 186L42 186Z" />
                  <path className="glow-line purple" stroke="url(#portfolioLine)" d="M42 170L118 150L194 132L270 116L346 96L422 92L498 74L574 40" />
                  <circle className="dot-point portfolio-dot chart-node" cx={42} cy={170} r={5} tabIndex={0} data-title="Jun 2026" data-value="$50K" data-meta="Apex Reserve allocation" />
                  <circle className="dot-point portfolio-dot chart-node" cx={118} cy={150} r={5} tabIndex={0} data-title="Jul 2026" data-value="$50K" data-meta="Seed benchmark" />
                  <circle className="dot-point portfolio-dot chart-node" cx={194} cy={132} r={5} tabIndex={0} data-title="Aug 2026" data-value="$62.5K" data-meta="Private I benchmark" />
                  <circle className="dot-point portfolio-dot chart-node" cx={270} cy={116} r={5} tabIndex={0} data-title="Sep 2026" data-value="$62.5K" data-meta="+25% vs entry" />
                  <circle className="dot-point portfolio-dot chart-node" cx={346} cy={96} r={5} tabIndex={0} data-title="Oct 2026" data-value="$71.9K" data-meta="Private II benchmark" />
                  <circle className="dot-point portfolio-dot chart-node" cx={422} cy={92} r={5} tabIndex={0} data-title="Nov 2026" data-value="$71.9K" data-meta="+43.8% vs entry" />
                  <circle className="dot-point portfolio-dot chart-node" cx={498} cy={74} r={5} tabIndex={0} data-title="Dec 2026" data-value="$80K" data-meta="Pre-listing demand" />
                  <circle className="dot-point portfolio-dot strong chart-node" cx={574} cy={40} r={6} tabIndex={0} data-title="Jan 2027" data-value="$93.8K" data-meta="+87.5% ROI" />
                </svg>
                <div className="chart-tooltip" aria-hidden="true">
                  <strong />
                  <span />
                  <small />
                </div>
              </div>
              <div className="portfolio-stats">
                <div>
                  <span>Total Invested</span>
                  <strong>$50,000</strong>
                </div>
                <div>
                  <span>Current Value</span>
                  <strong>$93,750</strong>
                </div>
                <div>
                  <span>ROI</span>
                  <strong>+87.5%</strong>
                </div>
              </div>
            </article>
          </section>
          <section className="left-detail-grid">
            <article className="panel section-card package-detail-card">
              <div className="panel-head">
                <div>
                  <h2>Your Package</h2>
                  <p className="muted-copy">Current Seed allocation</p>
                </div>
                <a className="small-inline-button" href="#upsell">View All Packages</a>
              </div>
              <div className="package-detail-shell">
                <div className="package-detail-main">
                  <div className="package-orb" aria-hidden="true" />
                  <div>
                    <strong>Apex Reserve</strong>
                    <p>Major Seed package - 12 available</p>
                    <span>$50,000 - Seed Round</span>
                  </div>
                </div>
                <div className="package-detail-side">
                  <strong>31,250</strong>
                  <span>Seed Shares</span>
                </div>
              </div>
            </article>
            <div className="activity-marketplace-row">
              <article className="panel section-card activity-detail-card">
                <div className="panel-head">
                  <div>
                    <h2>Recent Activity</h2>
                    <p className="muted-copy">Latest owner milestones</p>
                  </div>
                  <a className="small-inline-link" href="#overview">View All</a>
                </div>
                <ul className="activity-feed">
                  <li>
                    <span className="activity-bullet green" />
                    <div>
                      <strong>Package Purchased - Apex Reserve</strong>
                      <span>$50,000 - Jun 1, 2026</span>
                    </div>
                  </li>
                  <li>
                    <span className="activity-bullet cyan" />
                    <div>
                      <strong>Q1 2027 Dividend Eligibility</strong>
                      <span>Starts Jan 1, 2027</span>
                    </div>
                  </li>
                  <li>
                    <span className="activity-bullet amber" />
                    <div>
                      <strong>Welcome to Seed Round</strong>
                      <span>+14,583 extra shares vs public - Jun 1</span>
                    </div>
                  </li>
                  <li>
                    <span className="activity-bullet violet" />
                    <div>
                      <strong>eSIM Activated - 100GB Plan</strong>
                      <span>Until Dec 2026 - Mar 15</span>
                    </div>
                  </li>
                </ul>
              </article>
              <section className="panel section-card equal-card" id="marketplace">
                <div className="panel-head">
                  <div>
                    <h2>Marketplace</h2>
                    <p className="muted-copy">Future-ready liquidity and transfer controls</p>
                  </div>
                </div>
                <ul className="feature-list">
                  <li><span>Sell shares</span><strong className="status-tag timed">Jan 2027</strong></li>
                  <li><span>Transfer ownership</span><strong className="status-tag neutral">Enabled</strong></li>
                  <li><span>Track liquidity</span><strong className="status-tag neutral">Live soon</strong></li>
                </ul>
              </section>
            </div>
          </section>
    </>
  );
}
