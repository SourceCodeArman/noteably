"""URL configuration for ingestion app."""
from django.urls import path
from . import views

urlpatterns = [
    path('process', views.process_upload, name='process_upload'),
]
