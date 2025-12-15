from django.db import models
from apps.ingestion.models import Job


class GeneratedContent(models.Model):
    """Stores generated content like summaries, notes, quizzes."""

    TYPE_CHOICES = [
        ("summary", "Summary"),
        ("notes", "Study Notes"),
        ("flashcards", "Flashcards"),
        ("quiz", "Quiz"),
    ]

    job = models.ForeignKey(
        Job, on_delete=models.CASCADE, related_name="generated_content"
    )
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    content = models.JSONField(help_text="The structured content generated (e.g. JSON)")

    # Metadata
    model_version = models.CharField(max_length=50, default="gemini-1.5-flash")
    token_usage = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "generated_content"
        indexes = [
            models.Index(fields=["job", "type"]),
        ]
        unique_together = ["job", "type"]

    def __str__(self):
        return f"{self.type} for Job {self.job_id}"
