# Environment Setup for RAG Application

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to Get Your API Keys

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

### Supabase Configuration

1. Go to [Supabase](https://supabase.com/)
2. Create a new project or use an existing one
3. Go to Project Settings → API
4. Copy your Project URL and Anon Key
5. Add both to your `.env.local` file

## Database Setup

1. In your Supabase dashboard, go to the SQL editor
2. Run the database schema from your existing tables
3. Make sure the `vector` extension is enabled
4. Verify that Row Level Security (RLS) is properly configured

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Vector extension enabled in Supabase
- [ ] OpenAI API key has sufficient credits
- [ ] Test upload functionality
- [ ] Test embedding search
- [ ] Test public API endpoints

## Testing the Application

1. **Upload Test**: Try uploading a PDF document
2. **Embedding Test**: Verify documents are properly embedded
3. **Chat Test**: Test the chat functionality with uploaded documents
4. **Public API Test**: Test the embed functionality with API keys

## Common Issues

### Upload Fails

- Check OpenAI API key is valid and has credits
- Verify Supabase connection is working
- Check file size limits

### Chat Not Working

- Verify documents are uploaded and embedded
- Check chatbot configuration in database
- Ensure match_documents function is working

### Embedding Not Working

- Check if pgvector extension is enabled
- Verify embedding dimensions match (1536 for OpenAI)
- Check vector store configuration
