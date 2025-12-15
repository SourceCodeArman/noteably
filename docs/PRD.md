# Noteably - Product Requirements Document
**RPG Method (Repository Planning Graph)**

---

## Overview

### Problem Statement

Students, professionals, and lifelong learners struggle to efficiently convert educational content from diverse sources (YouTube videos, lectures, documents) into structured study materials. The current workflow is fragmented and time-consuming: users must manually transcribe audio/video, extract key information, create summaries, generate flashcards, and build quizzes.

**Existing solutions fail because:**
- **Manual transcription tools** (Otter.ai, Rev) only provide raw text, requiring additional manual work
- **Note-taking apps** (Notion, Obsidian) lack AI-powered content generation from multimedia sources
- **Flashcard apps** (Anki, Quizlet) require manual card creation
- **No unified platform** handles the full pipeline from source ingestion to structured output

**Core pain point:** There is no "upload and study" solution that automatically transforms any input format (video, audio, document) into ready-to-use study materials. Additionally, users need an intelligent way to interact with their materials, ask questions about uploaded content, and seamlessly retrieve files from cloud storage like Google Drive for processing.

### Target Users

#### Primary Persona: College Student (Sarah)
- **Workflow**: Attends lectures, watches YouTube tutorials, reads PDFs for multiple courses
- **Pain**: Spends 3-4 hours per day creating study materials from recorded lectures and videos
- **Goal**: Reduce study prep time by 70% while maintaining quality
- **Tech comfort**: High - uses multiple apps daily

#### Secondary Persona: Professional Learner (Marcus)
- **Workflow**: Consumes online courses, webinars, technical documentation for career development
- **Pain**: Struggles to retain information from long-form content without structured review materials
- **Goal**: Create spaced repetition study materials from professional development content
- **Tech comfort**: Medium-High - prefers simple, efficient tools

#### Tertiary Persona: Educator (Dr. Chen)
- **Workflow**: Creates study materials for students from lecture recordings and course materials
- **Pain**: Time-consuming to generate diverse study materials for different learning styles
- **Goal**: Rapidly generate multiple study formats from single source material
- **Tech comfort**: Medium - needs reliable, straightforward tools

### Success Metrics

**User Engagement:**
- 80% of users complete at least one full pipeline within first session
- Average 5+ content items processed per user per month
- 70% of users return within 7 days

**Quality Metrics:**
- < 5% transcription error rate
- 85% user satisfaction rating for generated content quality
- < 10% content regeneration rate

**Performance Metrics:**
- < 30 seconds processing time for files under 5 minutes
- < 2 minutes processing time for files under 30 minutes
- 99% uptime for transcription and generation services

**Business Metrics:**
- Average cost per user per month: < $2.50 (AI provider costs)
- Feature usage distribution: 40% summaries, 30% notes, 20% flashcards, 10% quizzes

---

## Upload-to-Material Generation Flow

This section describes the complete user journey from uploading a file to receiving generated study materials. The entire process happens on a **single page** with real-time updates.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Upload & Material Selection                       │
├─────────────────────────────────────────────────────────────────┤
│ Frontend: User uploads file + selects materials wanted         │
│           (checkboxes: □ Summary □ Notes □ Flashcards □ Quiz) │
│ Action:   POST /api/process with file + material_types[]       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: File Storage (Cloudflare R2)                           │
├─────────────────────────────────────────────────────────────────┤
│ Backend:  Validates file (type, size)                          │
│           Uploads to Cloudflare R2                              │
│           Creates database record (Supabase)                    │
│           Returns job_id to frontend                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: WebSocket Connection                                    │
├─────────────────────────────────────────────────────────────────┤
│ Frontend: Establishes WS connection: ws://api/stream/{job_id}  │
│ Backend:  Accepts connection, prepares to stream updates        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Transcription (AssemblyAI)                             │
├─────────────────────────────────────────────────────────────────┤
│ Backend:  Sends file to AssemblyAI for transcription           │
│           Receives streaming transcription responses            │
│           Emits partial transcripts via WebSocket               │
│ Frontend: Displays streaming transcript in real-time           │
│           Shows: "Transcribing... 45% complete"                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Content Generation (Gemini)                            │
├─────────────────────────────────────────────────────────────────┤
│ Backend:  Receives complete transcript from AssemblyAI         │
│           For each requested material type:                     │
│             - Constructs tailored prompt for Gemini             │
│             - Sends transcript + prompt to Gemini API           │
│             - Receives generated content                        │
│             - Parses and structures the response                │
│           Emits generation progress via WebSocket               │
│ Frontend: Shows: "Generating summary... notes... flashcards..." │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Save to Database (Supabase)                            │
├─────────────────────────────────────────────────────────────────┤
│ Backend:  Saves transcript to transcriptions table              │
│           Saves each material to generated_content table        │
│           Links all records to original source                  │
│           Updates job status to "completed"                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Display Results                                         │
├─────────────────────────────────────────────────────────────────┤
│ Backend:  Sends complete data via WebSocket:                   │
│           { transcript, summary, notes, flashcards, quiz }      │
│ Frontend: Displays all materials on same page:                 │
│           - Transcript in expandable section                    │
│           - Tabs for each generated material type               │
│           - Export buttons for each content type                │
│           User can now: view, export, regenerate                │
└─────────────────────────────────────────────────────────────────┘
```

### Key User Experience Points

1. **Single Page Experience**: User never leaves the upload page
2. **Real-time Feedback**: Streaming transcription updates every few seconds
3. **Material Selection Upfront**: User selects what they want before processing
4. **Progressive Display**: Transcript appears first, then materials as they're generated
5. **Immediate Access**: All results available immediately after generation
6. **No Page Refreshes**: Entire flow uses WebSocket for live updates

### Backend Processing Flow

```python
# Pseudo-code for backend processing
async def process_upload(file, material_types, user_id):
    # Step 2: Save to R2
    storage_url = await cloudflare_r2.upload(file)
    job = await supabase.create_job(user_id, storage_url, material_types)
    
    # Step 4: Transcribe with streaming
    async for partial_transcript in assemblyai.transcribe_streaming(storage_url):
        await websocket.send(job.id, {
            'type': 'transcript_partial',
            'text': partial_transcript,
            'progress': calculate_progress()
        })
    
    full_transcript = await assemblyai.get_final_transcript()
    await supabase.save_transcript(job.id, full_transcript)
    
    # Step 5: Generate materials
    results = {}
    for material_type in material_types:
        prompt = build_prompt(material_type, full_transcript)
        content = await gemini.generate(prompt)
        parsed = parse_content(content, material_type)
        
        # Step 6: Save to DB
        await supabase.save_content(job.id, material_type, parsed)
        results[material_type] = parsed
        
        # Stream progress
        await websocket.send(job.id, {
            'type': 'material_generated',
            'material_type': material_type,
            'content': parsed
        })
    
    # Step 7: Send final completion
    await websocket.send(job.id, {
        'type': 'complete',
        'transcript': full_transcript,
        'results': results
    })
