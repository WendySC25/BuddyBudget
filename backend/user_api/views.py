from django.contrib.auth import get_user_model, login, logout
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from .permissions import IsAdminOrOwner
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer, ProfileUpdateSerializer 
from .serializers import TransactionSerializer, CategorySerializer, AccountSerializer, DebtSerializer, ConfigurationSerializer
from .validations import custom_validation, validate_email, validate_password
from .models import Transaction, Category, Account, AppUser, Debt, Configuration, SendTimeType
import random
from datetime import datetime, timedelta
from django.http import FileResponse
from django.db.models import Q
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Image, PageBreak, Paragraph
import matplotlib.pyplot as plt
from collections import defaultdict
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponse
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from matplotlib.colors import to_hex, to_rgb
from django.core.mail import EmailMessage

from rest_framework.exceptions import ValidationError, NotFound
from io import BytesIO

def verify_email(request, uidb64, token):
    try:
        uid  = urlsafe_base64_decode(uidb64).decode()
        user = get_object_or_404(AppUser, pk=uid)
    except (TypeError, ValueError, OverflowError):
        user = None

    if user is not None and user.is_active != False:
        return redirect('http://localhost:3000/home')
    elif user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return redirect('http://localhost:3000/email-verified')
    else:
        return redirect('http://localhost:3000/email-unverified')

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
                raise ValidationError({"error": "Administrators must specify a user_id."})
            target_user = get_user_model().objects.filter(pk=user_id).first()
            if not target_user:
                raise NotFound({"error": "User not found."})
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

            category_names = sorted([cat.category_name for cat in categories])
            category_combination = " & ".join(category_names)

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

