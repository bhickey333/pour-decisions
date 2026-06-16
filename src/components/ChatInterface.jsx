import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import BourbonCard from './BourbonCard'
import CabinetView from './CabinetView'
import { useUserProfile } from '@/hooks/useUserProfile'
import bourbons from '@/data/bourbons.json'

const GREETING = {
  role: 'assistant',
  content: `Good evening. I am Higgins, and I am at your service.\n\nTell me what you're looking for — perhaps a flavor profile, a bottle you've enjoyed before, a budget, or simply a mood — and I shall find you the perfect Kentucky pour.\n\nWhat are we drinking tonight?`,
  recommendations: [],
}

function findBourbon(id) {
  return bourbons.find((b) => b.id === id) ?? null
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'cabinet'
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const { profile, markTried, addWantToTry, removeWantToTry, getTriedEntry, isWantToTry } =
    useUserProfile()

  // Scroll to bottom on new messages
  useEffect(() => {
    if (activeTab === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeTab])

  async function sendMessage(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    // Build API messages array (role + content only, no recommendations)
    const apiMessages = updatedMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          bourbonDb: bourbons,
          userProfile: profile,
        }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()

      // Parse Higgins's JSON response
      let parsed = { message: '', recommendations: [] }
      try {
        // Strip markdown code fences if present
        const clean = data.text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
        parsed = JSON.parse(clean)
      } catch {
        // If JSON parse fails, treat entire response as a plain message
        parsed = { message: data.text, recommendations: [] }
      }

      const assistantMessage = {
        role: 'assistant',
        content: parsed.message,
        recommendations: parsed.recommendations ?? [],
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I appear to be experiencing a momentary lapse, sir. Do try again in a moment.',
          recommendations: [],
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-bourbon-bg max-w-md mx-auto relative">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-bourbon-surface shadow-sm">
        <div>
          <h1 className="font-display font-semibold text-bourbon-text text-lg leading-none">
            Pour Decisions
          </h1>
          <p className="text-xs text-bourbon-muted mt-0.5">Your Kentucky bourbon butler</p>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-1 bg-bourbon-surface rounded-lg p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors min-h-[32px] ${
              activeTab === 'chat'
                ? 'bg-white text-bourbon-text shadow-sm'
                : 'text-bourbon-muted hover:text-bourbon-text'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('cabinet')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors min-h-[32px] ${
              activeTab === 'cabinet'
                ? 'bg-white text-bourbon-text shadow-sm'
                : 'text-bourbon-muted hover:text-bourbon-text'
            }`}
          >
            Cabinet
          </button>
        </div>
      </header>

      {/* Main content */}
      {activeTab === 'cabinet' ? (
        <CabinetView
          profile={profile}
          onMarkTried={markTried}
          onRemoveWantToTry={removeWantToTry}
        />
      ) : (
        <>
          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-3">
                <MessageBubble message={msg} />
                {/* Recommendation cards */}
                {msg.recommendations?.length > 0 && (
                  <div className="space-y-3 pl-10">
                    {msg.recommendations.map((rec) => {
                      const bourbon = findBourbon(rec.id)
                      if (!bourbon) return null
                      return (
                        <BourbonCard
                          key={rec.id}
                          bourbon={bourbon}
                          rec={rec}
                          triedEntry={getTriedEntry(bourbon.id)}
                          isWantToTry={isWantToTry(bourbon.id)}
                          onMarkTried={markTried}
                          onAddWantToTry={addWantToTry}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-primary flex items-center justify-center text-white text-xs font-bold font-display">
                  H
                </div>
                <div className="bg-bourbon-surface rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-bourbon-muted animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-bourbon-muted animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-bourbon-muted animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <form
            onSubmit={sendMessage}
            className="shrink-0 flex gap-2 px-4 py-3 bg-white border-t border-bourbon-surface"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Higgins for a recommendation..."
              disabled={loading}
              className="flex-1 rounded-xl border border-bourbon-surface bg-bourbon-bg px-4 py-2.5 text-sm text-bourbon-text placeholder:text-bourbon-muted focus:outline-none focus:ring-2 focus:ring-amber-primary disabled:opacity-60 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-xl bg-amber-primary text-white px-4 py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-amber-light transition-colors min-h-[44px] min-w-[44px]"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  )
}
