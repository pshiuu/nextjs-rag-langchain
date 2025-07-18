'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  createChatbot,
  addKnowledge,
  addKnowledgeFromURL,
} from './actions'

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : children}
    </Button>
  )
}

function CrawlButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Crawling...' : 'Crawl & Add'}
    </Button>
  )
}

export default function CreateChatbotPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = searchParams.get('step') ? Number(searchParams.get('step')) : 1
  const chatbotId = searchParams.get('chatbotId')

  const [createState, createAction] = useFormState(createChatbot, null)
  const [knowledgeState, knowledgeAction] = useFormState(addKnowledge, null)
  const [urlState, urlAction] = useFormState(addKnowledgeFromURL, null)

  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const addKnowledgeFormRef = useRef<HTMLFormElement>(null)
  const addUrlFormRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (createState?.success && createState.chatbotId) {
      router.push(
        `/chatbots/create?step=2&chatbotId=${createState.chatbotId}`,
      )
    }

    const states = [knowledgeState, urlState]
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
  }, [createState, knowledgeState, urlState, router])

  const ProgressBar = () => (
    <div className="w-full bg-muted rounded-full h-2.5 mb-8">
      <div
        className="bg-primary h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${(step / 3) * 100}%` }}
      ></div>
    </div>
  )

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20">
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
      <div className="w-full max-w-xl bg-card p-8 rounded-lg shadow-sm">
        <ProgressBar />

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-1">Create a Chatbot</h1>
            <p className="text-muted-foreground mb-6">
              Step 1: Define the basics.
            </p>
            <form action={createAction} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., 'Customer Support Bot'"
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
                  defaultValue="Answer the user's questions based only on the following context. If the answer is not in the context, reply politely that you do not have that information available."
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
                    defaultValue="gpt-3.5-turbo"
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
                    defaultValue="0.5"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <SubmitButton>Next: Add Knowledge</SubmitButton>
              </div>
            </form>
          </div>
        )}

        {step === 2 && chatbotId && (
          <div>
            <h1 className="text-2xl font-bold mb-1">Add Knowledge</h1>
            <p className="text-muted-foreground mb-6">
              Step 2: Train your chatbot with data.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Add Knowledge from Text */}
              <form
                ref={addKnowledgeFormRef}
                action={knowledgeAction}
                className="space-y-2"
              >
                <input type="hidden" name="chatbotId" value={chatbotId} />
                <label htmlFor="text" className="block text-sm font-medium">
                  Add from text:
                </label>
                <textarea
                  id="text"
                  name="text"
                  rows={6}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="Paste text here..."
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
                <input type="hidden" name="chatbotId" value={chatbotId} />
                <label htmlFor="url" className="block text-sm font-medium">
                  Add from a website URL:
                </label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="https://example.com"
                />
                <div className="flex justify-end">
                  <CrawlButton />
                </div>
              </form>
            </div>

            <div className="flex justify-between items-center mt-8">
                <Button variant="outline" asChild>
                    <Link href={`/chatbots/create?step=1`}>Back</Link>
                </Button>
                <Button asChild>
                    <Link href={`/chatbots/create?step=3&chatbotId=${chatbotId}`}>
                    Next: Finish
                    </Link>
                </Button>
            </div>
          </div>
        )}

        {step === 3 && chatbotId && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Chatbot Ready!</h1>
            <p className="text-muted-foreground mb-6">
              Your chatbot has been created and trained.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href={`/chat/${chatbotId}`}>Start Chatting</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/chatbots">View All Chatbots</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}