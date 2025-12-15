import uuid
import logging
import boto3
from typing import Optional
from django.conf import settings
from apps.core.error_handler import retry_with_backoff
from apps.core.exceptions import UploadError

logger = logging.getLogger(__name__)


@retry_with_backoff(max_attempts=3)
def upload_to_r2(file, filename: str, content_type: Optional[str] = None) -> str:
    key = f"{uuid.uuid4()}/{filename}"
    s3 = boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT,
        aws_access_key_id=settings.R2_ACCESS_KEY,
        aws_secret_access_key=settings.R2_SECRET_KEY,
    )

    s3.upload_fileobj(
        file,
        settings.R2_BUCKET,
        key,
        ExtraArgs={"ContentType": content_type or "application/octet-stream"},
    )

    return f"{settings.R2_PUBLIC_URL}/{key}"


def delete_from_r2(storage_url: str) -> bool:
    key = storage_url.split("/")[-1]
    s3 = boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT,
        aws_access_key_id=settings.R2_ACCESS_KEY,
        aws_secret_access_key=settings.R2_SECRET_KEY,
    )
    s3.delete_object(Bucket=settings.R2_BUCKET, Key=key)
    return True
