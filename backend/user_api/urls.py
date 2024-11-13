from django.urls import path
from . import views

urlpatterns = [
	path('register', views.UserRegister.as_view(), name='register'),
	path('login', views.UserLogin.as_view(), name='login'),
	path('logout', views.UserLogout.as_view(), name='logout'),
	path('user', views.UserView.as_view(), name='user'),
    path('profile', views.ProfileView.as_view(), name='profile'),
    path('incomes', views.IncomeListCreateView.as_view(), name='income-list-create'),
    path('incomes/<int:pk>/', views.IncomeDetailView.as_view(), name='income-detail'),
    path('expenses', views.ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('expenses/<int:pk>/', views.ExpenseDetailView.as_view(), name='expense-detail'),
]
