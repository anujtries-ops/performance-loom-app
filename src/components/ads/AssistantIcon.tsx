export function AssistantIcon({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 32 32" className={`assistant-icon ${className}`} aria-hidden="true">
    {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="16" cy="6" rx="3" ry="4.5" transform={`rotate(${i * 45} 16 16)`} />)}
  </svg>;
}