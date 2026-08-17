export function NotificationsDropdown({ isOpen, dropdownRef }) {
  return (
  <div ref={dropdownRef} className={`notif-dropdown${isOpen ? " is-open" : ""}`} id="notifDropdown" aria-hidden={!isOpen}>
    <div className="notif-dropdown-header">
      <div>
        <h3>Notifications</h3>
        <p className="muted-copy">Your latest activity &amp; ecosystem alerts</p>
      </div>
      <span className="alert-chip">3 New</span>
    </div>
    <ul className="notif-dropdown-list">
      <li className="notif-item unread">
        <span className="notif-icon-box amber"><svg viewBox="0 0 24 24" className="icon-svg"><path d="m12 3 2.7 5.5 6 .9-4.4 4.3 1 6.1L12 17l-5.3 2.8 1-6.1L3.3 9.4l6-.9L12 3Z" /></svg></span>
        <div className="notif-content">
          <strong>Q1 2027 Dividend Confirmed</strong>
          <span>$12.4M distributed to all owners</span>
          <small>2h ago</small>
        </div>
      </li>
      <li className="notif-item unread">
        <span className="notif-icon-box blue"><svg viewBox="0 0 24 24" className="icon-svg"><rect x={7} y="2.5" width={10} height={19} rx="2.5" /><path d="M10 5.5h4" /><path d="M12 18h.01" /></svg></span>
        <div className="notif-content">
          <strong>eSIM Beta Now Live</strong>
          <span>Activate your free business line</span>
          <small>1 day ago</small>
        </div>
      </li>
      <li className="notif-item">
        <span className="notif-icon-box amber"><svg viewBox="0 0 24 24" className="icon-svg"><path d="M4 7h16l-1.3 12H5.3L4 7Z" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></svg></span>
        <div className="notif-content">
          <strong>Public Round Announced</strong>
          <span>Price: $3.00 - Launching Dec 15</span>
          <small>3 days ago</small>
        </div>
      </li>
    </ul>
  </div>
  );
}