```

### Frontend State Management

```javascript
// Pseudo-code for frontend state
const [uploadState, setUploadState] = useState({
  status: 'idle', // idle | uploading | transcribing | generating | complete
  transcript: '',
  transcriptProgress: 0,
  materials: {
    summary: null,
    notes: null,
    flashcards: null,
    quiz: null
  }
});

// WebSocket listener
ws.on('message', (data) => {
  switch(data.type) {
    case 'transcript_partial':
      setUploadState(prev => ({
        ...prev,
        status: 'transcribing',
        transcript: data.text,
        transcriptProgress: data.progress
      }));
      break;
    
    case 'material_generated':
      setUploadState(prev => ({
        ...prev,
        status: 'generating',
        materials: {
          ...prev.materials,
          [data.material_type]: data.content
        }
      }));
      break;
    
    case 'complete':
      setUploadState({
        status: 'complete',
        transcript: data.transcript,
        materials: data.results
      });
      break;
  }
});
```

### Error Handling

**Transcription Failures:**
- Backend retries up to 3 times with exponential backoff
- If all retries fail, shows clear error message via WebSocket
- User can retry upload or contact support

**Generation Failures:**
- Individual material failures don't block others
- Backend generates remaining materials successfully
- Shows partial results + error message for failed materials
- User can retry specific material generation

**Network Disconnections:**
- Frontend detects WebSocket disconnection
- Automatically reconnects and requests current status
- Backend maintains job state in database
- User sees "Reconnecting..." then continues from current step

---

## Functional Decomposition

### Capability: Source Ingestion
Handles accepting and validating content, plus user selection of desired output materials.

#### Feature: File Upload  Handling with Material Selection
- **Description**: Accept and validate uploaded files with user's material type selection
- **Inputs**: Multipart file upload, file metadata (name, size, type), material_types array (summary, notes, flashcards, quiz)
- **Outputs**: File storage reference, validation result, extracted metadata, material selection record
- **Behavior**: Validate file type against whitelist (audio: mp3, wav, m4a, video: mp4, webm, mov), check size limits (500MB max), extract MIME type, store material selection preferences, upload to Cloudflare R2, create job record in Supabase

#### Feature: YouTube URL Processing (Future)
- **Description**: Extract video metadata and download audio/video content from YouTube URLs
- **Inputs**: YouTube URL string, user authentication token, material_types array
- **Outputs**: Video metadata (title, duration, description, thumbnail), downloaded media file reference
- **Behavior**: Validate URL format, use YouTube Data API for metadata, download via yt-dlp, store in Cloudflare R2

#### Feature: Text Input Processing (Future)
- **Description**: Accept plain text paste input and normalize formatting
- **Inputs**: Raw text string, optional metadata (title, source), material_types array
- **Outputs**: Normalized text content, character count, detected language
- **Behavior**: Strip extra whitespace, detect encoding, perform basic normalization, skip transcription step

#### Feature: Metadata Extraction
- **Description**: Extract structured metadata from uploaded files
- **Inputs**: Source content (file), content type
- **Outputs**: Structured metadata object (title, duration, file size, format)
- **Behavior**: Extract media file duration, detect audio/video format, extract basic file properties

### Capability: Transcription Pipeline
Converts audio/video content into text with word-level timestamps using AssemblyAI.

#### Feature: Streaming Audio/Video Transcription
- **Description**: Transcribe audio/video content with real-time streaming of partial results
- **Inputs**: Media file reference (Cloudflare R2 URL), language hint (optional), job_id
- **Outputs**: Streaming partial transcripts, final complete transcription text, word-level timestamps, confidence scores
- **Behavior**: 
  - Upload R2 file URL to AssemblyAI
  - Initiate transcription job with real-time streaming enabled
  - Receive partial transcript updates via WebSocket from AssemblyAI
  - Emit partial transcripts to frontend via Django Channels WebSocket
  - Retrieve final complete transcript with full timestamps and metadata
  - Save complete transcript to Supabase

#### Feature: Speaker Diarization
- **Description**: Identify and label different speakers in transcribed content
- **Inputs**: Transcription job configuration, audio file reference
- **Outputs**: Speaker-labeled segments, speaker count, speaker change timestamps
- **Behavior**: Enable speaker_labels parameter in AssemblyAI request, receive speaker-tagged segments, assign consistent speaker labels (Speaker A, Speaker B, etc.)

#### Feature: Language Detection
- **Description**: Automatically detect the primary language of content
- **Inputs**: Audio file reference
- **Outputs**: Detected language code (ISO 639-1), confidence score
- **Behavior**: Use AssemblyAI's automatic language detection, support 99+ languages, return language code for display

#### Feature: Transcription Error Handling
- **Description**: Handle transcription failures and retries with exponential backoff
- **Inputs**: Error response from AssemblyAI, attempt count, file characteristics
- **Outputs**: Retry decision, error message for user, retry status
- **Behavior**: Classify error type (timeout, rate limit, invalid file, unsupported format), retry with exponential backoff (max 3 attempts), emit error status via WebSocket, log detailed error information

### Capability: Content Generation Pipeline
Generates structured study materials using Google Gemini.

#### Feature: Material-Specific Prompt Construction
- **Description**: Build tailored prompts for each material type (summary, notes, flashcards, quiz)
- **Inputs**: Transcript text, material type, optional customization parameters (length, difficulty, focus areas)
- **Outputs**: Optimized prompt for Gemini API
- **Behavior**: 
  - **Summary**: Prompt with length specification (short: 150 words, medium: 300 words, long: 500 words), key points extraction
  - **Notes**: Prompt for hierarchical markdown structure, bullet points, section headers, key concepts
  - **Flashcards**: Prompt for Q/A pairs in JSON format, difficulty levels, topic tagging
  - **Quiz**: Prompt for multiple choice questions with distractors, answer key, explanations

#### Feature: Summary Generation
- **Description**: Generate concise summaries in three length variants using Gemini
- **Inputs**: Transcript text, summary length preference (short/medium/long)
- **Outputs**: Summary text, key points list (bullet points), topic tags
- **Behavior**: Call Gemini  API with summary prompt, parse response, structure output with title, main points, and optional subtopics

#### Feature: Detailed Notes Generation
- **Description**: Generate structured, hierarchical markdown notes using Gemini
- **Inputs**: Transcript text, note style preference (outline, Cornell, mind-map)
- **Outputs**: Markdown-formatted notes, concept hierarchy, important definitions, key terms
- **Behavior**: Call Gemini API with notes prompt, parse markdown response, ensure proper heading structure (## H2, ### H3), extract key terms and definitions

#### Feature: Flashcard Generation
- **Description**: Generate Q/A pairs suitable for spaced repetition learning
- **Inputs**: Transcript text, number of flashcards (default: 20), difficulty level (easy/medium/hard)
- **Outputs**: Array of flashcard objects [{question, answer, difficulty, tags}], total count
- **Behavior**: Call Gemini API with flashcard prompt, parse JSON response, ensure questions cover different cognitive levels (recall, comprehension, application), tag by topic

#### Feature: Quiz Generation
- **Description**: Generate multiple choice and short answer questions with answer keys
- **Inputs**: Transcript text, quiz type (multiple_choice, short_answer, mixed), number of questions (default: 10)
- **Outputs**: Quiz object with questions array, answer key, explanations, metadata
- **Behavior**: Call Gemini API with quiz prompt, parse structured response, generate 4 distractors for multiple choice, create detailed explanations, ensure difficulty distribution

#### Feature: Content Parsing and Structuring
- **Description**: Parse Gemini's generated content into structured database format
- **Inputs**: Raw Gemini API response, content type
- **Outputs**: Structured content object ready for database storage
- **Behavior**: Parse JSON or markdown responses, validate structure, handle malformed outputs, ensure all required fields present, format for Supabase storage

#### Feature: Generation Error Handling
- **Description**: Handle LLM generation failures gracefully
- **Inputs**: Error from Gemini API, material type, transcript
- **Outputs**: Error message, retry decision, partial results (if any)
- **Behavior**: Classify error (rate limit, safety filter, malformed output), retry with exponential backoff (max 2 attempts), allow partial success (other materials still generated), emit detailed error via WebSocket

### Capability: AI Chat Assistant (Gemini-Powered)
Provides an interactive chatbot that helps users understand and work with their generated materials and uploaded content.

#### Feature: Chat Interface
- **Description**: Conversational interface powered by Google Gemini for querying study materials
- **Inputs**: User text query, conversation history, reference to materials/uploads
- **Outputs**: Natural language response, citations to specific materials, generated content references
- **Behavior**: Accept text input from user, maintain conversation context, respond with helpful information about user's materials, cite specific sections of transcripts or generated content

#### Feature: Material Q&A
- **Description**: Answer questions about generated study materials (summaries, notes, flashcards, quizzes)
- **Inputs**: User question, generated material references, material content
- **Outputs**: Contextual answer with references to specific materials
- **Behavior**: Access user's generated materials, use Gemini to answer questions about content, provide quotes and references from summaries/notes/transcripts, explain concepts from materials

#### Feature: Upload Content Q&A
- **Description**: Answer questions about user-uploaded or processed content
- **Inputs**: User question, uploaded file references, transcripts
- **Outputs**: Contextual answer with timestamps and references
- **Behavior**: Access uploaded content and transcriptions, use Gemini to answer questions about the original material, provide timestamp references for audio/video content, extract specific information on demand

#### Feature: Google Drive File Retrieval
- **Description**: Allow users to request files from their Google Drive for material generation
- **Inputs**: User natural language request (e.g., "get my Biology lecture notes from Drive"), Google Drive OAuth token
- **Outputs**: List of matching Drive files, confirmation prompt, file download and processing
- **Behavior**: 
  - Parse user's natural language request to identify file criteria (name, type, folder)
  - Search user's Google Drive using Google Drive API
  - Present matching files to user for selection
  - Download selected file from Google Drive
  - Automatically initiate material generation pipeline for the retrieved file
  - Maintain chat context about which file was processed

#### Feature: Conversational Material Generation
- **Description**: Generate new materials or refine existing ones through chat commands
- **Inputs**: User chat command (e.g., "create more flashcards from this section"), material references
- **Outputs**: Newly generated content, status updates
- **Behavior**: Parse user intent for material generation requests, trigger generation pipeline for specific content sections, provide real-time updates through chat interface

#### Feature: Chat History Management
- **Description**: Persist and retrieve chat conversation history per user
- **Inputs**: User session, messages, material references
- **Outputs**: Conversation threads, searchable chat history
- **Behavior**: Store chat messages with timestamps and context, link conversations to specific jobs/materials, allow users to resume previous conversations, search past chat interactions

### Capability: Google Drive Integration
Enables seamless integration with Google Drive for file retrieval and material generation.

#### Feature: Google Drive Authentication
- **Description**: OAuth 2.0 authentication flow for Google Drive access
- **Inputs**: User authorization request, OAuth callback
- **Outputs**: Access token, refresh token, Drive permissions
- **Behavior**: Initiate Google OAuth flow, request Drive read permissions (drive.readonly scope), store encrypted tokens, handle token refresh automatically

#### Feature: Drive File Search
- **Description**: Search and filter files in user's Google Drive
- **Inputs**: Search query, file type filters, folder paths, user Drive token
- **Outputs**: List of matching files with metadata (name, type, size, modified date)
- **Behavior**: Call Google Drive API with search parameters, filter by supported file types (documents, audio, video, PDFs), return sorted results by relevance or date

#### Feature: Drive File Download
- **Description**: Download files from Google Drive to processing pipeline
- **Inputs**: Google Drive file ID, user authorization token
- **Outputs**: Downloaded file, temporary storage reference
- **Behavior**: Download file from Drive using Google Drive API, validate file type and size, store temporarily for processing, trigger material generation pipeline

#### Feature: Drive File Picker Integration
- **Description**: Embedded Google Drive picker UI component
- **Inputs**: User session, Drive OAuth token
- **Outputs**: Selected file references
- **Behavior**: Display Google Drive picker modal, allow file browsing and selection, return selected file metadata to initiate download and processing

### Capability: User Interface & Interactions
Provides web-based interface for uploading content and interacting with generated materials.

#### Feature: Upload/Import Interface
- **Description**: Provide drag-and-drop and file picker interface for content ingestion
- **Inputs**: User interactions (drag, click, paste), file objects
- **Outputs**: Upload progress, validation feedback, file preview
- **Behavior**: Handle drag-and-drop events, validate files client-side, show upload progress

#### Feature: Real-time Status Updates
- **Description**: Display live progress updates for transcription and generation processes
- **Inputs**: Process status events from backend, user session
- **Outputs**: Status messages, progress percentages, estimated time remaining
- **Behavior**: Establish WebSocket connection, receive status updates, update UI in real-time

#### Feature: Output Viewer
- **Description**: Display generated content in tabbed interface (Summary, Notes, Flashcards, Quiz)
- **Inputs**: Generated content objects, user selection (tab)
- **Outputs**: Rendered content view, formatted appropriately for content type
- **Behavior**: Parse markdown/structured content, render flashcards with flip animation, handle tab switching

#### Feature: Export Functionality
- **Description**: Export generated content to multiple formats with tier-based access
- **Inputs**: Content type, selected content, export format preference, user subscription tier
- **Outputs**: Downloadable file (PDF for paid users, Markdown/JSON for all users)
- **Behavior**: 
  - **Markdown Export** (All users): Export notes and summaries as formatted .md files
  - **JSON Export** (All users): Export flashcards and quizzes as structured JSON for import into other apps
  - **PDF Export** (Paid tier only): Generate professionally formatted PDF with:
    - Cover page with title and date
    - Table of contents
    - Formatted transcript with timestamps
    - All generated materials (summaries, notes, flashcards, quizzes)
    - Custom styling and branding
    - Optimized for printing and mobile viewing
  - Check user subscription tier before allowing PDF export
  - Trigger browser download or email delivery for large files
#### Feature: Content History Management
- **Description**: Save and retrieve previously generated content for user
- **Inputs**: User session, content objects, search/filter criteria
- **Outputs**: List of saved content items, individual content retrieval
- **Behavior**: Store content with metadata, implement search/filter, paginate results, allow deletion

#### Feature: Regeneration Interface
- **Description**: Provide UI controls to regenerate or refine generated content
- **Inputs**: User refinement instructions, original content reference
- **Outputs**: Updated content, regeneration status
- **Behavior**: Capture user input, send refinement request, show loading state, update display

### Capability: Authentication & Authorization
Manages user accounts, authentication, and access control.

#### Feature: User Registration
- **Description**: Create new user accounts with email verification
- **Inputs**: Email, password, optional name
- **Outputs**: User account object, verification token
- **Behavior**: Validate email format, hash password, create user record, send verification email

#### Feature: User Login
- **Description**: Authenticate users and issue JWT tokens
- **Inputs**: Email, password
- **Outputs**: JWT access token, refresh token, user profile
- **Behavior**: Verify credentials, check account status, generate JWT tokens, return user data

#### Feature: Token Management
- **Description**: Handle JWT token refresh and validation
- **Inputs**: Refresh token, access token
- **Outputs**: New access token, token validity status
- **Behavior**: Validate refresh token, issue new access token, handle expiration, revoke on logout

#### Feature: Access Control
- **Description**: Enforce user-specific access to content and resources
- **Inputs**: User identity, resource identifier, action type
- **Outputs**: Authorization decision (allow/deny)
- **Behavior**: Check user ownership of resources, validate permissions, enforce rate limits

### Capability: Storage & File Management
Manages file storage in cloud object storage and database references.

#### Feature: Object Storage Integration
- **Description**: Store and retrieve files from cloud storage (S3, R2, etc.)
- **Inputs**: File data, storage key, operation type (upload/download/delete)
- **Outputs**: Storage URL, operation success status
- **Behavior**: Upload files with proper headers, generate unique storage keys, handle errors

#### Feature: File Reference Management
- **Description**: Track file metadata and references in database
- **Inputs**: File upload result, user ID, file metadata
- **Outputs**: File record with storage reference
- **Behavior**: Create database record, link to user, store storage key, track file lifecycle

#### Feature: File Cleanup
- **Description**: Remove orphaned or expired files from storage
- **Inputs**: File references, expiration criteria
- **Outputs**: Cleanup report (files deleted, errors)
- **Behavior**: Identify files not referenced in database, check expiration dates, delete from storage

### Capability: Background Processing
Manages asynchronous task processing for transcription and generation.

#### Feature: Task Queue Management
- **Description**: Queue and manage background tasks using Celery/Bull
- **Inputs**: Task type, task parameters, priority
- **Outputs**: Task ID, queue position, estimated start time
- **Behavior**: Create task, assign to appropriate queue, set priority, return task identifier

#### Feature: Transcription Task Execution
- **Description**: Execute transcription asynchronously with progress tracking
- **Inputs**: File reference, transcription parameters, task ID
- **Outputs**: Transcription result, progress updates, completion status
- **Behavior**: Upload file to provider, poll for completion, emit progress events, store results

#### Feature: Generation Task Execution
- **Description**: Execute content generation asynchronously with progress tracking
- **Inputs**: Source text, generation type, parameters, task ID
- **Outputs**: Generated content, progress updates, completion status
- **Behavior**: Call LLM provider, stream responses, emit progress, store results, handle rate limits

#### Feature: Task Status Tracking
- **Description**: Track and report status of background tasks
- **Inputs**: Task ID, status updates
- **Outputs**: Current task status, progress percentage, error messages
- **Behavior**: Update task state in database, emit WebSocket events, calculate progress

### Capability: Analytics & Metrics
Tracks usage, performance, and business metrics.

#### Feature: Usage Tracking
- **Description**: Record user actions and feature usage
- **Inputs**: User ID, action type, metadata, timestamp
- **Outputs**: Analytics event record
- **Behavior**: Log events to analytics database, anonymize sensitive data, track feature usage patterns

#### Feature: Performance Metrics Collection
- **Description**: Collect timing and performance data for operations
- **Inputs**: Operation type, duration, success/failure, metadata
- **Outputs**: Performance metric record
- **Behavior**: Measure operation duration, record success rates, track error frequencies

#### Feature: Cost Tracking
- **Description**: Track AI provider costs per user and operation
- **Inputs**: Provider name, operation type, token usage, cost
- **Outputs**: Cost record with attribution
- **Behavior**: Calculate costs from provider responses, attribute to users, aggregate by time period

#### Feature: Analytics Dashboard
- **Description**: Provide aggregated analytics views for administrators
- **Inputs**: Time range, metric filters, aggregation level
- **Outputs**: Aggregated metrics, charts data, trend analysis
- **Behavior**: Query analytics database, aggregate by time periods, calculate trends

### Capability: Error Handling & Resilience
Provides robust error handling, retry logic, and system resilience.

#### Feature: Error Classification
- **Description**: Categorize errors by type and severity for appropriate handling
- **Inputs**: Error object, context, operation type
- **Outputs**: Error classification, severity level, handling strategy
- **Behavior**: Analyze error codes, classify by type, assign severity, determine retry strategy

#### Feature: Retry Logic
- **Description**: Implement exponential backoff retry for transient failures
- **Inputs**: Failed operation, error type, attempt count
- **Outputs**: Retry decision, delay duration, max attempts reached
- **Behavior**: Check error classification, calculate exponential backoff, enforce max attempts

#### Feature: Fallback Mechanisms
- **Description**: Provide fallback options when primary providers fail
- **Inputs**: Failed provider, operation type, available alternatives
- **Outputs**: Fallback provider selection, fallback result
- **Behavior**: Identify alternative providers, switch to fallback, maintain operation continuity

#### Feature: Error Reporting
- **Description**: Log and report errors for monitoring and debugging
- **Inputs**: Error object, context, user ID, operation details
- **Outputs**: Error log entry, alert notification (if critical)
- **Behavior**: Format error details, store in error log, send alerts for critical errors

---

## Structural Decomposition

### Backend Architecture (Django)

```
backend/
├── config/
│   ├── settings.py               # Django settings
│   ├── urls.py                   # Root URL configuration
│   └── wsgi.py                   # WSGI application
├── apps/
│   ├── ingestion/                # Source Ingestion capability
│   │   ├── models.py             # Job tracking model
│   │   ├── serializers.py        # DRF serializers
│   │   ├── views.py              # POST /api/process endpoint
│   │   ├── file_handler.py       # File Upload with Material Selection
│   │   ├── r2_storage.py         # Cloudflare R2 integration
│   │   └── metadata_extractor.py # Metadata Extraction
│   ├── transcription/            # Transcription Pipeline capability
│   │   ├── models.py             # Transcription records
│   │   ├── serializers.py        # DRF serializers
│   │   ├── assemblyai_client.py  # AssemblyAI integration (streaming)
│   │   ├── streaming_handler.py  # Real-time streaming to frontend
│   │   └── error_handler.py      # Transcription Error Handling
│   ├── generation/               # Content Generation Pipeline capability
│   │   ├── models.py             # Generated materials records
│   │   ├── serializers.py        # DRF serializers
│   │   ├── gemini_client.py      # Google Gemini integration
│   │   ├── prompts.py            # Material-specific prompt templates
│   │   ├── parsers.py            # Content parsing and structuring
│   │   └── generators.py         # Summary, Notes, Flashcards, Quiz generators
│   ├── accounts/                 # Authentication (Supabase Auth integration)
│   │   ├── middleware.py         # Supabase JWT validation
│   │   ├── views.py              # Auth endpoints (delegates to Supabase)
│   │   └── permissions.py        # Access Control
│   ├── storage/                  # Storage Management
│   │   ├── models.py             # File reference models
│   │   ├── r2_client.py          # Cloudflare R2 client
│   │   └── cleanup.py            # File Cleanup
│   ├── tasks/                    # Background Processing capability
│   │   ├── celery_app.py         # Celery configuration
│   │   ├── process_job.py        # Main job processing task
│   │   └── websocket_emitter.py  # WebSocket event emitter
│   ├── analytics/                # Analytics & Metrics capability
│   │   ├── models.py             # Analytics event models
│   │   ├── tracker.py            # Event and cost tracking
│   │   └── views.py              # Analytics dashboard
│   ├── chat/                     # AI Chat Assistant capability
│   │   ├── models.py             # Chat conversation and message models
│   │   ├── serializers.py        # DRF serializers
│   │   ├── views.py              # Chat API endpoints
│   │   ├── gemini_chat.py        # Gemini chat integration
│   │   ├── context_builder.py    # Build context from materials
│   │   └── intent_parser.py      # Parse user intent for actions
│   ├── google_drive/             # Google Drive Integration capability
│   │   ├── models.py             # Drive token storage models
│   │   ├── serializers.py        # DRF serializers
│   │   ├── views.py              # OAuth and file picker endpoints
│   │   ├── drive_client.py       # Google Drive API client
│   │   ├── auth_handler.py       # OAuth 2.0 flow handler
│   │   └── file_downloader.py    # Download files from Drive
│   └── core/                     # Shared utilities
│       ├── exceptions.py         # Custom exception classes
│       ├── error_handler.py      # Error Classification
│       ├── retry_logic.py        # Retry Logic
│       └── supabase_client.py    # Supabase client wrapper
├── manage.py
└── requirements.txt
```

### Frontend Architecture (React/Next.js)

```
frontend/
├── src/
│   ├── components/
│   │   ├── Upload/               # Upload/Import Interface
│   │   │   ├── UploadDropzone.jsx
│   │   │   ├── FilePicker.jsx
│   │   │   └── UploadProgress.jsx
│   │   ├── Status/               # Real-time Status Updates
│   │   │   ├── StatusPanel.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── TaskStatus.jsx
│   │   ├── Viewer/               # Output Viewer
│   │   │   ├── ContentTabs.jsx
│   │   │   ├── SummaryView.jsx
│   │   │   ├── NotesView.jsx
│   │   │   ├── FlashcardView.jsx
│   │   │   └── QuizView.jsx
│   │   ├── Export/               # Export Functionality
│   │   │   ├── ExportButton.jsx
│   │   │   └── FormatSelector.jsx
│   │   ├── History/              # Content History Management
│   │   │   ├── ContentList.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── FilterPanel.jsx
│   │   ├── Regenerate/           # Regeneration Interface
│   │   │   ├── RegeneratePanel.jsx
│   │   │   └── RefinementForm.jsx
│   │   ├── Chat/                 # AI Chat Assistant
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   └── ChatSidebar.jsx
│   │   └── GoogleDrive/          # Google Drive Integration
│   │       ├── DriveAuthButton.jsx
│   │       ├── DriveFilePicker.jsx
│   │       └── DriveFileList.jsx
│   ├── services/
│   │   ├── api.js                # API client
│   │   ├── websocket.js          # WebSocket connection
│   │   ├── export.js             # Export utilities
│   │   ├── chat.js               # Chat API service
│   │   ├── google_drive.js       # Google Drive API service
│   │   └── auth.js               # Authentication
│   ├── pages/
│   │   ├── index.jsx             # Home/Dashboard
│   │   ├── login.jsx             # Login page
│   │   ├── register.jsx          # Registration page
│   │   ├── upload.jsx            # Upload interface
│   │   ├── content/[id].jsx      # Content viewer
│   │   └── history.jsx           # Content history
│   ├── hooks/
│   │   ├── useUpload.js
│   │   ├── useWebSocket.js
│   │   └── useContent.js
│   ├── styles/
│   │   └── globals.css
│   └── App.jsx
├── package.json
└── next.config.js
```

---

## Dependency Graph

### Foundation Layer (Phase 0)
**No dependencies - these are built first.**

#### core
- **Responsibility**: Error handling, retry logic, and fallback mechanisms
- **Dependencies**: None
- **Rationale**: All other modules need error handling and resilience patterns

#### accounts
- **Responsibility**: Authentication and authorization
- **Dependencies**: None
- **Rationale**: Required before any user-facing features can enforce access control

---

### Infrastructure Layer (Phase 1)
**Depends on foundation modules.**

#### storage
- **Dependencies**: [core, accounts]
- **Rationale**:
  - Uses `core` for error handling and retry logic
  - Uses `accounts` for user association with files and access control
- **Exports**:
  - `upload_file(file_data, key)`
  - `download_file(storage_key)`
  - `delete_file(storage_key)`
  - `create_file_reference(file_data, user_id)`

---

### Data Ingestion Layer (Phase 2)
**Depends on infrastructure and foundation.**

#### ingestion
- **Dependencies**: [storage, core, accounts]
- **Rationale**:
  - Uses `storage` for file uploads and management
  - Uses `core` for error handling
  - Uses `accounts` for user authentication and ownership
- **Exports**:
  - `process_youtube_url(url)`
  - `handle_file_upload(file)`
  - `process_text_input(text)`
  - `extract_metadata(source)`

---

### Processing Layer (Phase 3)
**Depends on ingestion and infrastructure.**

#### transcription
- **Dependencies**: [ingestion, storage, core]
- **Rationale**:
  - Uses `ingestion` for source content access
  - Uses `storage` for file access and temporary storage
  - Uses `core` for error handling and retry logic
- **Exports**:
  - `select_provider(content_type, duration)`
  - `transcribe_audio(file_ref, provider)`
  - `detect_speakers(transcription)`
  - `detect_language(content)`

#### generation
- **Dependencies**: [transcription, core]
- **Rationale**:
  - Uses `transcription` for source text input
  - Uses `core` for error handling and provider fallback
- **Exports**:
  - `generate_summary(text, length)`
  - `generate_notes(text, style)`
  - `generate_flashcards(text, count)`
  - `generate_quiz(text, type, count)`
  - `refine_content(content, instructions)`

---

### Orchestration Layer (Phase 4)
**Depends on processing modules.**

#### tasks
- **Dependencies**: [transcription, generation, storage, core]
- **Rationale**:
  - Orchestrates `transcription` and `generation` as async tasks
  - Uses `storage` for file access
  - Uses `core` for error handling
- **Exports**:
  - `queue_transcription_task(file_ref, params)`
  - `queue_generation_task(source_text, type, params)`
  - `get_task_status(task_id)`
  - `cancel_task(task_id)`

---

### Monitoring Layer (Phase 5)
**Depends on all operational modules.**

#### analytics
- **Dependencies**: [tasks, transcription, generation, accounts, core]
- **Rationale**:
  - Tracks events from all major operations
  - Uses `accounts` for user attribution
  - Uses `core` for error handling
- **Exports**:
  - `track_event(user_id, action, metadata)`
  - `record_performance(operation, duration, success)`
  - `track_cost(provider, operation, cost)`
  - `get_analytics(time_range, filters)`

---

## Technology Stack

### Backend
- **Framework**: Django 4.2+ with Django REST Framework
- **Task Queue**: Celery with Redis
- **Database**: Supabase (PostgreSQL with built-in features)
  - Row Level Security (RLS) for data isolation
  - Real-time subscriptions for live updates
  - Built-in authentication and storage
  - Auto-generated REST APIs
- **Storage**: Cloudflare R2 (S3-compatible, zero egress fees)
- **WebSockets**: Django Channels with Redis

### Frontend
- **Framework**: Next.js 14+ (React 18+)
- **Styling**: Tailwind CSS
- **State Management**: React Context + TanStack Query
- **WebSockets**: Socket.io-client

### AI Providers
- **Transcription**: AssemblyAI (with streaming support)
- **LLM**: Google Gemini (Gemini 1.5 Pro/Flash)

### Infrastructure
- **Hosting**: Vercel (frontend), Railway/Fly.io (backend)
- **Cache**: Redis (for Celery and session management)
- **Monitoring**: Sentry (errors), PostHog (analytics)

---

## Implementation Phases

### Phase 0: Foundation (Week 1)
- Set up Django project structure
- Implement core error handling and resilience patterns
- Set up authentication (JWT tokens, registration, login)
- Configure database and migrations

### Phase 1: Infrastructure (Week 1-2)
- Implement storage module (S3/R2 integration)
- Set up Celery for background tasks
- Configure Redis for caching and task queue
- Set up WebSocket infrastructure with Django Channels

### Phase 2: Data Ingestion (Week 2-3)
- Implement file upload handling
- Implement YouTube URL processing
- Implement text input processing
- Implement metadata extraction

### Phase 3: Processing (Week 3-5)
- Implement transcription pipeline
  - Provider selection logic
  - AssemblyAI integration
  - Whisper integration
  - Error handling and retry logic
- Implement content generation pipeline
  - LLM provider abstraction
  - Summary generation
  - Notes generation
  - Flashcard generation
  - Quiz generation

### Phase 4: Orchestration (Week 5-6)
- Implement Celery tasks for transcription
- Implement Celery tasks for generation
- Implement task status tracking
- Integrate WebSocket progress updates

### Phase 5: Frontend (Week 6-8)
- Build upload interface
- Build status display components
- Build content viewer (tabs for different content types)
- Build export functionality
- Build content history and search
- Build regeneration interface

### Phase 6: Monitoring & Polish (Week 8-9)
- Implement analytics tracking
- Implement performance metrics collection
- Implement cost tracking
- Build admin dashboard
- Performance optimization
- Testing and bug fixes

### Phase 7: Launch Preparation (Week 9-10)
- Security audit
- Load testing
- Documentation
- Deployment automation
- User onboarding flow

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout

### Processing (Unified Endpoint)
- `POST /api/process` - Upload file + select materials, start full pipeline
  - **Request**: `multipart/form-data`
    - `file`: Audio/video file
    - `material_types`: Array of strings ("summary", "notes", "flashcards", "quiz")
    - `options`: JSON object with optional parameters (summary_length, flashcard_count, etc.)
  - **Response**: `{ job_id, status, estimated_time }`
  - **Behavior**: Validates file, uploads to R2, creates job record, returns job_id, triggers async processing

### WebSocket Streaming
- `WS /api/stream/{job_id}` - Real-time updates for transcription and generation
  - **Events sent to client**:
    - `transcript_partial`: `{ type, text, progress }` - Streaming transcript updates
    - `transcript_complete`: `{ type, full_text, word_timestamps, speakers }` - Final transcript
    - `material_generating`: `{ type, material_type }` - Material generation started
    - `material_generated`: `{ type, material_type, content }` - Material completed
    - `complete`: `{ type, transcript, materials }` - All processing complete
    - `error`: `{ type, error_message, retry_available }` - Error occurred
  - **Events from client**:
    - `ping`: Keep-alive
    - `reconnect`: Request current status after disconnection

### Content Management
- `GET /api/content` - List user's generated content (paginated)
- `GET /api/content/{id}` - Get specific content with all materials
- `DELETE /api/content/{id}` - Delete content and associated materials
- `GET /api/content/search?q={query}` - Search content by title or transcript text

### Export
- `POST /api/export` - Export materials to file
  - **Request**: `{ content_id, material_types[], format }` 
  - **Formats**: 
    - `markdown` - All users, exports notes/summaries as .md
    - `json` - All users, exports flashcards/quizzes as structured JSON
    - `pdf` - **Paid tier only**, comprehensive PDF with all materials
  - **Response**: `{ download_url, expires_at, file_size_bytes }`
  - **Behavior**: Returns 402 Payment Required if free user requests PDF format

### Chat Assistant
- `POST /api/chat/conversations` - Create new chat conversation
  - **Request**: `{ initial_message, material_ids[] }` (optional material references)
  - **Response**: `{ conversation_id, created_at }`
  
- `GET /api/chat/conversations` - List user's chat conversations
  - **Response**: `{ conversations: [{ id, created_at, last_message, material_references }] }`
  
- `POST /api/chat/conversations/{conversation_id}/messages` - Send message to chat
  - **Request**: `{ message, material_ids[] }` (optional context)
  - **Response**: `{ message_id, response, citations, suggested_actions }`
  - **Behavior**: Process message with Gemini, access referenced materials, return answer with citations
  
- `GET /api/chat/conversations/{conversation_id}/messages` - Get conversation history
  - **Response**: `{ messages: [{ id, role, content, created_at, citations }] }`
  
- `DELETE /api/chat/conversations/{conversation_id}` - Delete conversation

### Google Drive Integration
- `GET /api/drive/auth` - Initiate Google Drive OAuth flow
  - **Response**: `{ auth_url }` - Redirect user to Google OAuth consent
  - **Behavior**: Generate OAuth URL with drive.readonly scope
  
- `GET /api/drive/callback` - OAuth callback endpoint
  - **Request**: Query params from Google OAuth (code, state)
  - **Response**: `{ success, drive_connected }`
  - **Behavior**: Exchange auth code for tokens, store encrypted tokens in database
  
- `GET /api/drive/status` - Check if user has connected Google Drive
  - **Response**: `{ connected, email, expires_at }`
  
- `POST /api/drive/search` - Search user's Google Drive
  - **Request**: `{ query, file_types[], folder_id }` (optional filters)
  - **Response**: `{ files: [{ id, name, type, size, modified_at, thumbnail_url }] }`
  
- `POST /api/drive/process` - Download file from Drive and start material generation
  - **Request**: `{ file_id, material_types[] }`
  - **Response**: `{ job_id, status, estimated_time }`
  - **Behavior**: Download from Drive, upload to R2, create job, start processing pipeline
  
- `DELETE /api/drive/disconnect` - Revoke Google Drive access
  - **Behavior**: Delete stored tokens, revoke Drive API access

---

## Database Schema (Supabase/PostgreSQL)

> [!NOTE]  
> **Supabase Features Used:**
> - **Row Level Security (RLS)**: Each table has RLS policies to ensure users only access their own data
> - **Real-time Subscriptions**: Frontend can subscribe to job status changes
> - **Auto-generated APIs**: Supabase provides REST APIs for all tables
> - **Built-in Auth**: User management handled by Supabase Auth

### Users (Managed by Supabase Auth)
```sql
-- Supabase automatically creates this table
auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### User Subscriptions
```sql
-- Track user subscription status and usage
user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Subscription details
  tier VARCHAR(20) DEFAULT 'free',  -- 'free', 'pro', 'enterprise'
  status VARCHAR(20) DEFAULT 'active',  -- 'active', 'cancelled', 'expired'
  
  -- Limits based on tier
  monthly_upload_limit INTEGER DEFAULT 5,
  monthly_minutes_limit INTEGER DEFAULT 30,
  max_file_size_mb INTEGER DEFAULT 100,
  
  -- Current month usage (reset monthly)
  uploads_this_month INTEGER DEFAULT 0,
  minutes_used_this_month FLOAT DEFAULT 0,
  usage_reset_date DATE DEFAULT NOW(),
  
  -- Billing
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_started_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- RLS Policy: Users can only view their own subscription
  CONSTRAINT user_subscription_policy CHECK (auth.uid() = user_id)
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_tier ON user_subscriptions(tier);
```

