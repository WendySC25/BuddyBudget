from django.shortcuts import render,redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required

# Create your views here.

@login_required
def home(request):
    return render(request,"home.html", {})

def authView(requets):
    if requets.method == "POST":
        form = UserCreationForm(requets.POST or None)
        if form.is_valid():
            form.save()
            return redirect("simple_login:login")
    else:
        form = UserCreationForm()

    return render(requets, "registration/sigup.html", {"form" : form})