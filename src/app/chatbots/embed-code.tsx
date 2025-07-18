'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function EmbedCode({ apiKey }: { apiKey: string }) {
  const [copied, setCopied] = useState(false)

  const embedCode = `<div data-chatbot-id="${apiKey}"></div>\n<script src="${window.location.origin}/embed.js"></script>`

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-4 bg-muted/50 p-4 rounded-lg">
      <p className="text-sm font-semibold mb-2">Embed on your website</p>
      <pre className="text-xs bg-background p-3 rounded-md overflow-x-auto">
        <code>{embedCode}</code>
      </pre>
      <div className="flex justify-end mt-2">
        <Button onClick={handleCopy} size="sm">
          {copied ? 'Copied!' : 'Copy Code'}
        </Button>
      </div>
    </div>
  )
}