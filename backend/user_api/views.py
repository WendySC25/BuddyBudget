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
from .models import Transaction, Category, Account, Debt
import random
from datetime import datetime
from django.db.models import Q

#REPORT LAB thinguies
from django.http import FileResponse
from io import BytesIO
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Image
import matplotlib.pyplot as plt
from matplotlib.colors import to_hex


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

class PDFgeneration(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)

    def header(self, canvas, doc):
        page_width, page_height = letter
        canvas.saveState()

        logo_path = "/app/assets/BuddyBudget_black.png"
        canvas.drawImage(logo_path, x=35, y=735, width=92, height=48) 
        canvas.setFont("Times-Roman", 16)
        text = "Transactions Report"
        text_width = canvas.stringWidth(text, "Times-Roman", 16)
        text_x = page_width - text_width - 30 
        text_y = page_height - 50  
        canvas.drawString(text_x, text_y, text)
        canvas.setLineWidth(0.5)
        line_y = page_height - 60
        canvas.setLineWidth(0.5)
        canvas.line(30, line_y, page_width - 30, line_y)
        canvas.restoreState()
    
    def create_graph(self):
        # Create a simple bar graph for example
        transactions = Transaction.objects.all()
        categories = [", ".join(cat.category_name for cat in tx.category.all()) for tx in transactions]
        amounts = [tx.amount for tx in transactions]

        plt.figure(figsize=(8, 4))
        plt.bar(categories, amounts, color='skyblue')
        plt.xlabel("Categories")
        plt.ylabel("Amounts")
        plt.title("Transaction Amounts by Category")
        plt.tight_layout()

        # Save graph to BytesIO
        graph_buffer = BytesIO()
        plt.savefig(graph_buffer, format='png')
        graph_buffer.seek(0)
        plt.close()

        return graph_buffer

    def get(self, request):

        buf = io.BytesIO()
        # doc style
        doc = SimpleDocTemplate(buf, pagesize=letter)

        today = datetime.today()
        transactions = Transaction.objects.filter(
            Q(date__month=today.month) & Q(date__year=today.year)
        )

        data = [["Category", "Account", "Amount", "Description", "Date", "Type"]]

        for transaction in transactions:
            categories = ", ".join([cat.category_name for cat in transaction.category.all()])
            data.append([
                categories,
                transaction.account,
                transaction.amount,
                transaction.description,
                transaction.date.strftime("%d-%m-%Y"),
                transaction.type,
            ])

        #create table
        table = Table(data)

        #table style
        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue), 
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Times-Roman'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ])
        table.setStyle(style)

        graph_buffer = self.create_graph()
        graph_image = Image(graph_buffer, width=400, height=300)
        elements = [
            table,
            graph_image
        ]

        # adding table and graphs to pdf
        doc.build(elements, onFirstPage=self.header, onLaterPages=self.header)

        #return FileResponse
        buf.seek(0)
        response = FileResponse(buf, as_attachment=True, filename="MyTransactions.pdf")
        response['Content-Type'] = 'application/pdf'
        return response

    