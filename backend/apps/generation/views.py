from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from apps.accounts.permissions import IsAuthenticated
from .models import GeneratedContent
from apps.ingestion.models import Job


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_job_content(request, job_id):
    """
    Retrieve all generated content for a specific job.
    """
    try:
        # Verify job exists and belongs to user
        job = Job.objects.get(id=job_id, user_id=request.user_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    # Get content
    contents = GeneratedContent.objects.filter(job=job)

    data = {}
    for item in contents:
        data[item.type] = item.content

    return Response({"job_id": job_id, "status": job.status, "content": data})
