from django.shortcuts import render

from rest_framework import viewsets

from ReceiptRecorder.receipts.models import Item, Store, PurchaseRecord
from ReceiptRecorder.receipts.serializers import ItemSerializer, StoreSerializer, PurchaseRecordSerializer

# Create your views here.
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer

class PurchaseRecordViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = PurchaseRecordSerializer