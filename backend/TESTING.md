# Noteably Backend Test Guide

## Quick Start

### 1. Set Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
# Required for upload testing
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET=noteably-files
R2_ACCESS_KEY=your_access_key
R2_SECRET_KEY=your_secret_key
R2_PUBLIC_URL=https://files.your-domain.com

# Optional - defaults work for local dev
DEBUG=True
SECRET_KEY=your-secret-key
```

### 2. Run Server

```bash
source venv/bin/activate
python manage.py runserver
```

Server will start at `http://localhost:8000`

### 3. Test Endpoints

#### Health Check (No Auth)
```bash
curl http://localhost:8000/health/
```

#### Upload File (Requires Supabase Token)

Get a token from Supabase Dashboard:
1. Go to Authentication → Users
2. Click on a user → Copy JWT Token
3. Use it in the request:

```bash
export TEST_TOKEN="your_jwt_token"
python test_upload.py
```

Or manually with curl:
```bash
curl -X POST http://localhost:8000/api/process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.mp3" \
  -F 'material_types=["summary","notes"]'
```

## What Gets Tested

1. **Authentication** - JWT token validation
2. **File Validation** - Type and size checks
3. **Quota Checking** - Monthly limits (if Supabase connected)
4. **R2 Upload** - File storage upload
5. **Transcription** - AssemblyAI processing (Background Task)
6. **Job Creation** - Database record

## Expected Responses

### Success (201 Created)
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "estimated_time": 120
}
```

### Auth Error (401)
```json
{
  "error": "Invalid or expired token"
}
```

### Quota Exceeded (429)
```json
{
  "error": "Monthly limit: 5 uploads"
}
```

### Invalid File (400)
```json
{
  "error": "File type 'txt' not supported..."
}
```

## Troubleshooting

### "SUPABASE_URL must be set"
- Add Supabase credentials to `.env`
- Restart Django server

### "Authentication failed"
- Get fresh JWT from Supabase Dashboard
- Token expires after 1 hour

### "Connection refused"
- Server not running - run `python manage.py runserver`

### "R2 upload failed"
- Check R2 credentials in `.env`
- Verify bucket exists and has correct permissions

## Next Steps

## Next Steps

After generation works:
1. ✅ File stored in R2
2. ✅ Job record in database
3. ✅ Transcription triggered via Celery
4. ✅ Content generated (Summaries, Notes) using Gemini
5. ⏳ Frontend integration (next phase)
