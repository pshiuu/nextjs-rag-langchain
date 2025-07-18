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
      initialMessages: styles.showInitialMessage 
        ? [{ id: 'initial', role: 'assistant', content: styles.initialMessage }]
        : undefined,
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

  // Add debugging for iframe content dimensions
  useEffect(() => {
    console.log('Embed page: Window dimensions:', window.innerWidth, 'x', window.innerHeight)
    console.log('Embed page: Document dimensions:', document.documentElement.clientWidth, 'x', document.documentElement.clientHeight)
  }, [])

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
    <>
      {/* CSS Reset for iframe content with mobile-first responsive design */}
      <style dangerouslySetInnerHTML={{
        __html: `
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
            font-size: 14px;
          }
          * {
            box-sizing: border-box;
          }
          
          /* Mobile-first responsive typography */
          @media (max-width: 480px) {
            html, body {
              font-size: 12px;
            }
          }
          
          @media (min-width: 481px) and (max-width: 768px) {
            html, body {
              font-size: 13px;
            }
          }
          
          @media (min-width: 769px) {
            html, body {
              font-size: 14px;
            }
          }
        `
      }} />
      
      <div 
        className="flex flex-col w-full h-screen relative"
        style={{
          backgroundColor: styles.backgroundColor,
          fontFamily: styles.fontFamily,
          fontSize: `clamp(12px, ${styles.fontSize}, 18px)`, // Responsive font size
          fontWeight: styles.fontWeight,
          color: styles.textColor,
          overflow: 'hidden',
          minHeight: '100vh',
          maxHeight: '100vh',
          minWidth: '280px', // Minimum width for mobile
          margin: 0,
          padding: 0,
        }}
      >
      {/* Header */}
      {styles.showHeader && (
        <div 
          className="flex items-center justify-between border-b flex-shrink-0"
          style={{
            padding: `clamp(8px, calc(${styles.padding} * 0.75), 16px)`,
            borderBottomColor: styles.borderColor,
            backgroundColor: styles.backgroundColor,
            minHeight: '44px', // Minimum touch target size
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 
              className="font-medium truncate" 
              style={{ 
                color: styles.textColor,
                fontSize: `clamp(13px, ${styles.fontSize}, 16px)`,
              }}
            >
              {styles.headerTitle}
            </h3>
            {styles.showOnlineStatus && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: '#10b981' }}
                />
                <span 
                  className="text-xs whitespace-nowrap" 
                  style={{ color: `${styles.textColor}80` }}
                >
                  Online
                </span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full border flex-shrink-0 ml-2"
            style={{
              backgroundColor: `${styles.backgroundColor}cc`,
              borderColor: styles.borderColor,
              color: styles.textColor,
              minWidth: '32px',
              minHeight: '32px',
            }}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Close Button (when no header) */}
      {!styles.showHeader && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute z-10 rounded-full border"
          style={{
            top: `clamp(8px, calc(${styles.padding} * 0.5), 12px)`,
            right: `clamp(8px, calc(${styles.padding} * 0.5), 12px)`,
            width: `clamp(32px, calc(${styles.padding} * 2), 40px)`,
            height: `clamp(32px, calc(${styles.padding} * 2), 40px)`,
            backgroundColor: `${styles.backgroundColor}cc`,
            borderColor: styles.borderColor,
            color: styles.textColor,
            minWidth: '32px',
            minHeight: '32px',
          }}
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <section 
        className="flex flex-col flex-grow w-full min-h-0"
        style={{ 
          paddingTop: styles.showHeader ? '0px' : `clamp(40px, calc(${styles.padding} * 3), 56px)`,
          paddingLeft: `clamp(8px, ${styles.padding}, 20px)`,
          paddingRight: `clamp(8px, ${styles.padding}, 20px)`,
        }}
      >
        <ul
          ref={chatParent}
          className="flex-grow overflow-y-auto flex flex-col min-h-0"
          style={{
            gap: `clamp(8px, ${styles.messageSpacing}, 20px)`,
            padding: `clamp(8px, ${styles.padding}, 16px)`,
            backgroundColor: `${styles.backgroundColor}80`,
            borderRadius: `clamp(8px, ${styles.borderRadius}, 20px)`,
            scrollBehavior: 'smooth',
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
                  className="shadow-md flex max-w-[85%] sm:max-w-[80%] lg:max-w-[75%]"
                  style={{
                    backgroundColor: m.role === 'user' 
                      ? styles.userMessageColor 
                      : styles.botMessageColor,
                    color: m.role === 'user' 
                      ? styles.textColor 
                      : styles.backgroundColor,
                    borderRadius: `clamp(8px, ${styles.borderRadius}, 20px)`,
                    padding: `clamp(8px, ${styles.messagePadding}, 16px)`,
                    fontSize: `clamp(12px, ${styles.fontSize}, 16px)`,
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                  }}
                >
                  <p className="whitespace-pre-wrap m-0">{m.content}</p>
                </div>
              </li>
            ))
          ) : (
            <div className="flex justify-center items-center h-full p-4">
              <p 
                className="text-center"
                style={{ 
                  color: `${styles.textColor}80`,
                  fontSize: `clamp(12px, ${styles.fontSize}, 16px)`,
                  lineHeight: '1.4',
                }}
              >
                {styles.showInitialMessage ? styles.initialMessage : 'Ask a question to get started.'}
              </p>
            </div>
          )}
        </ul>
      </section>

      <section 
        className="border-t flex-shrink-0"
        style={{
          padding: `clamp(8px, ${styles.padding}, 16px)`,
          backgroundColor: styles.backgroundColor,
          borderTopColor: styles.borderColor,
          minHeight: '60px', // Minimum height for touch targets
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center gap-2"
        >
          <input
            className="flex-1 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
            placeholder={styles.placeholderText}
            type="text"
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            style={{
              backgroundColor: styles.inputBackgroundColor,
              borderColor: styles.inputBorderColor,
              color: styles.inputTextColor,
              borderRadius: `clamp(6px, ${styles.borderRadius}, 12px)`,
              fontFamily: styles.fontFamily,
              fontSize: `clamp(12px, ${styles.fontSize}, 16px)`,
              minHeight: 'clamp(36px, calc(2.5rem), 44px)', // Touch-friendly height
              lineHeight: '1.4',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              backgroundColor: styles.buttonBackgroundColor,
              color: styles.buttonTextColor,
              borderRadius: `clamp(6px, ${styles.borderRadius}, 12px)`,
              fontFamily: styles.fontFamily,
              fontSize: `clamp(12px, ${styles.fontSize}, 16px)`,
              padding: `clamp(8px, calc(${styles.padding} * 0.75), 12px) clamp(12px, ${styles.padding}, 20px)`,
              minHeight: 'clamp(36px, calc(2.5rem), 44px)', // Match input height
              minWidth: 'clamp(60px, calc(4rem), 80px)', // Minimum touch target
              whiteSpace: 'nowrap',
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
            {isLoading ? '...' : styles.sendButtonText}
          </button>
        </form>
      </section>
    </div>
    </>
  )
}