'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useChat } from 'ai/react'
import { useRef, useEffect } from 'react'
import Link from 'next/link'

interface ChatProps {
  chatbotId: string
  chatbotName: string
}

export function Chat({ chatbotId, chatbotName }: ChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages, // <-- Destructure the setMessages function
  } = useChat({
    api: '/api/chat',
    body: {
      chatbotId,
    },
    onError: (e) => {
      console.error(e)
    },
  })

  const chatParent = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const domNode = chatParent.current
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight
    }
  }, [messages])

  const handleRestart = () => {
    setMessages([])
  }

  return (
    <main className="flex flex-col w-full h-screen max-h-dvh bg-background">
      <header className="p-4 border-b w-full flex justify-between items-center">
        <h1 className="text-2xl font-bold">{chatbotName}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleRestart} variant="outline">
            Restart Chat
          </Button>
          <Button asChild variant="outline">
            <Link href="/chatbots">Back to My Chatbots</Link>
          </Button>
        </div>
      </header>

      <section className="container px-4 pb-10 flex flex-col flex-grow gap-4 mx-auto max-w-3xl">
        <ul
          ref={chatParent}
          className="h-1 p-4 flex-grow bg-muted/50 rounded-lg overflow-y-auto flex flex-col gap-4"
        >
          {messages.length > 0 ? (
            messages.map((m) => (
              <li
                key={m.id}
                className={`flex flex-row ${
                  m.role === 'user' ? '' : 'flex-row-reverse'
                }`}
              >
                <div
                  className={`rounded-xl p-4 shadow-md flex ${
                    m.role === 'user'
                      ? 'bg-background'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <p>{m.content}</p>
                </div>
              </li>
            ))
          ) : (
            <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">Start a new conversation</p>
            </div>
          )}
        </ul>
      </section>

      <section className="p-4">
        {error && (
          <p className="text-red-500 mb-2 text-center">{error.message}</p>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-3xl mx-auto items-center"
        >
          <Input
            className="flex-1 min-h-[40px]"
            placeholder="Type your question here..."
            type="text"
            value={input}
            onChange={handleInputChange}
          />
          <Button className="ml-2" type="submit" disabled={isLoading}>
            Submit
          </Button>
        </form>
      </section>
    </main>
  )
}