from django.db import models
from django.conf import settings
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

class AppUserManager(BaseUserManager):
	def create_user(self, email, username, password=None):
		if not email:
			raise ValueError('An email is required.')
		if not password:
			raise ValueError('A password is required.')
		
		email = self.normalize_email(email)
		user = self.model(email=email, username=username)
		user.set_password(password)
		user.save()

		Profile.objects.get_or_create(user=user)


		default_categories = [
            {"category_name": "Groceries", "type": TransactionType.EXPENSE},
			{"category_name": "Tranport", "type": TransactionType.EXPENSE},
			{"category_name": "Housing", "type": TransactionType.EXPENSE},
            {"category_name": "Salary", "type": TransactionType.INCOME},
            {"category_name": "Savings", "type": TransactionType.INCOME},
			{"category_name": "Scholarship", "type": TransactionType.INCOME},
        ]
		
		for category_data in default_categories:
			Category.objects.create(user=user, **category_data)

		default_accounts = [
			{ "account_name": "Cash Wallet", "account_type": AccountType.CASH, "bank_name": "", "account_number": "", "expiry_date": None, },
			{ "account_name": "Savings Account", "account_type": AccountType.CREDIT, "bank_name": "My Bank", "account_number": "", "expiry_date": None, },
		]

		for account_data in default_accounts:
			Account.objects.create(user=user, **account_data)

		return user
	

	def create_superuser(self, email, username, password=None):
		if not email:
			raise ValueError('An email is required.')
		if not password:
			raise ValueError('A password is required.')
		user = self.create_user(email, username, password)
		user.is_superuser = True
		user.is_staff = True
		user.save()
		return user

class AppUser(AbstractBaseUser, PermissionsMixin):
	user_id 	 = models.AutoField(primary_key=True)
	email 		 = models.EmailField(max_length=50, unique=True)
	username 	 = models.CharField(max_length=50, unique=True)

	is_active 	 = models.BooleanField(default=True)
	is_staff     = models.BooleanField(default=False) 
	is_superuser = models.BooleanField(default=False)

	USERNAME_FIELD 	= 'email'	
	REQUIRED_FIELDS = ['username']
	objects = AppUserManager()

	def __str__(self):
		return self.username

class Profile(models.Model):
	user 			= models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
	name 			= models.CharField(max_length=50, blank=True, null=True)
	last_name 		= models.CharField(max_length=50, blank=True, null=True)
	RFC 			= models.CharField(max_length=13, blank=True, null=True)
	bio 			= models.TextField(blank=True, null=True)
	phone_number	= models.CharField(max_length=20, blank=True, null=True)

	def __str__(self):
		return f"Profile of {self.user.username}"
	
class AccountType(models.TextChoices):
    CREDIT = 'CREDIT', 'Crédito'
    DEBIT  = 'DEBIT', 'Débito'
    CASH   = 'CASH', 'Efectivo'


class Account(models.Model):
	user 			= models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='accounts')
	account_type = models.CharField(
		max_length=10,
		choices=AccountType.choices,
		default=AccountType.CASH 
    )
	account_name 	= models.CharField(max_length=100)  # Alias de la cuenta
	bank_name 		= models.CharField(max_length=50, blank=True, null=True)
	account_number 	= models.CharField(max_length=20, blank=True, null=True)
	expiry_date 	= models.DateField(blank=True, null=True)
	def __str__(self):
		return f"{self.account_name} ({self.account_type.type_name})"

class TransactionType(models.TextChoices):
    INCOME  = 'INC', 'Ingreso'
    EXPENSE = 'EXP', 'Egreso'

class Category(models.Model):
	user 			= models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories')
	category_name 	= models.CharField(max_length=50)
	type 			= models.CharField(
        max_length=3,
        choices=TransactionType.choices,
        default=TransactionType.INCOME
    )

	def __str__(self):
		return self.category_name

class Transaction(models.Model):
    user     	= models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    category 	= models.ManyToManyField('Category', related_name='transactions')
    account  	= models.ForeignKey('Account', on_delete=models.SET_NULL, null=True, related_name='transactions')
    amount 	 	= models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    date 		= models.DateField()
    type 		= models.CharField(
        max_length=3,
        choices=TransactionType.choices,
        default=TransactionType.INCOME
    )

    def __str__(self):
        return f"{self.amount} - {self.category.name} ({self.account.account_name}) - {self.get_type_display()}"
	
