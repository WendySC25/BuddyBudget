from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from .models import Profile
from .models import AccountType, Account, Category, Transaction, TransactionType

UserModel = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserModel
		fields = ['email', 'username', 'password']	
	def create(self, clean_data):
		user_obj = UserModel.objects.create_user(email=clean_data['email'],  username=clean_data['username'], password=clean_data['password'])
		user_obj.save()
		return user_obj

class UserLoginSerializer(serializers.Serializer):
	email = serializers.EmailField()
	password = serializers.CharField()
	
	def check_user(self, clean_data):
		user = authenticate(username=clean_data['email'], password=clean_data['password'])
		if not user:
			raise serializers.ValidationError({'detail': 'User not found or wrong password'})
		return user

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserModel
		fields = ('email', 'username')

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['name', 'last_name', 'RFC', 'bio', 'phone_number']

class AccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountType
        fields = ['id', 'type_name', 'description']


class AccountSerializer(serializers.ModelSerializer):
    account_type = AccountTypeSerializer(read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'user', 'account_type', 'account_name', 'bank_name', 'account_number', 'expiry_date']
        read_only_fields = ['user']  


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'user', 'category_name', 'type']
        read_only_fields = ['user']


class TransactionSerializer(serializers.ModelSerializer):
    category = CategorySerializer(many=True, read_only=True)
    account = AccountSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'user', 'category', 'account', 'amount', 'description', 'date', 'type']
        read_only_fields = ['user']