### Jobs
```sql
-- Central table tracking each upload and processing job
jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File information
  filename VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT,
  file_type VARCHAR(50),
  storage_url TEXT NOT NULL,  -- Cloudflare R2 URL
  
  -- Material selection
  material_types TEXT[] NOT NULL,  -- ['summary', 'notes', 'flashcards', 'quiz']
  options JSONB DEFAULT '{}',      -- Custom options per material type
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'queued',  -- queued, transcribing, generating, completed, failed
  progress INTEGER DEFAULT 0,            -- 0-100
  current_step VARCHAR(100),             -- Current processing step description
  
  -- Relationships
  transcription_id UUID REFERENCES transcriptions(id),
  
  -- Metadata
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- RLS Policy: Users can only access their own jobs
  CONSTRAINT user_jobs_policy CHECK (auth.uid() = user_id)
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
```

### Transcriptions
```sql
transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  
  -- Transcription results
  full_text TEXT NOT NULL,
  word_timestamps JSONB,    -- [{word, start, end, confidence}]
  speakers JSONB,           -- [{speaker, start, end, text}]
  language VARCHAR(10),     -- ISO 639-1 code (e.g., 'en', 'es')
  confidence FLOAT,
  
  -- AssemblyAI specific
  assemblyai_id VARCHAR(255),  -- AssemblyAI transcription ID
  audio_duration FLOAT,         -- Duration in seconds
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- RLS Policy: Users can only access transcriptions for their jobs
  CONSTRAINT user_transcriptions_policy CHECK (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_id AND jobs.user_id = auth.uid())
  )
);

CREATE INDEX idx_transcriptions_job_id ON transcriptions(job_id);
```

