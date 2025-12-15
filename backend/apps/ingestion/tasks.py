from celery import shared_task
from celery.exceptions import Retry
from django.utils.timezone import now as from_datetime
from apps.ingestion.models import Job
from apps.transcription.models import Transcription
from apps.transcription.service import TranscriptionService
from apps.generation.models import GeneratedContent
from apps.generation.service import GeminiService
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=100)
def process_upload_task(self, job_id):
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        logger.error(f"Job {job_id} not found")
        return

    if job.status in ["completed", "failed"]:
        return

    try:
        if not job.transcription_id:
            logger.info(f"Submitting job {job_id} to AssemblyAI")
            # Submit to AssemblyAI
            tx_id = TranscriptionService.submit_transcription(job.storage_url)

            job.transcription_id = tx_id
            job.status = "transcribing"
            job.save()

            # Use retry for polling delay
            raise self.retry(countdown=10)

        else:
            # Check status
            logger.info(
                f"Checking status for job {job_id}, tx_id {job.transcription_id}"
            )
            result = TranscriptionService.get_transcription_result(
                str(job.transcription_id)
            )
            status = result.get("status")

            if status == "completed":
                logger.info(f"Transcription completed for job {job_id}")

                # Check if transcription record already exists to avoid duplicates on retry
                if not hasattr(job, "transcription"):
                    Transcription.objects.create(
                        job=job,
                        external_id=result["id"],
                        text=result.get("text", ""),
                        raw_response=result,
                    )

                # Start Generation Phase
                job.status = "generating"
                job.progress = 50
                job.save()

                # Generate formatted text from transcript
                transcript_text = result.get("text", "")

                for material_type in job.material_types:
                    try:
                        logger.info(f"Generating {material_type} for job {job_id}")
                        content = GeminiService.generate_content(
                            transcript_text, material_type
                        )

                        GeneratedContent.objects.create(
                            job=job, type=material_type, content=content
                        )
                    except Exception as e:
                        logger.error(
                            f"Failed to generate {material_type} for job {job.id}: {e}"
                        )
                        # We continue generating other types even if one fails

                job.status = "completed"
                job.progress = 100
                job.completed_at = from_datetime()
                job.save()

            elif status == "error":
                error_msg = result.get("error")
                logger.error(f"Transcription failed for job {job_id}: {error_msg}")
                job.status = "failed"
                job.error_message = str(error_msg)
                job.save()

            else:
                # queued or processing
                job.progress = 25
                job.save()
                raise self.retry(countdown=10)

    except Retry:
        raise
    except Exception as e:
        logger.exception(f"Error processing job {job_id}")
        # Only mark failed if we haven't exceeded retries handled by Celery for other exceptions
        # But since we use bind=True and managing our own polling loop, we should probably fail here
        # if it's not a polling retry.
        job.status = "failed"
        job.error_message = f"Internal error: {str(e)}"
        job.save()
