export type AppTab = 'swap' | 'earn' | 'borrow'

type TopNavProps = {
  activeTab: AppTab
  walletLabel: string
  onWalletAction: () => void
  onTabChange: (tab: AppTab) => void
}

const tabs: Array<{ id: AppTab; label: string }> = [
  { id: 'swap', label: 'Swap' },
  { id: 'earn', label: 'Earn' },
  { id: 'borrow', label: 'Borrow' },
]

export function TopNav({ activeTab, walletLabel, onWalletAction, onTabChange }: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="brand-lockup">
        <div className="brand-glyph" aria-hidden="true">
          <span />
        </div>
        <h1 className="brand-wordmark">Pangolins</h1>
      </div>

      <nav className="nav-pills" aria-label="Primary">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'nav-pill is-active' : 'nav-pill'}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <button type="button" className="wallet-button" onClick={onWalletAction}>
        {walletLabel}
      </button>
    </header>
  )
}
