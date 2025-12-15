"""
Cloudflare R2 storage client.

TODO: Implement upload_to_r2 function using boto3.

Example boto3 usage:
    import boto3
    from django.conf import settings
    
    s3_client = boto3.client(
        's3',
        endpoint_url=settings.R2_ENDPOINT,
        aws_access_key_id=settings.R2_ACCESS_KEY,
        aws_secret_access_key=settings.R2_SECRET_KEY
    )
    
    s3_client.upload_fileobj(
        file,
        settings.R2_BUCKET,
        key,
        ExtraArgs={'ContentType': content_type}
    )
"""
import uuid
import logging
from typing import Optional
from django.conf import settings
from apps.core.error_handler import retry_with_backoff
from apps.core.exceptions import UploadError

logger = logging.getLogger(__name__)


@retry_with_backoff(max_attempts=3)
def upload_to_r2(file, filename: str, content_type: Optional[str] = None) -> str:
    """
    Upload file to Cloudflare R2.
    
    Args:
        file: Django UploadedFile object or file-like object
        filename: Original filename (will be prefixed with UUID)
        content_type: MIME type (e.g., 'audio/mp3', 'video/mp4')
    
    Returns:
        Public URL of uploaded file
    
    Raises:
        UploadError: If upload fails
    
    TODO:
    1. Generate unique key: f"{uuid4()}/{filename}"
    2. Initialize boto3 S3 client with R2 credentials
    3. Upload file using upload_fileobj
    4. Return public URL: f"{settings.R2_PUBLIC_URL}/{key}"
    
    Hints:
    - Use settings.R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET
    - Set ContentType in ExtraArgs for proper file serving
    - Boto3 docs: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/client/upload_fileobj.html
    """
    # TODO: Implement this function
    raise NotImplementedError("upload_to_r2 not yet implemented")


def delete_from_r2(storage_url: str) -> bool:
    """
    Delete file from R2 (for cleanup).
    
    Args:
        storage_url: Full URL of file
    
    Returns:
        True if successful
    
    TODO: Optional - implement for file cleanup
    """
    # TODO: Implement if needed
    pass
