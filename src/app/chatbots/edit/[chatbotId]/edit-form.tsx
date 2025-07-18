'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  updateChatbotSettings,
  addKnowledge,
  deleteKnowledge,
  addKnowledgeFromURL,
} from './actions'

function SubmitButton({
  children,
  ...props
}: {
  children: React.ReactNode
} & React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? 'Saving...' : children}
    </Button>
  )
}

function CrawlButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Crawling...' : 'Crawl & Add Knowledge'}
    </Button>
  )
}

function DeleteButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="destructive" size="sm" disabled={pending}>
      {pending ? '...' : 'Delete'}
    </Button>
  )
}

export function EditForm({
  chatbot,
  documents,
}: {
  chatbot: any
  documents: any[]
}) {
  const [settingsState, settingsAction] = useFormState(
    updateChatbotSettings,
    null,
  )
  const [knowledgeState, knowledgeAction] = useFormState(addKnowledge, null)
  const [urlState, urlAction] = useFormState(addKnowledgeFromURL, null)

  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const addKnowledgeFormRef = useRef<HTMLFormElement>(null)
  const addUrlFormRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const states = [settingsState, knowledgeState, urlState]
    let successMessage = null
    let errorMsg = null

    for (const state of states) {
      if (state?.message) successMessage = state.message
      if (state?.error) errorMsg = state.error
    }

    if (successMessage) {
      setMessage(successMessage)
      setErrorMessage(null)
      if (knowledgeState?.success) addKnowledgeFormRef.current?.reset()
      if (urlState?.success) addUrlFormRef.current?.reset()
    }

    if (errorMsg) {
      setErrorMessage(errorMsg)
      setMessage(null)
    }

    if (successMessage || errorMsg) {
      const timer = setTimeout(() => {
        setMessage(null)
        setErrorMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [settingsState, knowledgeState, urlState])

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {message && (
        <div className="fixed top-4 right-4 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg animate-pulse z-50">
          {message}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg z-50">
          {errorMessage}
        </div>
      )}
      <header className="bg-background border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Edit: {chatbot.name}</h1>
          <Button asChild variant="outline">
            <Link href="/chatbots">Back to My Chatbots</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        {/* -- Settings Form -- */}
        <section className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Chatbot Settings</h2>
          <form action={settingsAction} className="space-y-4">
            <input type="hidden" name="chatbotId" value={chatbot.id} />
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <Input
                id="name"
                name="name"
                defaultValue={chatbot.name}
                required
              />
            </div>
            <div>
              <label
                htmlFor="instruction"
                className="block text-sm font-medium mb-1"
              >
                Custom Instructions
              </label>
              <textarea
                id="instruction"
                name="instruction"
                rows={5}
                defaultValue={chatbot.prompt}
                className="w-full p-2 border rounded-md bg-background"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="model"
                  className="block text-sm font-medium mb-1"
                >
                  Model
                </label>
                <select
                  id="model"
                  name="model"
                  defaultValue={chatbot.model}
                  className="w-full p-2 border rounded-md bg-background h-[40px]"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="temperature"
                  className="block text-sm font-medium mb-1"
                >
                  Temperature:
                </label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue={chatbot.temperature}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <SubmitButton>Save Settings</SubmitButton>
            </div>
          </form>
        </section>

        {/* -- Knowledge Base Section -- */}
        <section className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Add Knowledge from Text */}
            <form
              ref={addKnowledgeFormRef}
              action={knowledgeAction}
              className="space-y-2"
            >
              <input type="hidden" name="chatbotId" value={chatbot.id} />
              <label htmlFor="text" className="block text-sm font-medium">
                Add new knowledge from text:
              </label>
              <textarea
                id="text"
                name="text"
                rows={6}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="Paste your text content here..."
              />
              <div className="flex justify-end">
                <SubmitButton>Add Knowledge</SubmitButton>
              </div>
            </form>

            {/* Add Knowledge from URL */}
            <form
              ref={addUrlFormRef}
              action={urlAction}
              className="space-y-2"
            >
              <input type="hidden" name="chatbotId" value={chatbot.id} />
              <label htmlFor="url" className="block text-sm font-medium">
                Add new knowledge from a website URL:
              </label>
              <Input
                id="url"
                name="url"
                type="url"
                className="w-full p-2 border rounded-md bg-background"
                placeholder="https://example.com"
                required
              />
              <div className="flex justify-end">
                <CrawlButton />
              </div>
            </form>
          </div>

          {/* Existing Documents */}
          <div>
            <h3 className="text-lg font-medium mb-2">
              Existing Knowledge ({documents?.length || 0} chunks)
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-muted/50 p-3 rounded-md flex justify-between items-center"
                  >
                    <p className="text-sm text-muted-foreground truncate">
                      {doc.content}
                    </p>
                    <form action={deleteKnowledge}>
                      <input type="hidden" name="documentId" value={doc.id} />
                      <input
                        type="hidden"
                        name="chatbotId"
                        value={chatbot.id}
                      />
                      <DeleteButton />
                    </form>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No knowledge base documents found.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}