### Generated Materials
```sql
generated_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  transcription_id UUID REFERENCES transcriptions(id),
  
  -- Material information
  material_type VARCHAR(50) NOT NULL,  -- 'summary', 'notes', 'flashcards', 'quiz'
  content JSONB NOT NULL,              -- Structured content based on type
  
  -- For summaries: {title, short, medium, long, key_points[]}
  -- For notes: {title, sections: [{heading, content, subsections}]}
  -- For flashcards: {cards: [{question, answer, difficulty, tags[]}]}
  -- For quizzes: {questions: [{question, options[], correct, explanation}]}
  
  -- Generation metadata
  gemini_model VARCHAR(50),     -- e.g., 'gemini-1.5-pro', 'gemini-1.5-flash'
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  generation_time_ms INTEGER,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- RLS Policy: Users can only access materials for their jobs
  CONSTRAINT user_materials_policy CHECK (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_id AND jobs.user_id = auth.uid())
  )
);

CREATE INDEX idx_materials_job_id ON generated_materials(job_id);
CREATE INDEX idx_materials_type ON generated_materials(material_type);
```

### Analytics Events (Optional)
```sql
analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
```

### Chat Conversations
```sql
-- Conversations with the AI chat assistant
chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Conversation metadata
  title VARCHAR(255),  -- Auto-generated from first message
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- RLS Policy: Users can only access their own conversations
  CONSTRAINT user_conversations_policy CHECK (auth.uid() = user_id)
);

CREATE INDEX idx_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON chat_conversations(updated_at);
```

