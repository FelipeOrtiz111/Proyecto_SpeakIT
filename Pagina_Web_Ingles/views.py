from django.shortcuts import render
from .models import Video
# Create your views here.
def index(request):
    return render(request, 'index.html')

def includes(request):
    return render(request, 'header.html')

def videos_por_unidad(request, unidad_id):
    videos = Video.objects.filter(unidad=unidad_id)
    return render(request, 'includes/videos_list.html', {'videos': videos})

