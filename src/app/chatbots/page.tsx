import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { deleteChatbot } from './actions'
import { EmbedCode } from './embed-code' // <-- Import new component

export default async function ChatbotsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let chatbots: any[] = []
  if (user) {
    const { data, error } = await supabase
      .from('chatbots')
      .select('id, name, created_at, public_api_key') // <-- Fetch the new key
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching chatbots:', error)
    } else {
      chatbots = data
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Chatbots</h1>
          <Button asChild>
            <Link href="/chatbots/create?step=1">Create New Chatbot</Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {user ? (
          chatbots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatbots.map((chatbot) => (
                <div
                  key={chatbot.id}
                  className="bg-card p-6 rounded-lg shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {chatbot.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Created on:{' '}
                      {new Date(chatbot.created_at).toLocaleDateString()}
                    </p>
                    {/* -- Embed Code Snippet -- */}
                    <EmbedCode apiKey={chatbot.public_api_key} />
                  </div>
                  <div className="mt-6 flex justify-end items-center gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/chat/${chatbot.id}`}>Chat</Link>
                    </Button>
                    <Button asChild variant="ghost">
                      <Link href={`/chatbots/edit/${chatbot.id}`}>Edit</Link>
                    </Button>
                    <form action={deleteChatbot}>
                      <input
                        type="hidden"
                        name="chatbotId"
                        value={chatbot.id}
                      />
                      <Button type="submit" variant="destructive">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                You haven&apos;t created any chatbots yet.
              </p>
              <Button asChild>
                <Link href="/chatbots/create?step=1">
                  Create Your First Chatbot
                </Link>
              </Button>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Please log in to manage your chatbots.
            </p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}