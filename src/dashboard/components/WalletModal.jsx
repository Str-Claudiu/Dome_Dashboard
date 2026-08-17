import { useEffect, useState } from "react";

const wallets = [
  { id: "str-wallet", name: "STR Native Wallet", label: "STR Wallet", address: "0x7A29...F491 (str.alex)", description: "Official Native Web3 Ecosystem Wallet", iconClass: "str-bg" },
  { id: "metamask", name: "MetaMask", label: "MetaMask", address: "0x3B91...E820", description: "Browser Extension & Mobile App", iconClass: "metamask-bg" },
  { id: "walletconnect", name: "WalletConnect", label: "WalletConnect", address: "Mobile Session", description: "Scan QR Code with 100+ mobile apps", iconClass: "walletconnect-bg" },
  { id: "coinbase", name: "Coinbase Wallet", label: "Coinbase Wallet", address: "0xC810...A942", description: "Self-custody crypto & Web3", iconClass: "coinbase-bg" },
  { id: "ledger", name: "Ledger Nano S/X", label: "Ledger Hardware", address: "0x1F44...D310", description: "Cold storage security hardware key", iconClass: "ledger-bg" },
];

function WalletIcon({ wallet }) {
  if (wallet === "coinbase") return <><circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="6" rx="1" /></>;
  if (wallet === "ledger") return <><rect x="2" y="6" width="20" height="12" rx="2" /><line x1="6" y1="12" x2="10" y2="12" /></>;
  if (wallet === "walletconnect") return <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M7 12a5 5 0 0 1 10 0" /><line x1="12" y1="17" x2="12.01" y2="17" /></>;
  if (wallet === "metamask") return <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />;
  return <path d="M7 6.5h8l2 2.5-2 2.5H9l-2 2.5h10l2 2.5-2 2.5H7" />;
}

export function WalletModal({ isOpen, onClose }) {
  const [activeWallet, setActiveWallet] = useState(wallets[0]);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!isOpen) setShowQr(false);
  }, [isOpen]);

  const chooseWallet = (wallet) => {
    if (wallet.id === "walletconnect") {
      setShowQr(true);
      return;
    }
    setActiveWallet(wallet);
  };

  const disconnect = () => {
    setActiveWallet(null);
    setShowQr(false);
  };

  return (
    <div
      className={`dash-modal-overlay${isOpen ? " is-open" : ""}`}
      id="walletConnectModal"
      aria-hidden={!isOpen}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dash-modal wallet-modal-box" role="dialog" aria-modal="true" aria-labelledby="walletModalTitle">
        <div className="dash-modal-header">
          <div className="wallet-modal-head-title">
            <svg viewBox="0 0 24 24" className="icon-svg cyan-icon"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" /></svg>
            <h3 id="walletModalTitle">Connect Web3 Wallet</h3>
          </div>
          <button className="dash-modal-close" id="walletModalClose" type="button" aria-label="Close modal" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="icon-svg"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="wallet-modal-body">
          <p className="wallet-modal-subtitle">Connect your preferred wallet to access STRDOME Ecosystem shares, staking, and owner perks.</p>
          <div className="wallet-active-card" id="walletActiveCard">
            <div className="wallet-active-badge"><span className="pulse-dot green" /> {activeWallet ? "Connected" : "Disconnected"}</div>
            <div className="wallet-active-details">
              <div className="wallet-active-icon"><svg viewBox="0 0 24 24" className="icon-svg"><WalletIcon wallet={activeWallet?.id} /></svg></div>
              <div>
                <strong id="activeWalletName">{activeWallet?.name || "Disconnected"}</strong>
                <span className="wallet-address" id="walletAddress">{activeWallet?.address || "No active wallet session"}</span>
              </div>
            </div>
            <div className="wallet-balance-row">
              <div><span className="muted-copy">Balance</span><strong>4,850.00 STR</strong></div>
              <div><span className="muted-copy">Network</span><span className="network-badge"><span className="net-dot" /> STR Mainnet</span></div>
            </div>
          </div>
          <div className="wallet-options-label">Select Wallet Provider</div>
          <div className={`wallet-options-grid${showQr ? " is-hidden" : ""}`} id="walletOptionsGrid">
            {wallets.map((wallet) => {
              const active = activeWallet?.id === wallet.id;
              const status = active
                ? "Connected"
                : !activeWallet
                  ? "Connect"
                  : wallet.id === "walletconnect"
                    ? "Scan QR"
                    : wallet.id === "ledger"
                      ? "Hardware"
                      : "Connect";
              return (
                <button
                  className={`wallet-option-card${active ? " is-active" : ""}`}
                  type="button"
                  data-wallet={wallet.id}
                  data-name={wallet.name}
                  data-addr={wallet.address}
                  key={wallet.id}
                  onClick={() => chooseWallet(wallet)}
                >
                  <div className={`wallet-opt-icon ${wallet.iconClass}`}>
                    <svg viewBox="0 0 24 24" className="icon-svg"><WalletIcon wallet={wallet.id} /></svg>
                  </div>
                  <div className="wallet-opt-info"><strong>{wallet.label}</strong><span>{wallet.description}</span></div>
                  <span className={`wallet-status-tag${active ? " active" : ""}`}>{status}</span>
                </button>
              );
            })}
          </div>
          <div className={`wallet-qr-box${showQr ? "" : " is-hidden"}`} id="walletQrBox">
            <div className="qr-frame">
              <svg viewBox="0 0 24 24" className="icon-svg qr-mock-svg"><path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM14 14h3v3h-3zM18 18h3v3h-3zM14 18h3v3h-3zM18 14h3v3h-3z" /></svg>
            </div>
            <p className="qr-note">Scan this QR Code with your WalletConnect compatible mobile app</p>
            <button className="ghost-pill small-pill" id="backToWalletsBtn" type="button" onClick={() => setShowQr(false)}>Back to All Wallets</button>
          </div>
          <div className="wallet-modal-footer">
            <span>Secured by Web3 Protocol • <a href="https://shop.strdome.com" target="_blank" rel="noopener noreferrer">Learn More</a></span>
            <button className="ghost-pill small-pill" id="disconnectWalletBtn" type="button" onClick={disconnect}>Disconnect</button>
          </div>
        </div>
      </div>
    </div>
  );
}
