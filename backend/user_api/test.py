from django.urls import reverse
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class UserTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'email': 'testuser1@example.com',
            'username': 'testuser1',
            'password': 'TestPassword123!'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.user.is_active = True
        self.user.save()

    def test_user_registration(self):
        url = reverse('register')  
        data = {
            'email': 'newuser1@example.com',
            'username': 'newuser1',
            'password': 'NewPassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], data['email'])

    def test_user_registration_with_existing_email(self):
        url = reverse('register')
        data = {
            'email': self.user_data['email'], 
            'username': 'duplicateuser',
            'password': 'SomePassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def test_user_login(self):
        url = reverse('login')  
        data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_login_with_incorrect_password(self):
        url = reverse('login')
        data = {
            'email': self.user_data['email'],
            'password': 'WrongPassword!' 
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_logout(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('logout')  
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_profile_update(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('profile')
        data = {'name': 'Updated Name'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['profile']['name'], data['name'])