### Chat Messages
```sql
-- Individual messages within chat conversations
chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  
  -- Message content
  role VARCHAR(20) NOT NULL,  -- 'user' or 'assistant'
  content TEXT NOT NULL,
  
  -- Material references - which materials are relevant to this message
  material_ids UUID[],  -- References to generated_materials.id
  job_ids UUID[],       -- References to jobs.id
  
  -- Citations and context
  citations JSONB,  -- [{material_id, quote, section}]
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- RLS Policy: Users can only access messages from their conversations
  CONSTRAINT user_messages_policy CHECK (
    EXISTS (SELECT 1 FROM chat_conversations WHERE chat_conversations.id = conversation_id AND chat_conversations.user_id = auth.uid())
  )
);

CREATE INDEX idx_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_messages_created_at ON chat_messages(created_at);
```

### Google Drive Tokens
```sql
-- Encrypted Google Drive OAuth tokens per user
google_drive_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- OAuth tokens (encrypted at rest)
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  
  -- Token metadata
  token_type VARCHAR(20) DEFAULT 'Bearer',
  expires_at TIMESTAMP NOT NULL,
  scope TEXT NOT NULL,  -- e.g., 'https://www.googleapis.com/auth/drive.readonly'
  
  -- User's Google account info
  google_email VARCHAR(255),
  google_user_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  
  -- RLS Policy: Users can only access their own tokens
  CONSTRAINT user_drive_tokens_policy CHECK (auth.uid() = user_id)
);

CREATE INDEX idx_drive_tokens_user_id ON google_drive_tokens(user_id);
CREATE INDEX idx_drive_tokens_expires_at ON google_drive_tokens(expires_at);
```

