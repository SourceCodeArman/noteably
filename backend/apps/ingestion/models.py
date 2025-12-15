"""Models for job tracking and file management."""

import uuid
from django.db import models


class Job(models.Model):
    """Central job tracking for upload-to-materials pipeline."""

    STATUS_CHOICES = [
        ("queued", "Queued"),
        ("transcribing", "Transcribing"),
        ("generating", "Generating"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # User (references Supabase auth.users)
    user_id = models.UUIDField(db_index=True)

    # File information
    filename = models.CharField(max_length=255)
    file_size_bytes = models.BigIntegerField()
    file_type = models.CharField(max_length=50)
    storage_url = models.TextField()  # Cloudflare R2 URL

    # Material selection (what user requested)
    material_types = models.JSONField(
        default=list,
        help_text="Types of materials to generate: summary, notes, flashcards, quiz",
    )
    options = models.JSONField(
        default=dict,
        blank=True,
        help_text="Optional parameters like summary_length, flashcard_count, etc.",
    )

    # Processing status
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="queued", db_index=True
    )
    progress = models.IntegerField(default=0)  # 0-100
    current_step = models.CharField(max_length=100, blank=True)

    # Relations (set later in pipeline)
    transcription_id = models.CharField(max_length=100, null=True, blank=True)

    # Error tracking
    error_message = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "jobs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user_id", "-created_at"]),
            models.Index(fields=["status", "-created_at"]),
        ]

    def __str__(self):
        return f"Job {self.id} - {self.filename} ({self.status})"

    def estimate_processing_time(self) -> int:
        """
        Estimate processing time in seconds based on file size.

        Returns:
            Estimated seconds
        """
        # Rough estimate: 1 minute of audio = 30 seconds processing
        # You can refine this based on actual metrics
        size_mb = self.file_size_bytes / (1024 * 1024)
        estimated_duration_minutes = size_mb / 10  # Rough estimate
        return int(estimated_duration_minutes * 30)
