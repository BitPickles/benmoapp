import type { AppCopy } from '../i18n'

type BetaFootnoteProps = {
  copy: AppCopy['beta']
}

export function BetaFootnote({ copy }: BetaFootnoteProps) {
  return (
    <p className="beta-footnote">
      {copy.footnote}
    </p>
  )
}
