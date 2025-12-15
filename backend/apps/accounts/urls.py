"""URL configuration for accounts app."""

from django.urls import path
from . import views

urlpatterns = [
    path("me", views.get_user_profile, name="user_profile"),
    path("subscription", views.get_subscription_status, name="subscription_status"),
]
