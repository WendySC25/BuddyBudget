from django.contrib.auth import get_user_model, login, logout
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer, ProfileUpdateSerializer
from .serializers import TransactionSerializer
from rest_framework import permissions, status
from .validations import custom_validation, validate_email, validate_password
from .models import TransactionType, Transaction


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
      
    
class TransactionListCreateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get(self, request):
        transaction_type = request.query_params.get('type', None)
        only_categories  = request.query_params.get('only_categories', 'false').lower() == 'true'
        category_id = request.query_params.get('category', None)

        if only_categories:
            if transaction_type and transaction_type in dict(CategoryType.choices):
                categories = Category.objects.filter(user=request.user, type=transaction_type)
            else:
                categories = Category.objects.filter(user=request.user)
            serializer = CategorySerializer(categories, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if transaction_type:
            transactions = Transaction.objects.filter(user=request.user, type=transaction_type)
        else:
            transactions = Transaction.objects.filter(user=request.user)
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        is_category = request.data.get('is_category', False)

        if is_category:
            serializer = CategorySerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                serializer.save(user=request.user) 
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransactionDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def get_object(self, pk):
        try:
            return Transaction.objects.get(pk=pk, user=self.request.user)
        except Transaction.DoesNotExist:
            raise Response(status=status.HTTP_404_NOT_FOUND)

    def get(self, request, pk):
        transaction = self.get_object(pk)
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)

    def put(self, request, pk):
        transaction = self.get_object(pk)
        serializer = TransactionSerializer(transaction, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        transaction = self.get_object(pk)
        transaction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
