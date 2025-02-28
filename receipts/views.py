from django.contrib.auth.models import User
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from receipts import models
from receipts.serializers import ItemSerializer, StoreSerializer, PurchaseRecordSerializer, UserSerializer

Item = models.Item
Store = models.Store
PurchaseRecord = models.PurchaseRecord

# Create your views here.
@api_view(['POST'])
def register(request):
    data = UserSerializer(data=request.data)
    if data.is_valid():
        User.objects.create_user(
            username = data['username'].value,
            password = data['password'].value
        )
        return Response(status=status.HTTP_201_CREATED)
    else:
        return Response(data.errors, status=status.HTTP_400_BAD_REQUEST)

class ItemViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    @action(detail=False)
    def getItemByName(self, request, *args, **kwargs):
        '''
        Get Item by an item name
        '''
        itemName = request.GET.get('item', None)
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
        storeName = request.GET.get('store', None)
        result = models.getItemByStore(store=storeName)

        if result:
            serializer = self.get_serializer(result, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)

class StoreViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    queryset = Store.objects.all()
    serializer_class = StoreSerializer

    @action(detail=False)
    def getStoreByName(self, request, *args, **kwargs):
        '''
        Get Store by a store name
        '''
        storeName = request.GET.get('store', None)
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
        itemName = request.GET.get('item', None)
        result = models.getStoreByItem(item=itemName)

        if result:
            serializer = self.get_serializer(result, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)

class PurchaseRecordViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    queryset = PurchaseRecord.objects.all()
    serializer_class = PurchaseRecordSerializer

    def destroy(self, request, *args, **kwargs):
        '''
        [Override] Remove a record. 
        '''
        instance = self.get_object()
        if (request.user.id != instance.user_id and not request.user.is_staff):
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        return super().destroy(request=request)

    def update(self, request, *args, **kwargs):
        '''
        [Override] Update a record. 
        
        Will get the store id and item id based on the item name and store name.
        '''
        data = request.data

        if(data.get("store") and data.get("item")):
            store = data.get("store")
            item = data.get("item")

            data["store_id"] = Store.objects.get(name=store).id
            data["item_id"] = Item.objects.get(name=item).id

        if(not data.get("purchaseDate")):
            data["purchaseDate"] = timezone.now().date()

        if(not data.get("saving")):
            data["saving"] = 0
        
        instance = self.get_object()
        if (request.user.id != instance.user_id and not request.user.is_staff):
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        
        data["user_id"] = instance.user.id
        serializer = self.get_serializer(instance, data=data)
        serializer.is_valid(raise_exception=True)
        super().perform_update(serializer)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        '''
        [Override] Create an object of record. 
        
        Will get the store id and item id based on the item name and store name.
        Fields will be filled if blank.
        '''
        data = request.data
        # data._mutable = True

        if(data.get("store") and data.get("item")):
            store = data.get("store")
            item = data.get("item")

            data["store_id"] = Store.objects.get(name=store).id
            data["item_id"] = Item.objects.get(name=item).id

        if(not data.get("purchaseDate")):
            data["purchaseDate"] = timezone.now().date()

        if(not data.get("saving")):
            data["saving"] = 0
            
        data["user_id"] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        super().perform_create(serializer)
        headers = super().get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False)
    def getRecordByItem(self, request, *args, **kwargs):
        '''
        Get records by an item name
        '''
        itemName = request.GET.get('item', None)
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
        storeName = request.GET.get('store', None)
        result = models.getRecordsByStore(store=storeName)
        
        if result:
            serializer = self.get_serializer(result, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)