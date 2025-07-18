'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useChat } from 'ai/react'
import { useRef, useEffect } from 'react'

interface EmbedChatPageProps {
  params: {
    apiKey: string
  }
}

export default function EmbedChatPage({ params }: EmbedChatPageProps) {
  const { apiKey } = params

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      // Use the new public API endpoint
      api: '/api/public/chat',
      // Pass the apiKey in the request body
      body: {
        apiKey,
      },
    })

  const chatParent = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const domNode = chatParent.current
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col w-full h-screen bg-background">
      <section className="container px-4 py-4 flex flex-col flex-grow gap-4 mx-auto max-w-3xl">
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
              <p className="text-muted-foreground">
                Ask a question to get started.
              </p>
            </div>
          )}
        </ul>
      </section>

      <section className="p-4 bg-background">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-3xl mx-auto items-center"
        >
          <Input
            className="flex-1 min-h-[40px]"
            placeholder="Type your question..."
            type="text"
            value={input}
            onChange={handleInputChange}
          />
          <Button className="ml-2" type="submit" disabled={isLoading}>
            Submit
          </Button>
        </form>
      </section>
    </div>
  )
}