class ConfigurationView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (JWTAuthentication,)
    
    def get(self, request):
        config = request.user.configuration
        serializer = ConfigurationSerializer(config)
        return Response({'configuration': serializer.data}, status=status.HTTP_200_OK)
    
    def put(self, request):
        config = request.user.configuration
        serializer = ConfigurationSerializer(config, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            config.save_task()
            return Response({'configuration': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    
    def create_graphL(self, start_date, end_date, user):
        transactions = Transaction.objects.filter(
            user=user,  
            date__range=(start_date, end_date)
        )

        data = defaultdict(lambda: {'income': 0, 'expense': 0})

        for transaction in transactions:
            date = transaction.date.strftime('%d-%m-%Y') 
            if transaction.type == 'INC': 
                data[date]['income'] += float(transaction.amount)
            elif transaction.type == 'EXP': 
                data[date]['expense'] += float(transaction.amount)

        sorted_data = sorted(data.items(), key=lambda x: x[0])
        dates = [item[0] for item in sorted_data]
        incomes = [item[1]['income'] for item in sorted_data]
        expenses = [item[1]['expense'] for item in sorted_data]

        plt.figure(figsize=(10, 6))
        plt.plot(dates, incomes, label='Income', marker='o', linestyle='-', linewidth=2)
        plt.plot(dates, expenses, label='Expense', marker='o', linestyle='-', linewidth=2)
        plt.title('Incomes and Expenses')
        plt.legend()
        plt.grid(True)
        plt.xticks(rotation=45)
        plt.tight_layout()

        graph_buffer = BytesIO()
        plt.savefig(graph_buffer, format='png')
        graph_buffer.seek(0)
        plt.close()

        return graph_buffer
 
    def hex_to_rgb(self,hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))

    def rgb_to_hex(self,r, g, b):
        return f'#{r:02x}{g:02x}{b:02x}'

    def blend_colors(self,colors):
        total_colors = len(colors)
        blended_rgb = [0, 0, 0]

        for color in colors:
            rgb = self.hex_to_rgb(color)
            blended_rgb[0] += rgb[0] / total_colors
            blended_rgb[1] += rgb[1] / total_colors
            blended_rgb[2] += rgb[2] / total_colors

        return self.rgb_to_hex(
            int(round(blended_rgb[0])),
            int(round(blended_rgb[1])),
            int(round(blended_rgb[2]))
        )

    def create_graphPI(self, start_date, end_date,user):
        category_total = defaultdict(float)
        category_colors = {}

        #fetching only income categories
        categories = Category.objects.filter(type='INC')

        for category in categories:
        # Sum amounts per category
            transactions = Transaction.objects.filter(
                user=user,
                date__range=(start_date, end_date),
                category=category
            )
            for tx in transactions:
                if len(tx.category.all()) > 1: #multiple categories
                    combined_category_name = ' & '.join([cat.category_name for cat in tx.category.all()])
                    combined_colors = [cat.color for cat in tx.category.all()]
                    blended_color = self.blend_colors(combined_colors)

                    category_total[combined_category_name] += float(tx.amount)
                    category_colors[combined_category_name] = blended_color
                else:
                    #one category
                    single_category_name = category.category_name
                    category_color = category.color

                    category_total[single_category_name] += float(tx.amount)
                    if single_category_name not in category_colors:
                        category_colors[single_category_name] = category_color

        labels = list(category_total.keys())
        sizes = list(category_total.values())
        colors = [category_colors[label] for label in labels]  #using colors defined by user

        plt.figure(figsize=(8, 8))
        plt.pie(
            sizes,
            colors=colors,
            autopct='%1.1f%%',
            startangle=90,
            wedgeprops={'edgecolor': 'black', 'linewidth': 1}
        )

        plt.title("Incomes by Category", fontsize=16)
        plt.legend(labels, loc="lower left")

        graph_buffer = BytesIO()
        plt.savefig(graph_buffer, format='png')
        graph_buffer.seek(0)
        plt.close()

        return graph_buffer
    
    def create_graphPE(self, start_date, end_date,user):
        category_total = defaultdict(float)
        category_colors = {}

        #fetching only expense categories
        categories = Category.objects.filter(type='EXP')

        for category in categories:
        # Sum amounts per category
            transactions = Transaction.objects.filter(
                user=user,
                date__range=(start_date, end_date),
                category=category
            )
            for tx in transactions:
                if len(tx.category.all()) > 1: #multiple categories
                    combined_category_name = ' & '.join([cat.category_name for cat in tx.category.all()])
                    combined_colors = [cat.color for cat in tx.category.all()]
                    blended_color = self.blend_colors(combined_colors)

                    category_total[combined_category_name] += float(tx.amount)
                    category_colors[combined_category_name] = blended_color
                else:
                    #one category
                    single_category_name = category.category_name
                    category_color = category.color

                    category_total[single_category_name] += float(tx.amount)
                    if single_category_name not in category_colors:
                        category_colors[single_category_name] = category_color

        labels = list(category_total.keys())
        sizes = list(category_total.values())
        colors = [category_colors[label] for label in labels]  #using colors defined by user

        plt.figure(figsize=(8, 8))
        plt.pie(
            sizes,
            colors=colors,
            autopct='%1.1f%%',
            startangle=90,
            wedgeprops={'edgecolor': 'black', 'linewidth': 1}
        )

        plt.title("Expenses by Category", fontsize=16)
        plt.legend(labels, loc="lower left")

        graph_buffer = BytesIO()
        plt.savefig(graph_buffer, format='png')
        graph_buffer.seek(0)
        plt.close()

        return graph_buffer
    
    def calculate_balance(self, incomes, expenses):
        total_incomes = sum(float(income.amount) for income in incomes)
        total_expenses = sum(float(expense.amount) for expense in expenses)
        return total_incomes - total_expenses

    def get(self, request):

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter)
        start_date_param = request.query_params.get('start_date')
        end_date_param = request.query_params.get('end_date')

        if start_date_param and end_date_param:
            try:
                start_date = datetime.strptime(start_date_param, "%Y-%m-%d").date()
                end_date = datetime.strptime(end_date_param, "%Y-%m-%d").date()
                if start_date > end_date:
                    return Response(
                        {"error": "start_date must be earlier than or equal to end_date."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                typeReport = "custom"
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            user_config = Configuration.objects.filter(user=request.user).first()
            #Cases for filtering
            if user_config and user_config.send_time == SendTimeType.MONTHLY:#assuming method is called every first of the month
                end_date = (datetime.today().replace(day=1) - timedelta(days=1)).date()#last day of previus month
                start_date = end_date.replace(day=1)
                typeReport = "monthly"
            elif user_config and user_config.send_time == SendTimeType.WEEKLY:
                end_date = datetime.today().date() - timedelta(days=1)#the day before the method is called
                start_date = end_date - timedelta(weeks=1)
                typeReport = "weekly"
            elif user_config and user_config.send_time == SendTimeType.FORTNIGHT:
                end_date = datetime.today().date() - timedelta(days=1)
                start_date = end_date - timedelta(weeks=2)
                typeReport = "fortnightly"
            elif user_config and user_config.send_time == SendTimeType.DAILY:
                end_date = datetime.today().date() - timedelta(days=1)
                start_date = end_date
                typeReport = "daily"
            else:
                end_date = datetime.today().date()
                start_date = datetime.today() - timedelta(days=30).date()
                typeReport = "monthly"
        
        user_config = Configuration.objects.filter(user=request.user).first()

        transactions = Transaction.objects.filter(
            user=request.user,  
            date__range=(start_date, end_date)
        )

        incomes = transactions.filter(type='INC')
        expenses = transactions.filter(type='EXP')

        balance = self.calculate_balance(incomes,expenses)

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            name="TitleStyle",
            parent=styles["Title"],
            fontSize=18,
            alignment=1, 
            spaceAfter=20
        )
        title_text = f"Hello {request.user.username}, here is your {typeReport} report from {start_date} to {end_date}!"
        title = Paragraph(title_text, title_style)

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

        data.append([f"Balance: {balance: .2f}"])
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
  
            ('SPAN', (0, -1), (-1, -1)),
            ('ALIGN', (0, -1), (-1, -1), 'RIGHT'),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.black),
            ('FONTNAME', (0, -1), (-1, -1), 'Times-Bold'),
        ])
        table.setStyle(style)

        elements = [title,table]
        elements.append(PageBreak())
        if user_config.add_graph:
            graph_buffer = self.create_graphL(start_date, end_date, request.user)
            graph_image = Image(graph_buffer, width=400, height=300)
            elements.append(graph_image)

            graph_buffer1 = self.create_graphPI(start_date, end_date, request.user)
            graph_image1 = Image(graph_buffer1, width=400, height=400)
            elements.append(graph_image1)

            graph_buffer2 = self.create_graphPE(start_date, end_date, request.user)
            graph_image2 = Image(graph_buffer2, width=400, height=400)
            elements.append(graph_image2)

        # adding table and graphs to pdf
        doc.build(elements, onFirstPage=self.header, onLaterPages=self.header)

        #return FileResponse
        buf.seek(0)
        response = FileResponse(buf, as_attachment=True, filename="BuddyBudgetReport.pdf")
        response['Content-Type'] = 'application/pdf'
        return response

    
