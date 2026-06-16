import { useState } from 'react'
import FlavorProfile from './FlavorProfile'
import TriedBadge from './TriedBadge'

const RANK_LABEL = { 1: '1st', 2: '2nd', 3: '3rd' }

const PRICE_TIER_LABEL = {
  'budget': 'Budget',
  'mid-shelf': 'Mid-Shelf',
  'premium': 'Premium',
  'ultra-premium': 'Ultra-Premium',
}

const AVAILABILITY_LABEL = {
  'national': 'National',
  'regional': 'Regional',
  'allocated': 'Allocated',
  'kentucky-only': 'Kentucky Only',
}

export default function BourbonCard({ bourbon, rec, triedEntry, isWantToTry, onMarkTried, onAddWantToTry }) {
  const [showTriedForm, setShowTriedForm] = useState(false)
  const [rating, setRating] = useState(triedEntry?.rating ?? 0)
  const [notes, setNotes] = useState(triedEntry?.notes ?? '')
  const [hoverRating, setHoverRating] = useState(0)

  function submitTried() {
    if (!rating) return
    onMarkTried(bourbon.id, rating, notes)
    setShowTriedForm(false)
  }

  return (
    <div className="rounded-xl border border-bourbon-surface bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-primary text-white text-xs font-bold font-mono">
            {rec.rank}
          </span>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-bourbon-text leading-tight truncate">
              {bourbon.name}
            </h3>
            <p className="text-sm text-bourbon-muted truncate">{bourbon.distillery}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="font-mono text-sm font-medium text-bourbon-text">{bourbon.proof}°</span>
          <p className="text-xs text-bourbon-muted">{PRICE_TIER_LABEL[bourbon.price_tier]}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex gap-2 px-4 pb-3 flex-wrap">
        <span className="inline-block text-xs rounded-full bg-bourbon-surface text-bourbon-muted px-2 py-0.5">
          {AVAILABILITY_LABEL[bourbon.availability]}
        </span>
        <span className="inline-block text-xs rounded-full bg-bourbon-surface text-bourbon-muted px-2 py-0.5 font-mono">
          ${bourbon.price_usd}
        </span>
        <span className="inline-block text-xs rounded-full bg-bourbon-surface text-bourbon-muted px-2 py-0.5">
          {bourbon.mashbill.type}
        </span>
      </div>

      {/* Tried badge */}
      {triedEntry && (
        <div className="px-4 pb-3">
          <TriedBadge entry={triedEntry} />
        </div>
      )}

      {/* Match reason */}
      <div className="px-4 pb-3">
        <p className="text-sm text-bourbon-text leading-relaxed">{rec.match_reason}</p>
      </div>

      {/* Highlight */}
      {rec.highlight && (
        <div className="mx-4 mb-3 rounded-md bg-bourbon-surface px-3 py-2">
          <p className="text-xs italic text-bourbon-muted">&ldquo;{rec.highlight}&rdquo;</p>
        </div>
      )}

      {/* Flavor tags */}
      <div className="flex gap-1.5 px-4 pb-3 flex-wrap">
        {bourbon.flavor_tags.map((tag) => (
          <span
            key={tag}
            className="inline-block text-xs rounded-full border border-amber-light text-amber-primary px-2 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Flavor radar */}
      <div className="px-2 pb-2">
        <FlavorProfile bourbon={bourbon} />
      </div>

      {/* Actions */}
      {!showTriedForm ? (
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={() => setShowTriedForm(true)}
            className="flex-1 rounded-lg bg-amber-primary text-white text-sm font-medium py-2 min-h-[44px] hover:bg-amber-light transition-colors"
          >
            {triedEntry ? 'Update Rating' : 'Mark as Tried'}
          </button>
          {!isWantToTry && !triedEntry && (
            <button
              onClick={() => onAddWantToTry(bourbon.id)}
              className="flex-1 rounded-lg border border-amber-primary text-amber-primary text-sm font-medium py-2 min-h-[44px] hover:bg-bourbon-surface transition-colors"
            >
              Want to Try
            </button>
          )}
          {isWantToTry && !triedEntry && (
            <span className="flex-1 flex items-center justify-center text-sm text-bourbon-muted">
              On your list
            </span>
          )}
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-3">
          {/* Star rating picker */}
          <div className="flex gap-1.5 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-2xl min-w-[44px] min-h-[44px] transition-colors ${
                  star <= (hoverRating || rating) ? 'text-amber-primary' : 'text-bourbon-muted opacity-30'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note (optional)"
            rows={2}
            className="w-full rounded-lg border border-bourbon-surface bg-bourbon-bg px-3 py-2 text-sm text-bourbon-text placeholder:text-bourbon-muted resize-none focus:outline-none focus:ring-2 focus:ring-amber-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={submitTried}
              disabled={!rating}
              className="flex-1 rounded-lg bg-amber-primary text-white text-sm font-medium py-2 min-h-[44px] disabled:opacity-40 hover:bg-amber-light transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowTriedForm(false)}
              className="flex-1 rounded-lg border border-bourbon-surface text-bourbon-muted text-sm py-2 min-h-[44px] hover:bg-bourbon-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
