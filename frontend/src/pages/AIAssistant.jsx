import { useState, useRef, useEffect } from 'react'

export default function AIAssistant({ user, showToast }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Привет! Как я могу вам помочь?' }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')

    const assistantMessage = {
      role: 'assistant',
      content: 'Это демонстрационный ответ. Функция AI в разработке.'
    }
    setMessages(prev => [...prev, assistantMessage])
  }

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <h2 style={{ marginBottom: 16 }}>🤖 AI Ассистент</h2>

      <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '80%',
              background: msg.role === 'user' ? 'var(--primary-color)' : '#f0f0f0',
              color: msg.role === 'user' ? 'white' : 'black',
              padding: '12px 16px',
              borderRadius: 12,
              wordWrap: 'break-word'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Задайте вопрос..."
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid var(--border-color)',
            borderRadius: 8
          }}
        />
        <button onClick={handleSend} className="btn btn-primary">
          ➤
        </button>
      </div>
    </div>
  )
}
