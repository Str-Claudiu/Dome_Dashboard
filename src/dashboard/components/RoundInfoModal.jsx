const roundPackages = [
  ["Origin Spark", "$250", "999 Seed packages available. Simple early ownership position.", "156"],
  ["Signal Crest", "$500", "500 Seed packages available. Larger ownership stake while availability is limited.", "313"],
  ["Terra Pulse", "$750", "350 Seed packages available. More meaningful exposure before private sale phases.", "469"],
  ["Foundation Arc", "$1,000", "250 Seed packages available. Stronger visible position in the Seed Round.", "625"],
  ["Momentum Vault", "$2,500", "200 Seed packages available. Serious early position before the public phase.", "1,563"],
  ["Horizon Forge", "$5,000", "120 Seed packages available. Strong role in the post-Founders growth phase.", "3,125"],
  ["Ascend Circle", "$10,000", "80 Seed packages available. Substantial ownership during the Seed phase.", "6,250"],
  ["Keystone Tier", "$15,000", "50 Seed packages available. Advanced allocation before the next round begins.", "9,375"],
  ["Sovereign Gate", "$25,000", "25 Seed packages available. Premium early ownership with limited inventory.", "15,625"],
  ["Apex Reserve", "$50,000", "12 Seed packages available. Major early position before public access.", "31,250", true],
  ["Genesis Crown", "$100,000", "5 Seed packages available. Maximum Seed position for long-term strategic participants.", "62,500"],
];

export function RoundInfoModal({ isOpen, onClose }) {
  return (
  <div
    className={`dash-modal-overlay${isOpen ? " is-open" : ""}`}
    id="roundInfoModal"
    aria-hidden={!isOpen}
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <div className="dash-modal round-info-modal-box" role="dialog" aria-modal="true" aria-labelledby="roundInfoTitle">
      <div className="dash-modal-header">
        <div>
          <p className="eyebrow">Available from 1 June 2026</p>
          <h3 id="roundInfoTitle">Seed Round Package Descriptions</h3>
          <p className="muted-copy">All allocations follow the official $3.00 public reference share price. Seed participants receive +87.5% additional shares based on the $1.60 Seed benchmark.</p>
        </div>
        <button className="modal-close-icon" id="roundInfoCloseBtn" type="button" aria-label="Close round information" onClick={onClose}>×</button>
      </div>
      <div className="round-info-summary">
        <div>
          <span>Seed Benchmark</span>
          <strong>$1.60</strong>
        </div>
        <div>
          <span>Public Reference</span>
          <strong>$3.00</strong>
        </div>
        <div>
          <span>Seed Advantage</span>
          <strong>+87.5%</strong>
        </div>
      </div>
      <div className="round-info-body">
        <div className="round-package-grid">
          {roundPackages.map(([name, price, description, shares, featured]) => (
            <article className={`round-package-card${featured ? " featured" : ""}`} key={name}>
              <div><strong>{name}</strong><span>{price}</span></div>
              <p>{description}</p>
              <ul>
                <li>{shares} Seed shares</li>
                <li>Quarterly dividend eligibility from 1 January 2027</li>
                <li>StrBusiness eSIM testing, 10GB HostLess storage, dashboard access</li>
              </ul>
            </article>
          ))}
        </div>
        <div className="round-info-disclaimer">
          <strong>Disclaimer</strong>
          <p>Seed availability is limited per package. Quarterly dividends may be distributed from platform net profit starting 1 January 2027, subject to profitability, governance policy, legal framework, and operational performance. Share resale may become possible only once public trading becomes available. Benefits are subject to technical rollout schedules and ecosystem availability.</p>
        </div>
      </div>
    </div>
  </div>
  );
}
