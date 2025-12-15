import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.permissions import IsAuthenticated
from .serializers import ProcessUploadSerializer
from .models import Job
from .validators import validate_file_type, validate_file_size, get_file_duration
from .quota import check_user_quota
from .r2_storage import upload_to_r2
from .tasks import process_upload_task

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_upload(request):
    serializer = ProcessUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    file = serializer.validated_data["file"]
    material_types = serializer.validated_data["material_types"]
    options = serializer.validated_data.get("options", {})

    # Validate file
    validate_file_type(file)
    validate_file_size(file, 100)  # TODO: Get from user subscription

    # Get duration and check quota
    duration = get_file_duration(file)
    check_user_quota(request.user_id, duration, file.size / (1024 * 1024))

    # Upload to R2
    storage_url = upload_to_r2(file, file.name, file.content_type)

    # Create job
    job = Job.objects.create(
        user_id=request.user_id,
        filename=file.name,
        file_size_bytes=file.size,
        file_type=file.content_type,
        storage_url=storage_url,
        material_types=material_types,
        options=options,
        status="queued",
    )

    # Trigger Celery task
    process_upload_task.delay(str(job.id))

    return Response(
        {
            "job_id": str(job.id),
            "status": job.status,
            "estimated_time": job.estimate_processing_time(),
        },
        status=status.HTTP_201_CREATED,
    )
