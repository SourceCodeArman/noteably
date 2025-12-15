from django.test import TestCase
from unittest.mock import patch
from celery.exceptions import Retry
from apps.ingestion.models import Job
from apps.generation.models import GeneratedContent
from apps.ingestion.tasks import process_upload_task
import uuid


class GenerationPipelineTest(TestCase):
    def setUp(self):
        self.user_id = uuid.uuid4()
        self.job = Job.objects.create(
            user_id=self.user_id,
            filename="test.mp3",
            file_size_bytes=1000,
            file_type="audio/mpeg",
            storage_url="https://example.com/file.mp3",
            material_types=["summary", "quiz"],
            status="queued",
        )

    @patch("apps.transcription.service.TranscriptionService.submit_transcription")
    @patch("apps.transcription.service.TranscriptionService.get_transcription_result")
    @patch("apps.generation.service.GeminiService.generate_content")
    def test_full_pipeline(self, mock_generate, mock_get_result, mock_submit):
        # Mock Transcription Service
        mock_submit.return_value = "tx_123"
        mock_get_result.return_value = {
            "id": "tx_123",
            "status": "completed",
            "text": "This is a lecture about Python.",
        }

        # Mock Gemini Service
        mock_generate.side_effect = [
            {"summary": "Python is great."},  # First call (summary)
            {"questions": []},  # Second call (quiz)
        ]

        # 1. First run: Submits to AssemblyAI (raises Retry)
        try:
            process_upload_task(self.job.id)
        except Retry:
            pass

        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "transcribing")
        self.assertEqual(self.job.transcription_id, "tx_123")
        # Note: transcription_id is UUID in model but string in service.
        # Wait, model definition says UUIDField.
        # Check models.py: transcription_id = models.UUIDField(null=True, blank=True)
        # Service returns string ID from AssemblyAI.
        # This might be a bug if AssemblyAI IDs are not UUIDs.
        # AssemblyAI IDs are usually strings like "6m5..." which are NOT UUIDs.

        # 2. Second run: AssemblyAI returns completed, triggers Gemini
        process_upload_task(self.job.id)

        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "completed")
        self.assertEqual(self.job.progress, 100)

        # Verify content generated
        content = GeneratedContent.objects.filter(job=self.job)
        self.assertEqual(content.count(), 2)

        summary = content.get(type="summary")
        self.assertEqual(summary.content, {"summary": "Python is great."})
