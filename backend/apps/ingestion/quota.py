import logging
from apps.core.supabase_client import supabase_client
from apps.core.exceptions import QuotaExceededError

logger = logging.getLogger(__name__)


def check_user_quota(user_id: str, file_duration_minutes: float, file_size_mb: float):
    """
    Check if user can upload this file based on their subscription.

    Args:
        user_id: User UUID
        file_duration_minutes: Duration of file in minutes
        file_size_mb: File size in MB

    Raises:
        QuotaExceededError: If user exceeded monthly limits
    """
    try:
        result = supabase_client.query("user_subscriptions", eq={"user_id": user_id})
    except Exception as e:
        # If table doesn't exist yet, allow unlimited uploads (for testing)
        logger.warning(f"Could not check quota (table may not exist): {e}")
        logger.info(
            "Allowing upload without quota check - create user_subscriptions table in Supabase"
        )
        return

    if not result:
        subscription = {
            "monthly_upload_limit": 5,
            "monthly_minutes_limit": 30,
            "max_file_size_mb": 100,
            "uploads_this_month": 0,
            "minutes_used_this_month": 0,
        }
    else:
        subscription = result[0]

    if subscription["uploads_this_month"] >= subscription["monthly_upload_limit"]:
        raise QuotaExceededError(
            f"Monthly limit: {subscription['monthly_upload_limit']} uploads"
        )

    new_total = subscription["minutes_used_this_month"] + file_duration_minutes
    if new_total > subscription["monthly_minutes_limit"]:
        raise QuotaExceededError(
            f"Monthly limit: {subscription['monthly_minutes_limit']} minutes"
        )

    if file_size_mb > subscription["max_file_size_mb"]:
        raise QuotaExceededError(
            f"File too large. Maximum size: {subscription['max_file_size_mb']}MB",
            details={"max_size": subscription["max_file_size_mb"]},
        )


def increment_usage(user_id: str, duration_minutes: float):
    """
    Increment user's monthly usage after successful upload.

    Args:
        user_id: User UUID
        duration_minutes: Duration of uploaded file
    """
    result = supabase_client.query("user_subscriptions", eq={"user_id": user_id})

    if result:
        subscription = result[0]
        supabase_client.update(
            "user_subscriptions",
            subscription["id"],
            {
                "uploads_this_month": subscription["uploads_this_month"] + 1,
                "minutes_used_this_month": subscription["minutes_used_this_month"]
                + duration_minutes,
            },
        )
