"""
Authentication views for Supabase integration.

Note: Actual authentication is handled by Supabase Auth on the frontend.
These endpoints are for checking auth status and user info.
"""

import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from apps.core.supabase_client import supabase_client
from .permissions import IsAuthenticated

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get current user's profile information.

    Returns:
        User data from Supabase auth
    """
    return Response({"user": request.user, "user_id": request.user_id})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_subscription_status(request):
    """
    Get user's subscription tier and usage stats.

    Returns:
        Subscription details including tier, limits, and current usage
    """
    result = supabase_client.query(
        "user_subscriptions", eq={"user_id": request.user_id}
    )

    if not result:
        # Return free tier defaults if no subscription found
        return Response(
            {
                "tier": "free",
                "monthly_upload_limit": 5,
                "monthly_minutes_limit": 30,
                "max_file_size_mb": 100,
                "uploads_this_month": 0,
                "minutes_used_this_month": 0,
                "uploads_remaining": 5,
                "minutes_remaining": 30,
            }
        )

    subscription = result[0]
    return Response(
        {
            **subscription,
            "uploads_remaining": subscription["monthly_upload_limit"]
            - subscription["uploads_this_month"],
            "minutes_remaining": subscription["monthly_minutes_limit"]
            - subscription["minutes_used_this_month"],
        }
    )


@api_view(["GET"])
def health_check(request):
    """Health check endpoint (no auth required)."""
    return Response({"status": "healthy", "service": "noteably-api"})
