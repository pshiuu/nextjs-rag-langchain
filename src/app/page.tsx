
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const runtime = 'edge';

export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            RAG Application
          </h1>
          <p className="text-xl text-muted-foreground">
            Build with LangChain & Next.js
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload documents, create embeddings, and chat with your data using advanced 
            retrieval-augmented generation powered by OpenAI and Supabase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">Upload Documents</h3>
            <p className="text-sm text-muted-foreground">
              Upload PDF documents to create vector embeddings for your knowledge base.
            </p>
            <Button asChild className="w-full">
              <Link href="/upload">
                Upload Files
              </Link>
            </Button>
          </div>

          <div className="p-6 border rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">Chat Interface</h3>
            <p className="text-sm text-muted-foreground">
              Interactive chat with your documents using advanced AI models.
            </p>
            <Button asChild className="w-full">
              <Link href="/chat">
                Start Chatting
              </Link>
            </Button>
          </div>

          <div className="p-6 border rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">Manage Chatbots</h3>
            <p className="text-sm text-muted-foreground">
              Create and configure custom chatbots for different use cases.
            </p>
            <Button asChild className="w-full">
              <Link href="/chatbots">
                Manage Bots
              </Link>
            </Button>
          </div>
        </div>

        {!user && (
          <div className="mt-12 p-6 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-4">
              Sign in to access all features and manage your documents.
            </p>
            <Button asChild>
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        )}

        {user && (
          <div className="mt-12 p-6 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-4">
              Welcome back, {user.email}! Ready to explore your knowledge base?
            </p>
          </div>
        )}
      </div>
    </main>
  )
}