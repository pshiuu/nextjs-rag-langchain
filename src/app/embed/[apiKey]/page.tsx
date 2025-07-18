'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useChat } from 'ai/react'
import { useRef, useEffect } from 'react'
import { X } from 'lucide-react'

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

  const handleClose = () => {
    // Try to close iframe by communicating with parent window
    try {
      if (window.parent !== window) {
        // We're in an iframe, send close message to parent
        window.parent.postMessage({ type: 'CLOSE_CHAT' }, '*')
      } else {
        // We're in a popup or standalone window
        window.close()
      }
    } catch (error) {
      console.log('Could not close chat window:', error)
    }
  }

  return (
    <div className="flex flex-col w-full h-screen bg-background relative">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background/90 border border-border/50"
        aria-label="Close chat"
      >
        <X className="h-4 w-4" />
      </Button>

      <section className="container px-4 py-4 flex flex-col flex-grow gap-4 mx-auto max-w-3xl pt-12">
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
                  className={`rounded-xl p-4 shadow-md flex max-w-[80%] ${
                    m.role === 'user'
                      ? 'bg-background'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
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

      <section className="p-4 bg-background border-t">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-3xl mx-auto items-center gap-2"
        >
          <Input
            className="flex-1 min-h-[40px]"
            placeholder="Type your question..."
            type="text"
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? '...' : 'Send'}
          </Button>
        </form>
      </section>
    </div>
  )
}