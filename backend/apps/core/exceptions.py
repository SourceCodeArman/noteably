"""Custom exception classes for Noteably application."""


class NoteablyException(Exception):
    """Base exception for all Noteably errors."""

    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


# Subscription & Usage Errors
class SubscriptionError(NoteablyException):
    """Base class for subscription-related errors."""

    pass


class QuotaExceededError(SubscriptionError):
    """User has exceeded their subscription quota."""

    status_code = 429
    retryable = False


class PaymentRequiredError(SubscriptionError):
    """Feature requires paid subscription."""

    status_code = 402
    retryable = False


# Transcription Errors
class TranscriptionError(NoteablyException):
    """Base class for transcription failures."""

    pass


class AssemblyAIError(TranscriptionError):
    """AssemblyAI API error."""

    retryable = True


class RateLimitError(TranscriptionError):
    """API rate limit exceeded."""

    retryable = True
    retry_after = 60


class InvalidFileError(TranscriptionError):
    """File format not supported or file is corrupted."""

    status_code = 400
    retryable = False


class TranscriptionTimeoutError(TranscriptionError):
    """Transcription took too long."""

    retryable = True


# Generation Errors
class GenerationError(NoteablyException):
    """Base class for content generation failures."""

    pass


class GeminiError(GenerationError):
    """Google Gemini API error."""

    retryable = True


class SafetyFilterError(GenerationError):
    """Content blocked by safety filter."""

    retryable = False


class MalformedOutputError(GenerationError):
    """LLM output couldn't be parsed."""

    retryable = True
    max_retries = 2


# Storage Errors
class StorageError(NoteablyException):
    """Base class for storage failures."""

    pass


class UploadError(StorageError):
    """Failed to upload file to storage."""

    retryable = True


class DownloadError(StorageError):
    """Failed to download file from storage."""

    retryable = True


# Database Errors
class DatabaseError(NoteablyException):
    """Base class for database errors."""

    pass


class RecordNotFoundError(DatabaseError):
    """Requested record doesn't exist."""

    status_code = 404
    retryable = False


class DuplicateRecordError(DatabaseError):
    """Record already exists."""

    status_code = 409
    retryable = False


# Authentication Errors
class AuthenticationError(NoteablyException):
    """Base class for authentication errors."""

    status_code = 401
    retryable = False


class InvalidTokenError(AuthenticationError):
    """JWT token is invalid or expired."""

    pass


class PermissionDeniedError(NoteablyException):
    """User doesn't have permission for this action."""

    status_code = 403
    retryable = False


class ThirdPartyServiceError(NoteablyException):
    """Base class for errors from external services (e.g. AssemblyAI, Gemini)."""

    status_code = 502
    retryable = True
