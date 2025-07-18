'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [chatbotId, setChatbotId] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!file) {
      setHasError(true)
      setUploadResult('Please select a file to upload.')
      return
    }

    if (!chatbotId.trim()) {
      setHasError(true)
      setUploadResult('Please provide a chatbot ID.')
      return
    }

    setIsUploading(true)
    setHasError(false)
    setUploadResult(null)

    try {
      const form = new FormData()
      form.set('file', file)
      form.set('chatbotId', chatbotId.trim())

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form
      })

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      console.log('Upload successful:', data)
      setUploadResult('Document uploaded and processed successfully!')
      setFile(null)
      setChatbotId('')
      
      // Reset the file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      setHasError(true)
      setUploadResult(error instanceof Error ? error.message : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Upload Document
          </h1>
          <p className="text-muted-foreground">
            Upload a PDF document to add it to your knowledge base.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="chatbot-id" className="text-sm font-medium">
              Chatbot ID
            </label>
            <Input
              id="chatbot-id"
              type="text"
              placeholder="Enter chatbot ID (UUID)"
              value={chatbotId}
              onChange={e => setChatbotId(e.target.value)}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              You need to create a chatbot first and use its ID here.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="file-input" className="text-sm font-medium">
              Select PDF File
            </label>
            <Input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              disabled={isUploading}
              className="cursor-pointer"
            />
          </div>

          <Button 
            type="submit" 
            disabled={!file || !chatbotId.trim() || isUploading}
            className="w-full"
          >
            {isUploading ? 'Processing...' : 'Upload Document'}
          </Button>
        </form>

        {uploadResult && (
          <div className={`p-4 rounded-lg border ${
            hasError 
              ? 'bg-destructive/10 border-destructive text-destructive' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <p className="text-sm">
              {uploadResult}
            </p>
          </div>
        )}

        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
} 