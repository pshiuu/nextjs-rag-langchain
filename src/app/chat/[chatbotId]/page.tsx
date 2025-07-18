import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Chat } from './chat'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'

export default async function ChatPage({ params }: { params: { chatbotId: string } }) {
  const { chatbotId } = params
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Please log in to chat.</p>
        <Button asChild className="mt-4"><Link href="/login">Log In</Link></Button>
      </div>
    )
  }

  const { data: chatbot, error } = await supabase
    .from('chatbots')
    .select('name')
    .eq('id', chatbotId)
    .single()

  if (error || !chatbot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Chatbot not found or you do not have permission to access it.</p>
        <Button asChild className="mt-4"><Link href="/chatbots">Go to Dashboard</Link></Button>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Chat chatbotId={chatbotId} chatbotName={chatbot.name} />
    </Suspense>
  )
}