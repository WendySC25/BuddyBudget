from django.contrib.auth import get_user_model, login, logout
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from .permissions import IsAdminOrOwner
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer, ProfileUpdateSerializer 
from .serializers import TransactionSerializer, CategorySerializer, AccountSerializer, DebtSerializer
from .validations import custom_validation, validate_email, validate_password
from .models import Transaction, Category, Account, AppUser, Debt
import random
from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponse
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode

def verify_email(request, uidb64, token):
    try:
        uid  = urlsafe_base64_decode(uidb64).decode()
        user = get_object_or_404(AppUser, pk=uid)
    except (TypeError, ValueError, OverflowError):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return redirect('http://127.0.0.1:3000/login') 
    else:
        return redirect('http://127.0.0.1:3000/')

#AdminAPI
class BaseModelMixin:
    model = None
    serializer_class = None

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.model.objects.all()
        return self.model.objects.filter(user=self.request.user)

    def get_object(self, pk):
        queryset = self.get_queryset()
        return get_object_or_404(queryset, pk=pk)

    def get_target_user(self, request):
        if request.user.is_staff:
            user_id = request.data.get('user_id')
            if not user_id:
                raise Response(
                    {"error": "Administrators must specify a user_id."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            target_user = get_user_model().objects.filter(pk=user_id).first()
            if not target_user:
                raise Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            return target_user
        return request.user

class UserList(APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        users = get_user_model().objects.all()
        serilizer = UserSerializer(users, many = True)
        return Response(serilizer.data, status=status.HTTP_201_CREATED)

class UserRegister(APIView):    
    permission_classes = (permissions.AllowAny,)
    def post(self, request):
        clean_data = custom_validation(request.data)
        serializer = UserRegisterSerializer(data=clean_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(clean_data)
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)

class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (JWTAuthentication,)
    ##
    def post(self, request):
        data = request.data
        assert validate_email(data)
        assert validate_password(data)
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.check_user(data)
            login(request, user)
            return Response(serializer.data, status=status.HTTP_200_OK)

class UserLogout(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)

class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data}, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({'user': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)
    
    def get(self, request):
        profile = request.user.profile
        serializer = ProfileUpdateSerializer(profile)
        return Response({'profile': serializer.data}, status=status.HTTP_200_OK)
    
    def put(self, request):
        profile = request.user.profile
        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({'profile': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      
class TransactionListCreateView(BaseModelMixin,  APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)
    model = Transaction
    serializer_class = TransactionSerializer

    def get(self, request):
        user_id = request.query_params.get('user_id')
        transaction_type = request.query_params.get('type', None)

        if user_id and request.user.is_staff:
            user = get_object_or_404(get_user_model(), pk=user_id)
            queryset = self.model.objects.filter(user=user)
        else:
            queryset = self.get_queryset()

        if transaction_type:
            queryset = queryset.filter(type=transaction_type)

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request):
        user = self.get_target_user(request)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
       
class TransactionDetailView(BaseModelMixin, APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)
    model = Transaction
    serializer_class = TransactionSerializer

    def get(self, request, pk):
        transaction = self.get_object(pk)
        serializer = self.serializer_class(transaction)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        transaction = self.get_object(pk)
        serializer = self.serializer_class(transaction, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        transaction = self.get_object(pk)
        transaction.delete()
        return Response({"message": "Transaction deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    
class CategoryListCreateView(BaseModelMixin, APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)
    model = Category
    serializer_class = CategorySerializer

    def get(self, request):
        user_id = request.query_params.get('user_id')
        transaction_type = request.query_params.get('type', None)

        if user_id and request.user.is_staff:
            user = get_object_or_404(get_user_model(), pk=user_id)
            queryset = self.model.objects.filter(user=user)
        else:
            queryset = self.get_queryset()

        if transaction_type:
            queryset = queryset.filter(type=transaction_type)

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request):
        user = self.get_target_user(request)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryDetailView(BaseModelMixin, APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)
    model = Category
    serializer_class = CategorySerializer

    def get(self, request, pk):
        category = self.get_object(pk)
        serializer = self.serializer_class(category)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        category = self.get_object(pk)
        serializer = self.serializer_class(category, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        category = self.get_object(pk)
        category.delete()
        return Response({"message": "Category deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class AccountListCreateView(BaseModelMixin,  APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)
    model = Account
    serializer_class = AccountSerializer

    def get(self, request):
        user_id = request.query_params.get('user_id')

        if user_id and request.user.is_staff:
            user = get_object_or_404(get_user_model(), pk=user_id)
            queryset = self.model.objects.filter(user=user)
        else:
            queryset = self.get_queryset()

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request):
        user = self.get_target_user(request)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AccountDetailView(BaseModelMixin, APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)
    model = Account
    serializer_class = AccountSerializer

    def get(self, request):
        user_id = request.query_params.get('user_id')

        if user_id and request.user.is_staff:
            user = get_object_or_404(get_user_model(), pk=user_id)
            queryset = self.model.objects.filter(user=user)
        else:
            queryset = self.get_queryset()

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def put(self, request, pk):
        account = self.get_object(pk)
        serializer = self.serializer_class(account, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        account = self.get_object(pk)
        account.delete()
        return Response({"message": "Account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class ExpenseChartDataView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        user = request.user

        expenses = Transaction.objects.filter(user=user, type="EXP")

        category_combinations = {}
        combination_colors = {}

        for transaction in expenses:
            categories = transaction.category.all()

            #Crear la combinación de categorías como una cadena ordenada
            category_names = sorted([cat.category_name for cat in categories])
            category_combination = " & ".join(category_names)

            # Sumar el monto de la transacción a la combinación de categorías
            if category_combination in category_combinations:
                category_combinations[category_combination] += transaction.amount
            else:
                category_combinations[category_combination] = transaction.amount

                if len(categories) == 1:
                    combination_colors[category_combination] = categories[0].color
                else:
                    combination_colors[category_combination] = "#{:06x}".format(random.randint(0, 0xFFFFFF))

        data = {
            "categories": list(category_combinations.keys()),
            "totals": list(category_combinations.values()),
            "colors": [combination_colors[cat] for cat in category_combinations.keys()],
        }

        return Response(data, status=status.HTTP_200_OK)

class DebtListCreateView(BaseModelMixin,  APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)
    model = Debt
    serializer_class = DebtSerializer

    def get(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = self.get_target_user(request)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DebtDetailView(BaseModelMixin, APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)
    model = Debt
    serializer_class = DebtSerializer

    def get(self, request, pk):
        debt = self.get_object(pk)
        serializer = self.serializer_class(debt)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        debt = self.get_object(pk)
        serializer = self.serializer_class(debt, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        debt = self.get_object(pk)
        debt.delete()
        return Response({"message": "Debt deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
