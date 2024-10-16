from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def perfil_view(request):
    return render(request, 'perfil.html')

def includes(request):
    return render(request, 'header.html')
# Create your views here.
