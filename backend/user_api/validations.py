from rest_framework import serializers
from django.contrib.auth import get_user_model

UserModel = get_user_model()

def custom_validation(data):
    email = data['email'].strip()
    username = data['username'].strip()
    password = data['password'].strip()
    ##
    if not email or UserModel.objects.filter(email=email).exists():
        raise serializers.ValidationError({'detail': 'This email is already in use. Please choose another.'})
    ##
    if not password or len(password) < 4:
        raise serializers.ValidationError({'detail': 'The password must be at least 4 characters long. Please choose a stronger password.'})
    ##
    if not username:
        raise serializers.ValidationError({'detail': 'A username is required. Please choose a valid username.'})
    return data


def validate_email(data):
    email = data['email'].strip()
    if not email:
        raise serializers.ValidationError({'detail': 'An email is required. Please provide a valid email.'})
    return True

def validate_username(data):
    username = data['username'].strip()
    if not username:
        raise serializers.ValidationError({'detail': 'A username is required. Please provide a valid username.'})
    return True

def validate_password(data):
    password = data['password'].strip()
    if not password:
        raise serializers.ValidationError({'detail': 'A password is required. Please provide a valid password.'})
    return True
