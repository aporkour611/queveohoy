export type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  items: readonly FaqItem[];
  title?: string;
  sectionId: string;
  className?: string;
};

export function FaqSection({
  items,
  title = "Preguntas frecuentes",
  sectionId,
  className = "qvh-faq",
}: Props) {
  return (
    <section className={className} aria-labelledby={sectionId}>
      <h2 id={sectionId} className="qvh-faq-title">
        {title}
      </h2>
      <dl className="qvh-faq-list">
        {items.map(({ question, answer }) => (
          <div key={question} className="qvh-faq-item">
            <dt>{question}</dt>
            <dd>{answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
