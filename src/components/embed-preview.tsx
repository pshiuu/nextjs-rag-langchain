'use client'

import { useState, useEffect } from 'react'
import { ChatbotStyle } from '@/types/chatbot'
import { X } from 'lucide-react'

interface EmbedPreviewProps {
  styles: ChatbotStyle
  chatbotName?: string
}

export function EmbedPreview({ styles, chatbotName = 'Preview Bot' }: EmbedPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [messages, setMessages] = useState([])

  // Update messages when initial message settings change
  useEffect(() => {
    const initialMessages = []
    if (styles.showInitialMessage) {
      initialMessages.push({ id: 'initial', role: 'bot', content: styles.initialMessage })
    }
    setMessages(initialMessages)
  }, [styles.showInitialMessage, styles.initialMessage])
  
  // Handle auto-open simulation
  useEffect(() => {
    // Don't auto-open if it's already open
    if (isOpen) return
    
    let openTimeout: NodeJS.Timeout
    
    if (styles.autoOpen === 'immediately') {
      openTimeout = setTimeout(() => toggleChat(true), 1000)
    } else if (styles.autoOpen === 'delayed') {
      openTimeout = setTimeout(() => toggleChat(true), (styles.autoOpenDelay || 5) * 1000)
    }
    
    // Cleanup on unmount or when settings change
    return () => clearTimeout(openTimeout)
  }, [styles.autoOpen, styles.autoOpenDelay, isOpen])

  const toggleChat = (forceOpen = false) => {
    if (isAnimating && !forceOpen) return
    
    setIsAnimating(true)
    setIsOpen(forceOpen ? true : !isOpen)
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 400)
  }

  // Convert CSS units to pixels for proper scaling
  const convertToPixels = (value: string): number => {
    if (value.includes('px')) {
      return parseInt(value.replace('px', ''))
    } else if (value.includes('rem')) {
      return parseInt(value.replace('rem', '')) * 16 // 1rem = 16px
    } else if (value.includes('em')) {
      return parseInt(value.replace('em', '')) * 16
    } else if (value.includes('%')) {
      return (parseInt(value.replace('%', '')) / 100) * 400 // Relative to container
    }
    return parseInt(value) || 400 // Default fallback
  }

  const chatWidth = Math.min(convertToPixels(styles.maxWidth), 500) // Cap at 500px for preview
  const chatHeight = Math.min(convertToPixels(styles.height), 700) // Cap at 700px for preview
  const scale = Math.min(1, 400 / chatWidth) // Scale down if too wide

  return (
    <>
      {/* CSS Animation Keyframes */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideUp {
            from {
              transform: scale(${scale}) translateY(100%) scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(${scale}) translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes slideDown {
            from {
              transform: scale(${scale}) translateY(0) scale(1);
              opacity: 1;
            }
            to {
              transform: scale(${scale}) translateY(100%) scale(0.95);
              opacity: 0;
            }
          }
        `
      }} />
    
    <div className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300" style={{ height: '600px' }}>
      {/* Simulated website background */}
      <div className="absolute inset-0 p-8">
        <div className="bg-white rounded-lg shadow-sm p-8 h-full relative overflow-hidden">
          {/* Website content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-100 rounded"></div>
              <div className="h-20 bg-gray-100 rounded"></div>
            </div>
          </div>
          
          <div className="absolute top-4 left-4 text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded">
            Preview Website (1200px viewport)
          </div>
          
          {/* Viewport indicator */}
          <div className="absolute bottom-4 left-4 text-xs text-gray-400 bg-white px-2 py-1 rounded">
            Chat: {styles.maxWidth} × {styles.height}
            {scale < 1 && (
              <span className="block text-orange-600 font-medium">
                Scaled to {Math.round(scale * 100)}% for preview
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chat Button - positioned relative to website viewport */}
      <button
        onClick={toggleChat}
        className="absolute border-none cursor-pointer shadow-lg z-10 flex items-center justify-center transition-all duration-300 hover:scale-105"
        style={{
          bottom: '32px',
          right: '32px',
          width: styles.toggleButtonSize,
          height: styles.toggleButtonSize,
          borderRadius: styles.toggleButtonBorderRadius,
          backgroundColor: isOpen 
            ? styles.toggleButtonCloseBackgroundColor 
            : styles.toggleButtonBackgroundColor,
          color: isOpen 
            ? styles.toggleButtonCloseTextColor 
            : styles.toggleButtonTextColor,
          fontFamily: styles.fontFamily,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = styles.toggleButtonHoverColor
          } else {
            e.currentTarget.style.backgroundColor = styles.toggleButtonCloseHoverColor
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = styles.toggleButtonBackgroundColor
          } else {
            e.currentTarget.style.backgroundColor = styles.toggleButtonCloseBackgroundColor
          }
        }}
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12H16M8 8H16M8 16H13M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H7L3 24V6C3 4.89543 3.89543 4 5 4H7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div
          className="absolute shadow-xl"
          style={{
            bottom: '32px',
            right: '32px',
            width: `${chatWidth}px`,
            height: `${chatHeight}px`,
            backgroundColor: styles.backgroundColor,
            borderRadius: styles.borderRadius,
            border: `1px solid ${styles.borderColor}`,
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            color: styles.textColor,
            overflow: 'hidden',
            transform: `scale(${scale}) translateY(0)`,
            transformOrigin: 'bottom right',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: isOpen ? 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Close Button */}
          <button
            onClick={toggleChat}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full border flex items-center justify-center transition-colors"
            style={{
              backgroundColor: `${styles.backgroundColor}cc`,
              borderColor: styles.borderColor,
              color: styles.textColor,
            }}
          >
            <X size={16} />
          </button>

          {/* Chat Header */}
          <div 
            className="border-b"
            style={{
              padding: styles.padding,
              backgroundColor: styles.backgroundColor,
              borderBottomColor: styles.borderColor,
            }}
          >
            <h3 className="font-medium" style={{ 
              color: styles.textColor,
              fontSize: styles.fontSize,
            }}>
              {chatbotName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#10b981' }}
              ></div>
              <span style={{ 
                color: `${styles.textColor}80`,
                fontSize: '12px',
              }}>
                Online
              </span>
            </div>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto flex flex-col"
            style={{
              height: 'calc(100% - 120px)',
              backgroundColor: `${styles.backgroundColor}80`,
              padding: styles.padding,
              gap: styles.messageSpacing,
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[80%] shadow-sm"
                  style={{
                    backgroundColor: message.role === 'user' 
                      ? styles.userMessageColor 
                      : styles.botMessageColor,
                    color: message.role === 'user' 
                      ? styles.textColor 
                      : styles.backgroundColor,
                    borderRadius: styles.borderRadius,
                    padding: styles.messagePadding,
                  }}
                >
                  <p 
                    className="whitespace-pre-wrap"
                    style={{
                      fontSize: styles.fontSize,
                      fontWeight: styles.fontWeight,
                    }}
                  >
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div 
            className="border-t"
            style={{
              padding: styles.padding,
              backgroundColor: styles.backgroundColor,
              borderTopColor: styles.borderColor,
            }}
          >
            <div className="flex gap-2 items-center">
              <input
                className="flex-1 px-3 py-2 border rounded-md outline-none"
                placeholder="Type your message..."
                disabled
                style={{
                  backgroundColor: styles.inputBackgroundColor,
                  borderColor: styles.inputBorderColor,
                  color: styles.inputTextColor,
                  borderRadius: styles.borderRadius,
                  fontFamily: styles.fontFamily,
                  fontSize: styles.fontSize,
                  minHeight: '40px',
                }}
              />
              <button
                className="px-4 py-2 rounded-md font-medium transition-colors"
                disabled
                style={{
                  backgroundColor: styles.buttonBackgroundColor,
                  color: styles.buttonTextColor,
                  borderRadius: styles.borderRadius,
                  fontFamily: styles.fontFamily,
                  fontSize: styles.fontSize,
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
} 