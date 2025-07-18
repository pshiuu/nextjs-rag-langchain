import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { EditForm } from './edit-form'

interface EditChatbotPageProps {
  params: {
    chatbotId: string
  }
}

export default async function EditChatbotPage({
  params,
}: EditChatbotPageProps) {
  const { chatbotId } = params
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: chatbot } = await supabase
    .from('chatbots')
    .select()
    .eq('id', chatbotId)
    .single()

  if (!chatbot) {
    notFound()
  }

  const { data: documents } = await supabase
    .from('documents')
    .select('id, content')
    .eq('chatbot_id', chatbotId)
    .order('created_at', { ascending: false })

  return <EditForm chatbot={chatbot} documents={documents || []} />
}