---

## Security Considerations

### Authentication & Authorization
- JWT tokens with short expiration (15 min access, 7 day refresh)
- Rate limiting on auth endpoints (5 attempts per 15 min)
- Strong password requirements (min 8 chars, complexity)
- Email verification required before full account access

### File Upload Security
- File type validation (whitelist only)
- File size limits (100MB for free tier, 500MB for paid)
- Virus scanning for uploaded files
- Signed URLs for file access (time-limited)

### API Security
- Rate limiting per user and endpoint
- CORS configuration (whitelist only)
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (output escaping)

### Data Privacy
- Encryption at rest for user data
- Encryption in transit (HTTPS only)
- User data deletion on account termination
- GDPR compliance (data export, right to be forgotten)

### AI Provider Security
- API keys stored in environment variables (never in code)
- Separate API keys per environment
- Usage limits and monitoring
- PII filtering before sending to AI providers

---

## Subscription Tiers

### Free Tier
**Pricing**: $0/month

**Limits:**
- 5 uploads per month
- Maximum 30 minutes total audio/video per month
- Files up to 100MB

**Features:**
- ✅ Full transcription with timestamps
- ✅ Speaker diarization
- ✅ All material types (summary, notes, flashcards, quiz)
- ✅ Content history and search
- ✅ Export to Markdown and JSON
- ❌ PDF export (paid only)
- ❌ Priority processing
- ❌ Extended file retention (30 days only)

