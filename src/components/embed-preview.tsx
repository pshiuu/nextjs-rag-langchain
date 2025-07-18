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
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([])
  const [viewportWidth, setViewportWidth] = useState(1200) // Default desktop view

  // Breakpoint options for testing
  const breakpoints = [
    { name: 'Mobile', width: 375, icon: '📱' },
    { name: 'Mobile L', width: 425, icon: '📱' },
    { name: 'Tablet', width: 768, icon: '📲' },
    { name: 'Laptop', width: 1024, icon: '💻' },
    { name: 'Desktop', width: 1200, icon: '🖥️' },
  ]

  // Update messages when initial message settings change
  useEffect(() => {
    const initialMessages: Array<{ id: string; role: string; content: string }> = []
    if (styles.showInitialMessage) {
      initialMessages.push({ id: 'initial', role: 'bot', content: styles.initialMessage })
    }
    // Add preview messages to demonstrate the chat
    initialMessages.push(
      { id: '2', role: 'user', content: 'This is a preview of your custom chat!' },
      { id: '3', role: 'bot', content: 'You can customize colors, fonts, text, and behavior using the editor on the left.' }
    )
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

  const handleToggleClick = () => {
    toggleChat()
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
      return (parseInt(value.replace('%', '')) / 100) * viewportWidth // Relative to viewport
    }
    return parseInt(value) || 400 // Default fallback
  }

  // Calculate actual responsive dimensions as they would appear on real devices
  const calculateResponsiveDimensions = () => {
    const configuredWidth = convertToPixels(styles.maxWidth)
    const configuredHeight = convertToPixels(styles.height)
    const configuredButtonSize = convertToPixels(styles.toggleButtonSize || '60px')
    
    let actualWidth, actualHeight, actualButtonSize, positioning
    
    if (viewportWidth <= 480) {
      // Mobile: Constrained by viewport, smaller button
      actualWidth = Math.min(viewportWidth - 32, configuredWidth)
      actualHeight = Math.min(viewportWidth * 1.2, configuredHeight) // Reasonable mobile height
      actualButtonSize = Math.max(48, Math.min(configuredButtonSize, 56))
      positioning = {
        chatRight: '16px',
        chatLeft: 'auto',
        buttonRight: '16px',
        buttonBottom: '16px',
        chatBottom: `${actualButtonSize + 24}px`
      }
    } else if (viewportWidth <= 768) {
      // Tablet: Medium constraints
      actualWidth = Math.min(viewportWidth * 0.9, configuredWidth)
      actualHeight = Math.min(viewportWidth * 0.8, configuredHeight)
      actualButtonSize = Math.max(52, Math.min(configuredButtonSize, 64))
      positioning = {
        chatRight: '20px',
        chatLeft: 'auto',
        buttonRight: '20px',
        buttonBottom: '20px',
        chatBottom: `${actualButtonSize + 30}px`
      }
    } else {
      // Desktop: Use full configured dimensions
      actualWidth = configuredWidth
      actualHeight = configuredHeight  
      actualButtonSize = Math.max(56, Math.min(configuredButtonSize, 80))
      positioning = {
        chatRight: '32px',
        chatLeft: 'auto',
        buttonRight: '32px',
        buttonBottom: '32px',
        chatBottom: `${actualButtonSize + 30}px`
      }
    }
    
    return { actualWidth, actualHeight, actualButtonSize, positioning }
  }

  const { actualWidth, actualHeight, actualButtonSize, positioning } = calculateResponsiveDimensions()
  
  // Calculate scaling to fit preview container (but maintain relative sizes between breakpoints)
  const maxPreviewWidth = 450
  const maxPreviewHeight = 500
  
  // Calculate total space needed
  const buttonBottomMargin = parseInt(positioning.buttonBottom) || 32
  const chatBottomMargin = parseInt(positioning.chatBottom) || (actualButtonSize + 30)
  const totalHeight = actualHeight + chatBottomMargin + 40
  
  // Scale only if needed to fit in preview
  const widthScale = actualWidth > maxPreviewWidth ? maxPreviewWidth / actualWidth : 1
  const heightScale = totalHeight > maxPreviewHeight ? maxPreviewHeight / totalHeight : 1
  const scale = Math.min(widthScale, heightScale)

  return (
    <>
      {/* CSS Animation Keyframes */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideUp {
            from {
              transform: scale(${scale}) translateY(100%);
              opacity: 0;
            }
            to {
              transform: scale(${scale}) translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes slideDown {
            from {
              transform: scale(${scale}) translateY(0);
              opacity: 1;
            }
            to {
              transform: scale(${scale}) translateY(100%);
              opacity: 0;
            }
          }
        `
      }} />

      {/* Breakpoint Selector */}
      <div className="mb-4 p-3 bg-slate-50 rounded-lg border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-700">Preview Viewport</h4>
          <span className="text-xs text-slate-500">{viewportWidth}px</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {breakpoints.map((bp) => (
            <button
              key={bp.name}
              onClick={() => setViewportWidth(bp.width)}
              className={`px-3 py-2 text-xs rounded-md font-medium transition-colors ${
                viewportWidth === bp.width
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {bp.icon} {bp.name}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Chat dimensions: {actualWidth}×{actualHeight}px • Button: {actualButtonSize}px
          {scale < 1 && (
            <span className="block text-orange-600 font-medium mt-1">
              ⚠️ Scaled to {Math.round(scale * 100)}% to fit preview (total height: {Math.round(totalHeight)}px)
            </span>
          )}
        </div>
      </div>
    
    <div 
      className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 transition-all duration-300" 
      style={{ 
        height: `${Math.max(500, Math.min(700, totalHeight * scale + 100))}px`, // Dynamic height based on content
        width: viewportWidth <= 480 ? '100%' : `${Math.max(400, Math.min(600, actualWidth * scale + 100))}px`,
        maxWidth: '100%',
        margin: '0 auto'
      }}
    >
      {/* Simulated website background */}
      <div className="absolute inset-0 p-2 sm:p-4 lg:p-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 h-full relative overflow-hidden">
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
            Preview Website ({viewportWidth}px viewport)
          </div>
          
          {/* Viewport indicator */}
          <div className="absolute bottom-4 left-4 text-xs text-gray-400 bg-white px-2 py-1 rounded">
            Chat: {Math.round(actualWidth * scale)} × {Math.round(actualHeight * scale)}px 
            {scale < 1 ? (
              <span className="block text-orange-600 font-medium">
                (Scaled from {actualWidth} × {actualHeight}px)
              </span>
            ) : (
              <span className="block text-green-600 font-medium">
                (Actual size)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chat Button - positioned relative to website viewport */}
      <button
        onClick={handleToggleClick}
        className="absolute border-none cursor-pointer shadow-lg z-10 flex items-center justify-center transition-all duration-300 hover:scale-105"
        style={{
          bottom: positioning.buttonBottom,
          right: positioning.buttonRight,
          width: `${actualButtonSize}px`,
          height: `${actualButtonSize}px`,
          borderRadius: styles.toggleButtonBorderRadius,
          backgroundColor: isOpen 
            ? styles.toggleButtonCloseBackgroundColor 
            : styles.toggleButtonBackgroundColor,
          color: isOpen 
            ? styles.toggleButtonCloseTextColor 
            : styles.toggleButtonTextColor,
          fontFamily: styles.fontFamily,
          minWidth: `${Math.max(44, actualButtonSize)}px`,
          minHeight: `${Math.max(44, actualButtonSize)}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'bottom right',
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
          className="absolute shadow-xl flex flex-col"
          style={{
            bottom: positioning.chatBottom,
            right: positioning.chatRight,
            left: positioning.chatLeft,
            width: `${actualWidth}px`,
            height: `${actualHeight}px`,
            backgroundColor: styles.backgroundColor,
            borderRadius: `clamp(8px, ${styles.borderRadius}, 20px)`,
            border: `1px solid ${styles.borderColor}`,
            fontFamily: styles.fontFamily,
            fontSize: `clamp(12px, ${styles.fontSize}, 16px)`,
            fontWeight: styles.fontWeight,
            color: styles.textColor,
            overflow: 'hidden',
            transform: `scale(${scale}) translateY(0)`,
            transformOrigin: 'bottom right',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: isOpen ? 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Header */}
          {styles.showHeader && (
            <div 
              className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0"
              style={{
                borderBottomColor: styles.borderColor,
                backgroundColor: styles.backgroundColor,
              }}
            >
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-xs" style={{ color: styles.textColor }}>
                  {styles.headerTitle}
                </h3>
                {styles.showOnlineStatus && (
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: '#10b981' }}
                    />
                    <span className="text-xs" style={{ color: `${styles.textColor}80` }}>
                      Online
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleToggleClick}
                className="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: `${styles.backgroundColor}cc`,
                  borderColor: styles.borderColor,
                  color: styles.textColor,
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Close Button (when no header) */}
          {!styles.showHeader && (
            <button
              onClick={handleToggleClick}
              className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full border flex items-center justify-center transition-colors"
              style={{
                backgroundColor: `${styles.backgroundColor}cc`,
                borderColor: styles.borderColor,
                color: styles.textColor,
              }}
            >
              <X size={14} />
            </button>
          )}



          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto flex flex-col"
            style={{
              backgroundColor: `${styles.backgroundColor}80`,
              padding: `${parseInt(styles.padding) * 0.75}px`,
              paddingTop: styles.showHeader ? `${parseInt(styles.padding) * 0.5}px` : `${parseInt(styles.padding) * 1.5}px`,
              minHeight: 0,
            }}
          >
            {messages.length > 0 ? (
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[85%] shadow-sm"
                      style={{
                        backgroundColor: message.role === 'user' 
                          ? styles.userMessageColor 
                          : styles.botMessageColor,
                        color: message.role === 'user' 
                          ? styles.textColor 
                          : styles.backgroundColor,
                        borderRadius: styles.borderRadius,
                        padding: `${parseInt(styles.messagePadding) * 0.6}px`,
                        fontSize: `${Math.max(10, parseInt(styles.fontSize) * 0.8)}px`,
                        fontWeight: styles.fontWeight,
                        lineHeight: '1.4',
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p 
                  className="text-center px-4"
                  style={{ 
                    color: `${styles.textColor}60`,
                    fontSize: `${Math.max(10, parseInt(styles.fontSize) * 0.85)}px`,
                  }}
                >
                  {styles.showInitialMessage ? styles.initialMessage : 'Ask a question to get started.'}
                </p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div 
            className="border-t flex-shrink-0"
            style={{
              padding: `${parseInt(styles.padding) * 0.75}px`,
              backgroundColor: styles.backgroundColor,
              borderTopColor: styles.borderColor,
            }}
          >
            <div className="flex gap-2 items-center">
              <input
                className="flex-1 px-2 py-1.5 border rounded-md outline-none text-xs"
                placeholder={styles.placeholderText}
                disabled
                style={{
                  backgroundColor: styles.inputBackgroundColor,
                  borderColor: styles.inputBorderColor,
                  color: styles.inputTextColor,
                  borderRadius: styles.borderRadius,
                  fontFamily: styles.fontFamily,
                  fontSize: `${Math.max(10, parseInt(styles.fontSize) * 0.8)}px`,
                  minHeight: '32px',
                }}
              />
              <button
                className="px-3 py-1.5 rounded-md font-medium transition-colors text-xs"
                disabled
                style={{
                  backgroundColor: styles.buttonBackgroundColor,
                  color: styles.buttonTextColor,
                  borderRadius: styles.borderRadius,
                  fontFamily: styles.fontFamily,
                  fontSize: `${Math.max(10, parseInt(styles.fontSize) * 0.8)}px`,
                  minHeight: '32px',
                  whiteSpace: 'nowrap',
                }}
              >
                {styles.sendButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
} 