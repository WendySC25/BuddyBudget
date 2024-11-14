from django.urls import reverse
from decimal import Decimal
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Income, Expense, Account, Category, AccountType 

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


class IncomeExpenseTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='testuser@example.com', username='testuser', password='password123')
        self.account_type = AccountType.objects.create(type_name='Efectivo')
        self.account = Account.objects.create(user=self.user, account_type=self.account_type, account_name='Wallet')
        self.category = Category.objects.create(user=self.user, category_name='Salary')
        
        self.income_data = {
            'category': self.category.id,
            'account': self.account.id,
            'amount': 1000.00,
            'description': 'Monthly salary',
            'date': '2024-11-01'
        }
        
        self.expense_data = {
            'category': self.category.id,
            'account': self.account.id,
            'amount': 100.00,
            'description': 'Grocery shopping',
            'date': '2024-11-02'
        }
        
        self.authenticate()

    def authenticate(self):
        response = self.client.post(reverse('token_obtain_pair'), {
            'email': 'testuser@example.com',
            'password': 'password123'
        })
        if 'access' in response.data:
            token = response.data['access']
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')


    def test_create_income(self):
        url = reverse('income-list-create')
        response = self.client.post(url, self.income_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['amount']), Decimal(str(self.income_data['amount'])))

    def test_get_all_incomes(self):
        Income.objects.create(
            user=self.user,
            category=self.category, 
            account=self.account,    
            amount=self.income_data['amount'],
            description=self.income_data['description'],
            date=self.income_data['date']
        )
        url = reverse('income-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) 

    def test_update_income(self):
        income =  Income.objects.create(
            user=self.user,
            category=self.category, 
            account=self.account,    
            amount=self.income_data['amount'],
            description=self.income_data['description'],
            date=self.income_data['date']
        )
        url = reverse('income-detail', kwargs={'pk': income.id})
        updated_data = {'amount': 1200.00, 'description': 'Updated salary'}
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(response.data['amount']), Decimal(str(updated_data['amount'])))
        self.assertEqual(response.data['description'], updated_data['description'])

    def test_delete_income(self):
        income = Income.objects.create(
            user=self.user,
            category=self.category, 
            account=self.account,    
            amount=self.income_data['amount'],
            description=self.income_data['description'],
            date=self.income_data['date']
        )
        url = reverse('income-detail', kwargs={'pk': income.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Income.objects.filter(id=income.id).exists())

    def test_create_expense(self):
        url = reverse('expense-list-create')
        response = self.client.post(url, self.expense_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['amount']), Decimal(str(self.expense_data['amount'])))

    def test_get_all_expenses(self):
        # Create an expense first
        Expense.objects.create(
            user=self.user,
            category=self.category, 
            account=self.account,    
            amount=self.income_data['amount'],
            description=self.income_data['description'],
            date=self.income_data['date']
        )
        url = reverse('expense-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_update_expense(self):
        expense = Expense.objects.create(
            user=self.user,
            category=self.category, 
            account=self.account,    
            amount=self.income_data['amount'],
            description=self.income_data['description'],
            date=self.income_data['date']
        )
        url = reverse('expense-detail', kwargs={'pk': expense.id})
        updated_data = {'amount': 150.00, 'description': 'Updated grocery expense'}
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(response.data['amount']), Decimal(str(updated_data['amount'])))
        self.assertEqual(response.data['description'], updated_data['description'])

    def test_delete_expense(self):
        expense = Expense.objects.create(
            user=self.user,
            category=self.category, 
            account=self.account,    
            amount=self.income_data['amount'],
            description=self.income_data['description'],
            date=self.income_data['date']
        )
        url = reverse('expense-detail', kwargs={'pk': expense.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Expense.objects.filter(id=expense.id).exists())    