### Paid Tier (Pro)
**Pricing**: $9.99/month

**Limits:**
- 50 uploads per month
- Maximum 1500 minutes total audio/video per month
- Files up to 500MB

**Features:**
- ✅ Everything in Free tier
- ✅ **Professional PDF export** with custom styling
  - Cover page and table of contents
  - Formatted transcript with timestamps
  - All materials in single document
  - Optimized for printing and mobile
- ✅ Priority processing (faster queue)
- ✅ Unlimited file retention
- ✅ Advanced analytics
- ✅ Email support
- ✅ Custom material options (longer summaries, more flashcards)

### Enterprise (Future)
**Pricing**: Custom

**Features:**
- ✅ Everything in Pro tier
- ✅ Unlimited uploads
- ✅ White-label branding
- ✅ API access
- ✅ SSO integration
- ✅ Dedicated support
- ✅ Custom integrations

---

## Cost Optimization

### Transcription Costs (AssemblyAI)
- **Pricing**: $0.00025/second ($0.015/minute, $0.90/hour)
- **Streaming**: No additional cost for real-time streaming transcription
- **Speaker Diarization**: Included at no extra charge
- **Language Detection**: Included for 99+ languages

**Example Costs:**
- 5-minute audio: $0.075
- 30-minute lecture: $0.45
- 1-hour meeting: $0.90

