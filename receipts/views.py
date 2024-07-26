from django.shortcuts import render
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.response import Response

from receipts.models import Item, Store, PurchaseRecord
from receipts.serializers import ItemSerializer, StoreSerializer, PurchaseRecordSerializer

# Create your views here.
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer

class PurchaseRecordViewSet(viewsets.ModelViewSet):
    queryset = PurchaseRecord.objects.all()
    serializer_class = PurchaseRecordSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        data._mutable = True

        if(data.get("store") and data.get("item")):
            store = data.get("store")
            item = data.get("item")

            data["store_id"] = Store.objects.get(name=store).id
            data["item_id"] = Item.objects.get(name=item).id

        if(not data.get("purchaseDate")):
            data["purchaseDate"] = timezone.now().date()

        if(not data.get("saving")):
            data["saving"] = 0

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        super().perform_create(serializer)
        headers = super().get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)