# Ingestion App - Implementation Guide

## 🎯 Your Mission

Implement the file upload system step-by-step. I've created all the structure - now you fill in the logic!

---

## 📁 Files You'll Edit

1. **`r2_storage.py`** - Upload to Cloudflare R2 (START HERE)
2. **`validators.py`** - Validate file type, size, duration
3. **`quota.py`** - Check user subscription limits
4. **`views.py`** - Main upload endpoint (FINISH HERE)

---

## 🚀 Step 1: R2 Storage (Easiest)

**File:** `apps/ingestion/r2_storage.py`

**What to implement:**

```python
def upload_to_r2(file, filename, content_type=None):
    # 1. Generate unique key
    key = f"{uuid.uuid4()}/{filename}"
    
    # 2. Initialize boto3 client
    import boto3
    s3 = boto3.client(
        's3',
        endpoint_url=settings.R2_ENDPOINT,
        aws_access_key_id=settings.R2_ACCESS_KEY,
        aws_secret_access_key=settings.R2_SECRET_KEY
    )
    
    # 3. Upload
    s3.upload_fileobj(
        file,
        settings.R2_BUCKET,
        key,
        ExtraArgs={'ContentType': content_type or 'application/octet-stream'}
    )
    
    # 4. Return URL
    return f"{settings.R2_PUBLIC_URL}/{key}"
```

**Test it:**

```python
# In Django shell: python manage.py shell
from apps.ingestion.r2_storage import upload_to_r2
from django.core.files.uploadedfile import SimpleUploadedFile

file = SimpleUploadedFile("test.txt", b"Hello R2!")
url = upload_to_r2(file, "test.txt", "text/plain")
print(f"Uploaded to: {url}")
```

---

## 📝 Step 2: File Validators

**File:** `apps/ingestion/validators.py`

**Implement 3 functions:**

### 2a. `validate_file_type`

```python
def validate_file_type(file):
    ext = file.name.split('.')[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise InvalidFileError(
            f"File type '{ext}' not supported. "
            f"Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    return True
```

### 2b. `validate_file_size`

```python
def validate_file_size(file, max_size_mb):
    size_mb = file.size / (1024 * 1024)
    if size_mb > max_size_mb:
        raise InvalidFileError(
            f"File too large ({size_mb:.1f}MB). "
            f"Maximum: {max_size_mb}MB"
        )
    return True
```

### 2c. `get_file_duration` (Simple version)

```python
def get_file_duration(file):
    # Quick estimate: 1 MB ≈ 1 minute of audio
    size_mb = file.size / (1024 * 1024)
    return size_mb  # We'll improve this later
```

---

## 🔒 Step 3: Quota Checker

**File:** `apps/ingestion/quota.py`

**Implement:**

```python
def check_user_quota(user_id, file_duration_minutes, file_size_mb):
    # Query subscription
    result = supabase_client.query(
        'user_subscriptions',
        eq={'user_id': user_id}
    )
    
    if not result:
        # No subscription = free tier defaults
        subscription = {
            'monthly_upload_limit': 5,
            'monthly_minutes_limit': 30,
            'max_file_size_mb': 100,
            'uploads_this_month': 0,
            'minutes_used_this_month': 0
        }
    else:
        subscription = result[0]
    
    # Check limits
    if subscription['uploads_this_month'] >= subscription['monthly_upload_limit']:
        raise QuotaExceededError(
            f"Monthly limit: {subscription['monthly_upload_limit']} uploads"
        )
    
    new_total = subscription['minutes_used_this_month'] + file_duration_minutes
    if new_total > subscription['monthly_minutes_limit']:
        raise QuotaExceededError(
            f"Monthly limit: {subscription['monthly_minutes_limit']} minutes"
        )
    
    if file_size_mb > subscription['max_file_size_mb']:
        raise QuotaExceededError(
            f"File too large. Max: {subscription['max_file_size_mb']}MB"
        )
```

---

## 🎬 Step 4: Main Upload View

**File:** `apps/ingestion/views.py`

**Uncomment the imports at top, then implement:**

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_upload(request):
    # 1. Validate request
    serializer = ProcessUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)
    
    file = serializer.validated_data['file']
    material_types = serializer.validated_data['material_types']
    
    # 2. Validate file
    validate_file_type(file)
    validate_file_size(file, 100)  # TODO: get from subscription
    
    # 3. Get duration
    duration = get_file_duration(file)
    
    # 4. Check quota
    check_user_quota(
        request.user_id,
        duration,
        file.size / (1024 * 1024)
    )
    
    # 5. Upload to R2
    storage_url = upload_to_r2(file, file.name, file.content_type)
    
    # 6. Create job
    job = Job.objects.create(
        user_id=request.user_id,
        filename=file.name,
        file_size_bytes=file.size,
        file_type=file.content_type,
        storage_url=storage_url,
        material_types=material_types,
        status='queued'
    )
    
    # 7. TODO: Trigger Celery task
    # process_job.delay(str(job.id))
    
    # 8. Return response
    return Response({
        'job_id': str(job.id),
        'status': job.status,
        'estimated_time': job.estimate_processing_time()
    }, status=201)
```

---

## 🧪 Testing Your Work

### 1. Run migrations first:

```bash
cd backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
```

### 2. Start server:

```bash
python manage.py runserver
```

### 3. Test with curl:

```bash
curl -X POST http://localhost:8000/api/process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.mp3" \
  -F "material_types=[\"summary\",\"notes\"]"
```

---

## 🤝 When to Ask for Help

- **R2 upload errors** - I'll help debug boto3
- **Supabase queries** - I'll show you query examples
- **Testing** - I'll help write tests
- **Any bugs** - Just ask!

---

## ✅ Success Checklist

- [ ] R2 upload works (test in shell)
- [ ] File validation rejects bad files
- [ ] Quota check queries Supabase
- [ ] Full upload creates Job record
- [ ] API returns job_id

---

**Start with Step 1 (R2 storage) and let me know when you're ready for the next step or if you hit any issues!** 💪