"""DRF serializers for Job model."""

from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    """Serializer for Job model."""

    class Meta:
        model = Job
        fields = [
            "id",
            "user_id",
            "filename",
            "file_size_bytes",
            "file_type",
            "storage_url",
            "material_types",
            "options",
            "status",
            "progress",
            "current_step",
            "error_message",
            "created_at",
            "started_at",
            "completed_at",
        ]
        read_only_fields = [
            "id",
            "storage_url",
            "status",
            "progress",
            "current_step",
            "error_message",
            "created_at",
            "started_at",
            "completed_at",
        ]


class ProcessUploadSerializer(serializers.Serializer):
    """Serializer for file upload request."""

    file = serializers.FileField()
    material_types = serializers.JSONField()  # Accepts JSON string or list
    options = serializers.JSONField(required=False, default=dict)

    def validate_material_types(self, value):
        """Ensure at least one material type selected."""
        if not value:
            raise serializers.ValidationError("Must select at least one material type")
        return value
