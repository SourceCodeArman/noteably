"""Supabase client wrapper for database and auth operations."""

import os
import logging
from typing import Optional, Dict, Any
from supabase import create_client, Client

from apps.core.exceptions import DatabaseError, AuthenticationError
from apps.core.error_handler import retry_with_backoff

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Wrapper for Supabase client with error handling and retry logic."""

    _instance: Optional["SupabaseClient"] = None
    _client: Optional[Client] = None

    def __new__(cls):
        """Singleton pattern to reuse client."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize Supabase client (lazy)."""
        # Client will be initialized on first use
        pass

    @property
    def client(self) -> Client:
        """Get Supabase client instance (initializes on first access)."""
        if self._client is None:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

            if not supabase_url or not supabase_key:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment. "
                    "Copy .env.example to .env and fill in your Supabase credentials."
                )

            self._client = create_client(supabase_url, supabase_key)
            logger.info("Supabase client initialized")

        return self._client

    @retry_with_backoff(max_attempts=3)
    def get_user_by_id(self, user_id: str) -> Dict[str, Any]:
        """
        Get user by ID from Supabase Auth.

        Args:
            user_id: User UUID

        Returns:
            User data dictionary

        Raises:
            DatabaseError: If user not found or database error
        """
        try:
            response = self.client.auth.admin.get_user_by_id(user_id)
            if not response.user:
                raise DatabaseError(f"User {user_id} not found")
            return response.user.model_dump()
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {e}")
            raise DatabaseError(f"Failed to fetch user: {str(e)}")

    @retry_with_backoff(max_attempts=3)
    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verify JWT token and return user data.

        Args:
            token: JWT access token

        Returns:
            User data from token

        Raises:
            AuthenticationError: If token is invalid
        """
        try:
            response = self.client.auth.get_user(token)
            if not response.user:
                raise AuthenticationError("Invalid or expired token")
            return response.user.model_dump()
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            raise AuthenticationError(f"Token verification failed: {str(e)}")

    @retry_with_backoff(max_attempts=3)
    def query(self, table: str, **filters) -> list:
        """
        Query Supabase table with filters.

        Args:
            table: Table name
            **filters: Query filters (e.g., eq={'user_id': 'uuid'})

        Returns:
            List of records
        """
        try:
            query = self.client.table(table).select("*")

            # Apply filters
            for filter_type, filter_value in filters.items():
                if filter_type == "eq" and isinstance(filter_value, dict):
                    for key, value in filter_value.items():
                        query = query.eq(key, value)
                elif filter_type == "limit":
                    query = query.limit(filter_value)
                elif filter_type == "order":
                    query = query.order(filter_value)

            response = query.execute()
            return response.data
        except Exception as e:
            logger.error(f"Query failed on {table}: {e}")
            raise DatabaseError(f"Query failed: {str(e)}")

    @retry_with_backoff(max_attempts=3)
    def insert(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Insert record into Supabase table.

        Args:
            table: Table name
            data: Record data

        Returns:
            Inserted record
        """
        try:
            response = self.client.table(table).insert(data).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            logger.error(f"Insert failed on {table}: {e}")
            raise DatabaseError(f"Insert failed: {str(e)}")

    @retry_with_backoff(max_attempts=3)
    def update(
        self, table: str, record_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update record in Supabase table.

        Args:
            table: Table name
            record_id: Record UUID
            data: Updated data

        Returns:
            Updated record
        """
        try:
            response = (
                self.client.table(table).update(data).eq("id", record_id).execute()
            )
            return response.data[0] if response.data else {}
        except Exception as e:
            logger.error(f"Update failed on {table}: {e}")
            raise DatabaseError(f"Update failed: {str(e)}")

    @retry_with_backoff(max_attempts=3)
    def delete(self, table: str, record_id: str) -> bool:
        """
        Delete record from Supabase table.

        Args:
            table: Table name
            record_id: Record UUID

        Returns:
            True if successful
        """
        try:
            self.client.table(table).delete().eq("id", record_id).execute()
            return True
        except Exception as e:
            logger.error(f"Delete failed on {table}: {e}")
            raise DatabaseError(f"Delete failed: {str(e)}")


# Global instance
supabase_client = SupabaseClient()
