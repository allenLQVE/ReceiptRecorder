from rest_framework import serializers
from receipts.models import Item, Store, PurchaseRecord
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username','password')

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id','name','desc','unit')

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ('id','name','desc','address')

class PurchaseRecordSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    store_id = serializers.IntegerField(write_only=True)
    
    item = ItemSerializer(read_only=True)
    item_id = serializers.IntegerField(write_only=True)

    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = PurchaseRecord
        fields = ('id',
                  'store',
                  'store_id',
                  'item', 
                  'item_id',
                  'purchaseDate', 
                  'price', 
                  'saving', 
                  'units', 
                  'detail',
                  'user_id')