class UserDeleteView(BaseModelMixin, APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)
    model = get_user_model()

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not (request.user.is_staff or request.user == user):
            return Response(
                {"error": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN
            )
        user.profile.delete()
        user.accounts.all().delete()
        user.categories.all().delete()
        user.transactions.all().delete()
        user.debts.all().delete()
        user.delete()

        return Response(
            {"message": "Usuario y todos los datos relacionados eliminados con éxito."},
            status=status.HTTP_204_NO_CONTENT
        )
    

class UserListCreateView(BaseModelMixin, APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)
    model = get_user_model

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(BaseModelMixin, APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)
    serializer_class = UserSerializer

    def get(self, request, pk):
  
        User = get_user_model()  
        try:
            user = User.objects.get(pk=pk) 
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        User = get_user_model() 
        try:
            user = User.objects.get(user_id=pk)  
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(user, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PDFgenerationA(BaseModelMixin, APIView):
    permission_classes = (IsAdminOrOwner,)
    authentication_classes = (JWTAuthentication,)

    def header(self, canvas, doc):
        page_width, page_height = letter
        canvas.saveState()

        logo_path = "/app/assets/BuddyBudget_black.png"
        canvas.drawImage(logo_path, x=35, y=735, width=92, height=48) 
        canvas.setFont("Times-Roman", 16)
        text = "Users Report"
        text_width = canvas.stringWidth(text, "Times-Roman", 16)
        text_x = page_width - text_width - 30 
        text_y = page_height - 50  
        canvas.drawString(text_x, text_y, text)
        canvas.setLineWidth(0.5)
        line_y = page_height - 60
        canvas.setLineWidth(0.5)
        canvas.line(30, line_y, page_width - 30, line_y)
        canvas.restoreState()
    
    def calculate_balance(self, incomes, expenses):
        total_incomes = sum(float(income.amount) for income in incomes)
        total_expenses = sum(float(expense.amount) for expense in expenses)
        return total_incomes - total_expenses

    def get(self, request):

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter)
        elements = []
        start_date_param = request.query_params.get('start_date')
        end_date_param = request.query_params.get('end_date')

        if start_date_param and end_date_param:
            try:
                start_date = datetime.strptime(start_date_param, "%Y-%m-%d").date()
                end_date = datetime.strptime(end_date_param, "%Y-%m-%d").date()
                if start_date > end_date:
                    return Response(
                        {"error": "start_date must be earlier than or equal to end_date."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                typeReport = "custom"
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            #config admin
            user_config = Configuration.objects.filter(user=request.user).first()
            #Cases for filtering
            if user_config and user_config.send_time == SendTimeType.MONTHLY:#assuming method is called every first of the month
                end_date = (datetime.today().replace(day=1) - timedelta(days=1)).date()#last day of previus month
                start_date = end_date.replace(day=1)
                typeReport = "monthly"
            elif user_config and user_config.send_time == SendTimeType.WEEKLY:
                end_date = datetime.today().date() - timedelta(days=1)#the day before the method is called
                start_date = end_date - timedelta(weeks=1)
                typeReport = "weekly"
            elif user_config and user_config.send_time == SendTimeType.FORTNIGHT:
                end_date = datetime.today().date() - timedelta(days=1)
                start_date = end_date - timedelta(weeks=2)
                typeReport = "fortnightly"
            elif user_config and user_config.send_time == SendTimeType.DAILY:
                end_date = datetime.today().date() - timedelta(days=1)
                start_date = end_date
                typeReport = "daily"
            else:
                end_date = datetime.today().date()
                start_date = datetime.today() - timedelta(days=30).date()
                typeReport = "monthly"

        users = get_user_model().objects.all()

        for user in users:
            user_transactions = Transaction.objects.filter(
                user_id=user.user_id,
                date__range=(start_date, end_date),
            )
            if not user_transactions.exists():
                continue

            incomes = user_transactions.filter(type="INC")
            expenses = user_transactions.filter(type="EXP")
            balance = self.calculate_balance(incomes, expenses)

            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                name="TitleStyle",
                parent=styles["Title"],
                fontSize=18,
                alignment=1,
                spaceAfter=20,
            )
            title_text = f"Report for {user.username} ({typeReport})"
            title = Paragraph(title_text, title_style)

            data = [["Category", "Account", "Amount", "Description", "Date", "Type"]]
            for transaction in user_transactions:
                categories = ", ".join([cat.category_name for cat in transaction.category.all()])
                data.append([
                    categories,
                    transaction.account,
                    transaction.amount,
                    transaction.description,
                    transaction.date.strftime("%d-%m-%Y"),
                    transaction.type,
                ])

            data.append([f"Balance: {balance:.2f}"])
            table = Table(data)

            style = TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Times-Roman"),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("SPAN", (0, -1), (-1, -1)),
                ("ALIGN", (0, -1), (-1, -1), "RIGHT"),
                ("BACKGROUND", (0, -1), (-1, -1), colors.lightgrey),
                ("TEXTCOLOR", (0, -1), (-1, -1), colors.black),
                ("FONTNAME", (0, -1), (-1, -1), "Times-Bold"),
            ])
            table.setStyle(style)

            elements.append(title)
            elements.append(table)
            elements.append(PageBreak())
     
        # adding table and graphs to pdf
        doc.build(elements, onFirstPage=self.header, onLaterPages=self.header)

        #return FileResponse
        buf.seek(0)
        response = FileResponse(buf, as_attachment=True, filename=f"BuddyBudgetReport_{start_date_param}-{end_date_param}.pdf")
        response['Content-Type'] = 'application/pdf'
        return response
