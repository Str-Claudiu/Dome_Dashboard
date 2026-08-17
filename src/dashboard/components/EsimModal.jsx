export function EsimModal({ isOpen, onClose }) {
  return (
  <div
    className={`dash-modal-overlay${isOpen ? " is-open" : ""}`}
    id="esimModal"
    aria-hidden={!isOpen}
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <div className="dash-modal esim-modal-box" role="dialog" aria-modal="true" aria-labelledby="esimTitle">
      <div className="dash-modal-header">
        <div>
          <h3 id="esimTitle">StrBusiness eSIM Activation Card</h3>
          <p className="muted-copy">Owners-only mobile service panel &amp; activation QR code</p>
        </div>
        <button className="modal-close-icon" id="esimCloseBtn" type="button" aria-label="Close modal" onClick={onClose}>×</button>
      </div>
      <div className="dash-modal-body">
        <div className="esim-card-preview">
          <img src="/esim-card.jpg" alt="SourceLess NET eSIM Activation QR Code Card - Beta V1.0 - str.ilieslj1" className="esim-card-img" />
        </div>
        <div className="esim-details-grid">
          <div className="esim-detail-item">
            <span>Network</span>
            <strong>SourceLess NET</strong>
          </div>
          <div className="esim-detail-item">
            <span>Version</span>
            <strong>Beta V1.0</strong>
          </div>
          <div className="esim-detail-item">
            <span>Domain</span>
            <strong>str.ilieslj1</strong>
          </div>
          <div className="esim-detail-item">
            <span>Serial Number (S/N)</span>
            <strong>26051609040011</strong>
          </div>
        </div>
      </div>
      <div className="dash-modal-footer">
        <a href="/esim-card.jpg" download="STRDOME_eSIM_Activation.jpg" className="modal-primary-btn">
          <svg viewBox="0 0 24 24" className="icon-svg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1={12} y1={15} x2={12} y2={3} /></svg>
          Download QR Card
        </a>
        <button type="button" className="modal-secondary-btn" id="esimFooterClose" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
  );
}
