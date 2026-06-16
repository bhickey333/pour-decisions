export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-amber-primary flex items-center justify-center text-white text-xs font-bold font-display mb-1">
          H
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-amber-primary text-white rounded-br-sm'
            : 'bg-bourbon-surface text-bourbon-text rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