### LLM Costs (Gemini)
- **Gemini 1.5 Flash**: $0.00001875/1K input tokens, $0.000075/1K output tokens
- **Gemini 1.5 Pro**: $0.00125/1K input tokens, $0.005/1K output tokens
- **Strategy**: Use Flash for summaries/notes (faster, cheaper), Pro for complex quizzes/flashcards

**Estimated Token Usage Per Material:**
- Summary (3 variants): ~1K input, ~500 output tokens
- Notes: ~1K input, ~800 output tokens
- Flashcards (20 cards): ~1K input, ~1.5K output tokens
- Quiz (10 questions): ~1K input, ~2K output tokens

**Example Costs (30min lecture, ~15K transcript tokens):**
- Summary (Flash): $0.00028 input + $0.00004 output = $0.00032
- Notes (Flash): $0.00028 input + $0.00006 output = $0.00034
- Flashcards (Pro): $0.01875 input + $0.0075 output = $0.02625
- Quiz (Pro): $0.01875 input + $0.01 output = $0.02875
- **Total per job (all materials)**: ~$0.06

### Storage Costs (Cloudflare R2)
- **Storage**: $0.015/GB/month
- **Egress**: $0.00 (zero egress fees!)
- **Class A Operations** (upload): $4.50/million requests
- **Class B Operations** (download): $0.36/million requests

**Strategy:**
- Files stored for 30 days (free tier) or unlimited (paid tier)
- Daily cleanup job removes expired files
- Average file size: 50MB audio/video
- Storage cost per file/month: ~$0.00075

### Database Costs (Supabase)
- **Free Tier**: 
  - 500MB database storage
  - 1GB file storage
  - 2GB bandwidth
  - 50,000 monthly active users
- **Pro Tier** ($25/month):
  - 8GB database storage
  - 100GB file storage
  - 50GB bandwidth

**Note**: Using Cloudflare R2 for media files keeps us well within Supabase free tier for database only.

### Total Cost Per User (30-minute files)

**Single Job Example:**
- Transcription (AssemblyAI): $0.45
- Generation (Gemini): $0.06
- Storage (R2, 1 month): $0.00075
- **Total**: ~$0.51 per job

**Target Pricing Tiers:**
- **Free Tier**: 5 uploads/month
  - Cost: ~$2.55/user/month
  - Revenue: $0
  - Margin: -$2.55 (acquisition cost)
  
- **Paid Tier**: $9.99/month, 50 uploads
  - Cost: ~$25.50/user/month at full usage
  - Revenue: $9.99
  - Margin: -$15.51 at max usage (need volume for profitability)
  
**Breakeven Analysis:**
- Average users use ~10 uploads/month: $5.10 cost
- Need pricing at $7-10/month for profitability
- Free tier is acquisition tool, convert to paid

---

## Future Enhancements

### Phase 8+ (Post-Launch)
- **Mobile apps** (iOS/Android) with native upload
- **Browser extension** for one-click YouTube processing
- **Spaced repetition scheduler** for flashcards
- **Collaborative study** (share content with classmates)
- **Content templates** (customize output format)
- **Integration with note-taking apps** (Notion, Obsidian export)
- **Live lecture transcription** (real-time processing)
- **Advanced analytics** (learning progress tracking)
- **API for third-party integrations**
- **White-label solution for educational institutions**

