import { languageOptions, type AppCopy, type Language } from '../i18n'

export type AppTab = 'swap' | 'earn' | 'borrow'

type TopNavProps = {
  activeTab: AppTab
  walletLabel: string
  language: Language
  copy: AppCopy['nav']
  onWalletAction: () => void
  onTabChange: (tab: AppTab) => void
  onLanguageChange: (language: Language) => void
}

const tabs: AppTab[] = ['swap', 'earn', 'borrow']

export function TopNav({
  activeTab,
  walletLabel,
  language,
  copy,
  onWalletAction,
  onTabChange,
  onLanguageChange,
}: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="brand-lockup">
        <div className="brand-glyph" aria-hidden="true">
          <span />
        </div>
        <h1 className="brand-wordmark">Pangolins</h1>
      </div>

      <nav className="nav-pills" aria-label={copy.primaryNavLabel}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'nav-pill is-active' : 'nav-pill'}
            aria-current={activeTab === tab ? 'page' : undefined}
            onClick={() => onTabChange(tab)}
          >
            {copy.tabs[tab]}
          </button>
        ))}
      </nav>

      <div className="top-actions">
        <div className="language-toggle" aria-label={copy.languageLabel}>
          {languageOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={language === option.id ? 'language-button is-active' : 'language-button'}
              aria-pressed={language === option.id}
              onClick={() => onLanguageChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button type="button" className="wallet-button" onClick={onWalletAction}>
          {walletLabel}
        </button>
      </div>
    </header>
  )
}
