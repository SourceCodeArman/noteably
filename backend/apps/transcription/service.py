import requests
from django.conf import settings
from apps.core.exceptions import ThirdPartyServiceError


class TranscriptionService:
    BASE_URL = "https://api.assemblyai.com/v2"

    @classmethod
    def _get_headers(cls):
        if not settings.ASSEMBLYAI_API_KEY:
            raise ThirdPartyServiceError("AssemblyAI API key not configured")
        return {
            "authorization": settings.ASSEMBLYAI_API_KEY,
            "content-type": "application/json",
        }

    @classmethod
    def submit_transcription(cls, audio_url: str) -> str:
        """
        Submits audio URL to AssemblyAI for transcription.
        Returns the transcription ID.
        """
        endpoint = f"{cls.BASE_URL}/transcript"
        json_data = {
            "audio_url": audio_url,
            "speaker_labels": True,
            "auto_chapters": True,
            "entity_detection": True,
            "sentiment_analysis": False,
        }

        try:
            response = requests.post(
                endpoint, json=json_data, headers=cls._get_headers()
            )
            response.raise_for_status()
            data = response.json()
            return data["id"]
        except requests.RequestException as e:
            raise ThirdPartyServiceError(f"Failed to submit transcription: {str(e)}")

    @classmethod
    def get_transcription_result(cls, transcript_id: str) -> dict:
        """
        Gets the status and result of a transcription.
        """
        endpoint = f"{cls.BASE_URL}/transcript/{transcript_id}"

        try:
            response = requests.get(endpoint, headers=cls._get_headers())
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise ThirdPartyServiceError(
                f"Failed to get transcription result: {str(e)}"
            )
