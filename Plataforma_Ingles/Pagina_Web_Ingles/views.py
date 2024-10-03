from django.shortcuts import render

def index(request):
    return render(request, 'index.html')
# Create your views here.

def sign_up(request):
    return render(request, 'sign_up.html')