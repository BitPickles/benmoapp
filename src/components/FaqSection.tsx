const questions = [
  'What is this?',
  'Does Pangolins take any fees?',
  'Is it safe?',
  'Why do gas fees in wallets not match what I see in the UI?',
  'Will I be eligible for aggregator airdrops if I swap through Pangolins?',
  'I swapped ETH on a solver route but it disappeared, what happened?',
]

export function FaqSection() {
  return (
    <section className="faq-section">
      <h2 className="faq-title">FAQ</h2>

      <div className="faq-list">
        {questions.map((question) => (
          <details key={question} className="faq-item">
            <summary>
              <span>{question}</span>
              <span aria-hidden="true">⌄</span>
            </summary>
            <p>
              This is placeholder FAQ copy for the current MVP. The real product can replace it with your production copy once content is finalized.
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
