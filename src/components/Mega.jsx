// Giant condensed gradient headline, split into letters for animation.
export function Mega({ text, className = '', as: Tag = 'h2', ...rest }) {
  return (
    <Tag className={`mega ${className}`} aria-label={text} {...rest}>
      {[...text].map((c, i) => (
        <span key={i} className="ch" aria-hidden="true">
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </Tag>
  )
}
