'use client'

import { FormEvent, useState } from 'react'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      return
    }

    const form = new FormData();
    form.set('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form
    })
    const data = await res.json()
    console.log(data)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={e => setFile(e.target.files![0])} />
        <button type="submit">Upload</button>
      </form>
    </main>
  )
} 