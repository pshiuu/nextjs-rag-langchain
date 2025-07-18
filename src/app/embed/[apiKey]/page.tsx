'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useChat } from 'ai/react'
import { useRef, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { ChatbotStyle, defaultChatbotStyle } from '@/types/chatbot'

interface EmbedChatPageProps {
  params: {
    apiKey: string
  }
}

export default function EmbedChatPage({ params }: EmbedChatPageProps) {
  const { apiKey } = params
  const [styles, setStyles] = useState<ChatbotStyle>(defaultChatbotStyle)
  const [stylesLoaded, setStylesLoaded] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/public/chat',
      body: {
        apiKey,
      },
    })

  const chatParent = useRef<HTMLUListElement>(null)

  // Fetch custom styles
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        console.log('Fetching styles for apiKey:', apiKey)
        const response = await fetch('/api/public/styles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Received styles data:', data)
          if (data.styles) {
            console.log('Applying custom styles:', data.styles)
            setStyles(data.styles)
          } else {
            console.log('No custom styles found, using defaults')
          }
        } else {
          console.log('Failed to fetch styles, status:', response.status)
        }
      } catch (error) {
        console.log('Could not fetch custom styles:', error)
      } finally {
        setStylesLoaded(true)
      }
    }

    fetchStyles()
  }, [apiKey])

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

  // Show loading until styles are loaded to prevent flash of unstyled content
  if (!stylesLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  console.log('Rendering with styles:', styles)

  return (
    <div 
      className="flex flex-col w-full relative"
      style={{
        height: styles.height,
        backgroundColor: styles.backgroundColor,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        color: styles.textColor,
        maxWidth: styles.maxWidth,
        margin: '0 auto',
        borderRadius: styles.borderRadius,
        overflow: 'hidden',
        border: `1px solid ${styles.borderColor}`,
      }}
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full border"
        style={{
          backgroundColor: `${styles.backgroundColor}cc`, // cc = 80% opacity
          borderColor: styles.borderColor,
          color: styles.textColor,
        }}
        aria-label="Close chat"
      >
        <X className="h-4 w-4" />
      </Button>

      <section 
        className="px-4 py-4 flex flex-col flex-grow gap-4 mx-auto w-full pt-12"
        style={{ padding: styles.padding }}
      >
        <ul
          ref={chatParent}
          className="h-1 flex-grow overflow-y-auto flex flex-col"
          style={{
            gap: styles.messageSpacing,
            padding: styles.padding,
            backgroundColor: `${styles.backgroundColor}80`, // 50% opacity
            borderRadius: styles.borderRadius,
          }}
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
                  className="shadow-md flex max-w-[80%]"
                  style={{
                    backgroundColor: m.role === 'user' 
                      ? styles.userMessageColor 
                      : styles.botMessageColor,
                    color: m.role === 'user' 
                      ? styles.textColor 
                      : styles.backgroundColor,
                    borderRadius: styles.borderRadius,
                    padding: styles.messagePadding,
                  }}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </li>
            ))
          ) : (
            <div className="flex justify-center items-center h-full">
              <p style={{ color: `${styles.textColor}80` }}>
                Ask a question to get started.
              </p>
            </div>
          )}
        </ul>
      </section>

      <section 
        className="border-t"
        style={{
          padding: styles.padding,
          backgroundColor: styles.backgroundColor,
          borderTopColor: styles.borderColor,
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center gap-2"
        >
          <input
            className="flex-1 min-h-[40px] px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-opacity-50"
            placeholder="Type your question..."
            type="text"
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            style={{
              backgroundColor: styles.inputBackgroundColor,
              borderColor: styles.inputBorderColor,
              color: styles.inputTextColor,
              borderRadius: styles.borderRadius,
              fontFamily: styles.fontFamily,
              fontSize: styles.fontSize,
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: styles.buttonBackgroundColor,
              color: styles.buttonTextColor,
              borderRadius: styles.borderRadius,
              fontFamily: styles.fontFamily,
              fontSize: styles.fontSize,
            }}
            onMouseEnter={(e) => {
              if (!isLoading && input.trim()) {
                e.currentTarget.style.backgroundColor = styles.buttonHoverColor
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = styles.buttonBackgroundColor
            }}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </section>
    </div>
  )
}