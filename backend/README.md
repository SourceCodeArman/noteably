# Noteably Backend

Django-based backend for the Noteably AI study material generator.

## Project Structure

```
backend/
├── apps/
│   ├── core/               # Shared utilities, error handling, Supabase client
│   ├── accounts/           # Supabase authentication and permissions
│   ├── ingestion/          # File upload and storage (Cloudflare R2)
│   ├── transcription/      # AssemblyAI transcription with streaming
│   ├── generation/         # Google Gemini content generation
│   ├── storage/            # File management utilities
│   ├── tasks/              # Celery background tasks
│   └── analytics/          # Usage tracking and metrics
├── config/                 # Django project settings
├── requirements.txt        # Python dependencies
└── manage.py              # Django management script
```

## Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `R2_ENDPOINT` - Cloudflare R2 endpoint
- `R2_ACCESS_KEY` - Cloudflare R2 access key
- `R2_SECRET_KEY` - Cloudflare R2 secret key
- `ASSEMBLYAI_API_KEY` - AssemblyAI API key
- `GEMINI_API_KEY` - Google Gemini API key

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Run Development Server

```bash
python manage.py runserver
```

Server will start at `http://localhost:8000`

## Core Features

### Error Handling & Resilience

- **Custom Exceptions**: Hierarchical exception classes with retry flags
- **Exponential Backoff**: Automatic retry with exponential backoff for transient failures
- **Error Classification**: Intelligent error handling based on error type
- **Retry Decorator**: `@retry_with_backoff` for easy retry logic

Example:
```python
from apps.core.error_handler import retry_with_backoff

@retry_with_backoff(max_attempts=3)
def upload_to_r2(file):
    # Automatically retries on failure
    pass
```

### Authentication

- **Supabase JWT**: Token-based authentication via Supabase Auth
- **Middleware**: Automatic token validation on all API requests
- **Permissions**: `IsAuthenticated`, `IsPaidUser`, `IsOwner` permission classes

Example:
```python
from rest_framework.decorators import api_view, permission_classes
from apps.accounts.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def my_view(request):
    user_id = request.user_id  # Available from middleware
    # ...
```

### Database Access

- **Supabase Client**: Singleton client with retry logic
- **Row Level Security**: All queries respect RLS policies
- **Type-Safe**: Strong typing for database operations

Example:
```python
from apps.core.supabase_client import supabase_client

# Query with automatic retry
jobs = supabase_client.query('jobs', eq={'user_id': user_id}, limit=20)

# Insert record
job = supabase_client.insert('jobs', {
    'user_id': user_id,
    'filename': 'lecture.mp3',
    'material_types': ['summary', 'notes']
})
```

## API Documentation

See [docs/PRD.md](../docs/PRD.md) for complete API specification.

### Key Endpoints

- `POST /api/process` - Upload file and start processing
- `WS /api/stream/{job_id}` - WebSocket for realtime updates
- `GET /api/content` - List user's generated content
- `POST /api/export` - Export materials to PDF/Markdown/JSON

## Development

### Running Tests

```bash
python manage.py test
```

### Code Quality

```bash
# Format code
black apps/

# Lint
flake8 apps/

# Type checking
mypy apps/
```

### Creating New Apps

```bash
python manage.py startapp my_app apps/my_app
```

## Deployment

### Environment

- Set `DEBUG=False`
- Configure `ALLOWED_HOSTS`
- Use strong `SECRET_KEY`
- Set up PostgreSQL database
- Configure Redis for Celery

### Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### Run with Gunicorn

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

## Architecture Principles

1. **Error Resilience**: All external API calls use retry logic
2. **Single Responsibility**: Each app has one clear purpose
3. **Type Safety**: Use type hints throughout
4. **Logging**: Structured logging with context
5. **Security**: JWT auth, RLS, input validation

## Contributing

See `.cursor/rules/` for code style and conventions.

## License

Proprietary - All rights reserved
