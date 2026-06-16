import bourbons from '@/data/bourbons.json'

function findBourbon(id) {
  return bourbons.find((b) => b.id === id)
}

export default function CabinetView({ profile, onMarkTried, onRemoveWantToTry }) {
  const { tried, want_to_try } = profile

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-6">
      {/* Tried section */}
      <section>
        <h2 className="font-display font-semibold text-bourbon-text text-lg mb-3">
          Tried ({tried.length})
        </h2>
        {tried.length === 0 ? (
          <p className="text-sm text-bourbon-muted">Nothing tried yet. Ask Higgins for recommendations.</p>
        ) : (
          <div className="space-y-3">
            {tried.map((entry) => {
              const bourbon = findBourbon(entry.id)
              if (!bourbon) return null
              return (
                <div
                  key={entry.id}
                  className="rounded-xl bg-bourbon-surface border border-bourbon-surface p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-bourbon-text">{bourbon.name}</h3>
                      <p className="text-xs text-bourbon-muted">{bourbon.distillery}</p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={i < entry.rating ? 'text-amber-primary' : 'text-bourbon-muted opacity-30'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-bourbon-muted italic">&ldquo;{entry.notes}&rdquo;</p>
                  )}
                  <p className="text-xs text-bourbon-muted">{entry.date}</p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Want to Try section */}
      <section>
        <h2 className="font-display font-semibold text-bourbon-text text-lg mb-3">
          Want to Try ({want_to_try.length})
        </h2>
        {want_to_try.length === 0 ? (
          <p className="text-sm text-bourbon-muted">Your wishlist is empty. Start exploring.</p>
        ) : (
          <div className="space-y-3">
            {want_to_try.map((id) => {
              const bourbon = findBourbon(id)
              if (!bourbon) return null
              return (
                <div
                  key={id}
                  className="rounded-xl bg-bourbon-surface border border-bourbon-surface p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="font-display font-semibold text-bourbon-text">{bourbon.name}</h3>
                    <p className="text-xs text-bourbon-muted">
                      {bourbon.distillery} · ${bourbon.price_usd} · {bourbon.proof}°
                    </p>
                  </div>
                  <button
                    onClick={() => onMarkTried(id, 3)}
                    className="shrink-0 rounded-lg bg-amber-primary text-white text-xs font-medium px-3 py-2 min-h-[44px] hover:bg-amber-light transition-colors"
                  >
                    I've tried it
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
