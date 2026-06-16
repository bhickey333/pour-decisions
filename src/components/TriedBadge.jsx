export default function TriedBadge({ entry }) {
  if (!entry) return null

  const stars = Array.from({ length: 5 }, (_, i) => i < entry.rating)

  return (
    <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm">
      <span className="text-amber-primary font-medium shrink-0">Tried</span>
      <div className="flex gap-0.5 shrink-0">
        {stars.map((filled, i) => (
          <span key={i} className={filled ? 'text-amber-primary' : 'text-bourbon-muted opacity-30'}>
            ★
          </span>
        ))}
      </div>
      {entry.notes && (
        <span className="text-bourbon-muted truncate">{entry.notes}</span>
      )}
    </div>
  )
}
