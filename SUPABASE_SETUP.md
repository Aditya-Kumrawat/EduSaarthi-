# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project name: `edutrust-assignments`
5. Enter database password (save this securely)
6. Select region closest to you
7. Click "Create new project"

## 2. Get Project Credentials

After project creation, go to Settings > API:
- Copy your `Project URL`
- Copy your `anon/public` key

## 3. Update Configuration

Replace the placeholder values in `client/lib/supabase.ts`:

```typescript
const supabaseUrl = 'YOUR_PROJECT_URL_HERE'
const supabaseAnonKey = 'YOUR_ANON_KEY_HERE'
```

## 4. Create Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Click "New bucket"
3. Name: `assignment-files`
4. Make it **Public** (so files can be accessed via URLs)
5. Click "Create bucket"

## 5. Set Storage Policies (Optional but Recommended)

Go to Storage > Policies and create policies for the `assignment-files` bucket:

### Upload Policy:
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'assignment-files' 
  AND auth.role() = 'authenticated'
);
```

### Read Policy:
```sql
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (bucket_id = 'assignment-files');
```

## 6. Test Upload

After updating the configuration:
1. Start your development server: `npm run dev`
2. Login as a teacher
3. Click "New" in the Assignments section
4. Try uploading a PDF/PPT file
5. Create an assignment

## File Types Supported

- PDF (.pdf)
- PowerPoint (.ppt, .pptx)
- Word Documents (.doc, .docx)
- Maximum file size: 10MB

## Current Data Storage

Currently using in-memory storage for assignments. To persist data:

1. Create tables in Supabase Database
2. Update `client/lib/supabase.ts` to use database operations
3. Replace in-memory arrays with database queries

## Environment Variables (Recommended)

For production, use environment variables:

1. Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

2. Update `supabase.ts`:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
```
