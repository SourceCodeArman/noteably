from django.db import models
from apps.ingestion.models import Job


class Transcription(models.Model):
    job = models.OneToOneField(
        Job, on_delete=models.CASCADE, related_name="transcription"
    )
    external_id = models.CharField(max_length=100, db_index=True)
    text = models.TextField()
    raw_response = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "transcriptions"
