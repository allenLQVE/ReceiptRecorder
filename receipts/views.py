from django.shortcuts import render
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from receipts import models
from receipts.serializers import ItemSerializer, StoreSerializer, PurchaseRecordSerializer

Item = models.Item
Store = models.Store
PurchaseRecord = models.PurchaseRecord

# Create your views here.
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    @action(detail=False)
    def getItemByName(self, request, *args, **kwargs):
        '''
        Get Item by an item name
        '''
        itemName = request.data.get('item', None)
        result = models.getItem(item=itemName)

        if result:
            serializer = self.get_serializer(result)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False)
    def getItemByStore(self, request, *args, **kwargs):
        '''
        Get Item by a store name
        '''
        storeName = request.data.get('store', None)
        result = models.getItemByStore(store=storeName)

        if result:
            serializer = self.get_serializer(result, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer

    @action(detail=False)
    def getStoreByName(self, request, *args, **kwargs):
        '''
        Get Store by a store name
        '''
        storeName = request.data.get('store', None)
        result = models.getStore(store=storeName)

        if result:
            serializer = self.get_serializer(result)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False) 
    def getStoreByItem(self, request, *args, **kwargs):
        '''
        Get store by an item name
        '''
        itemName = request.data.get('item', None)
        result = models.getStoreByItem(item=itemName)

        if result:
            serializer = self.get_serializer(result, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)

class PurchaseRecordViewSet(viewsets.ModelViewSet):
    queryset = PurchaseRecord.objects.all()
    serializer_class = PurchaseRecordSerializer

    def create(self, request, *args, **kwargs):
        '''
        [Override] Create an object of record. 
        
        Will get the store id and item id based on the item name and store name.
        Fields will be filled if blank.
        '''
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
    
    @action(detail=False)
    def getRecordByItem(self, request):
        '''
        Get records by an item name
        '''
        itemName = request.data.get('item', None)
        result = models.getRecordsByItem(item=itemName)

        if result:
            serializer = self.get_serializer(result, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    @action(detail=False)
    def getRecordByStore(self, request):
        '''
        Get records by a store name
        '''
        storeName = request.data.get('store', None)
        result = models.getRecordsByStore(store=storeName)
        
        if result:
            serializer = self.get_serializer(result, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)