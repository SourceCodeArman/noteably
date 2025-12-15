"""Custom exception handler for DRF to convert Noteably exceptions to HTTP responses."""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

from .exceptions import NoteablyException


def custom_exception_handler(exc, context):
    """
    Custom exception handler that converts NoteablyException to proper HTTP responses.
    
    Args:
        exc: The exception being handled
        context: Exception context (view, args, kwargs, request)
        
    Returns:
        Response object with error details
    """
    # Call DRF's default handler first
    response = exception_handler(exc, context)
    
    # Handle NoteablyException types
    if isinstance(exc, NoteablyException):
        status_code = getattr(exc.__class__, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(
            {
                'error': exc.message,
                'details': exc.details,
                'type': exc.__class__.__name__
            },
            status=status_code
        )
    
    return response
