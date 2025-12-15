from django.urls import path
from . import views

urlpatterns = [
    path("content/<uuid:job_id>/", views.get_job_content, name="get_job_content"),
]
