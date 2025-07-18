'use client'

import { useState } from 'react'

export default function TestEmbed() {
  const [apiKey, setApiKey] = useState('')

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Embed Test Page</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Enter your chatbot API key:
        </label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter API key..."
          className="w-full p-2 border rounded"
        />
      </div>

      {apiKey && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Embed Code:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<div data-chatbot-id="${apiKey}"></div>
<script src="${window.location.origin}/embed.js"></script>`}
          </pre>

          <h2 className="text-lg font-semibold">Live Test:</h2>
          <div className="bg-gray-50 p-8 rounded min-h-[400px] relative">
            <p className="text-gray-600 mb-4">This simulates your website with the embed:</p>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            
            {/* Embed will be injected here */}
            <div data-chatbot-id={apiKey}></div>
          </div>

          <h2 className="text-lg font-semibold">Debug Info:</h2>
          <div className="bg-blue-50 p-4 rounded">
            <p><strong>API Key:</strong> {apiKey}</p>
            <p><strong>Embed URL:</strong> {window.location.origin}/embed/{apiKey}</p>
            <p><strong>Styles API:</strong> {window.location.origin}/api/public/styles</p>
            <p className="text-sm text-gray-600 mt-2">
              Check browser console for embed.js logs and network requests.
            </p>
            
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> If you see only default styles (primaryColor: '#0f172a'), 
                you need to:
              </p>
              <ol className="text-sm text-yellow-700 mt-1 ml-4 list-decimal">
                <li>Go to your Chatbots dashboard</li>
                <li>Click "Edit" on your chatbot</li>
                <li>Scroll to "Customize Appearance"</li>
                <li>Change some colors/settings</li>
                <li>Click "Save Styles"</li>
                <li>Then test the embed again</li>
              </ol>
            </div>
            
            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  // Test the styles API directly
                  fetch('/api/public/styles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey })
                  })
                  .then(r => r.json())
                  .then(data => {
                    console.log('Direct styles API test:', data)
                    const isDefault = data.styles && data.styles.primaryColor === '#0f172a' && data.styles.backgroundColor === '#ffffff'
                    alert(`Styles API response:\n${JSON.stringify(data, null, 2)}\n\n${isDefault ? '⚠️ These are DEFAULT styles! You need to save custom styles first.' : '✅ Custom styles found!'}`)
                  })
                  .catch(err => {
                    console.error('Styles API error:', err)
                    alert('Styles API error: ' + err.message)
                  })
                }}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Test Styles API
              </button>
              
              <button
                onClick={() => {
                  // Open embed directly in new tab
                  window.open(`/embed/${apiKey}`, '_blank')
                }}
                className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 ml-2"
              >
                Open Embed Directly
              </button>


            </div>
          </div>
        </div>
      )}
      
      {apiKey && (
        <div className="mt-4">
          <button
            onClick={() => {
              // Dynamically load the embed script
              const script = document.createElement('script')
              script.src = '/embed.js'
              script.onload = () => console.log('Embed script loaded')
              document.head.appendChild(script)
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Load Embed Script
          </button>
        </div>
      )}
    </div>
  )
} 