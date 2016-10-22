from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse
from django.shortcuts import render
from TextAnnotator.models import Raw_documents
import json


def index(request):
    return render(request,'TextAnnotator/annotate.html')


def text_document(request,id):
    if request.method == 'GET':
        return HttpResponse(Raw_documents.objects.filter(id=id)[0].to_json())
    if request.method == 'PUT':
        data = json.loads(request.body.decode("utf-8"))
        doc = Raw_documents.objects.filter(id=unicode(data['id']))
        doc.update(translations=str(data['translations']))
        #doc.save(force_insert=False)
        return HttpResponse(Raw_documents.objects.filter(id=data['id'])[0].to_json())