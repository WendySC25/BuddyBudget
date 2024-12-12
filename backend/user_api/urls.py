from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('verify-email/<uidb64>/<token>/', views.verify_email, name='verify_email'),
	path('register', views.UserRegister.as_view(), name='register'),
	path('login', views.UserLogin.as_view(), name='login'),
	path('logout', views.UserLogout.as_view(), name='logout'),
	path('user', views.UserView.as_view(), name='user'),
    path('profile', views.ProfileView.as_view(), name='profile'),
    path('transactions/', views.TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('transactions/<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    path('debts/', views.DebtListCreateView.as_view(), name='debt-list-create'),
    path('debts/<int:pk>/', views.DebtDetailView.as_view(), name='debt-detail'),
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/',  views.CategoryDetailView.as_view(), name='category-detail'),
    path('accounts/', views.AccountListCreateView.as_view(), name='account-list-create'),
    path('accounts/<int:pk>/', views.AccountDetailView.as_view(), name='account-detail'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('expchartdata/', views.ExpenseChartDataView.as_view(), name='expchartdata'),
    path('userlist/', views.UserList.as_view(), name='userlist/'),
    path('transactions_pdf', views.PDFgeneration.as_view(), name= 'PDFgeneration'),
    path('configuration', views.ConfigurationView.as_view(), name='configuration')
]
