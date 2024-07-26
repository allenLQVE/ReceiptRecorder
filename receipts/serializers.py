from rest_framework import serializers
from receipts.models import Item, Store, PurchaseRecord

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('name','desc','unit')

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ('name','desc','address')

class PurchaseRecordSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    store_id = serializers.IntegerField(write_only=True)
    
    item = ItemSerializer(read_only=True)
    item_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = PurchaseRecord
        fields = ('store',
                  'store_id',
                  'item', 
                  'item_id',
                  'purchaseDate', 
                  'price', 
                  'saving', 
                  'units', 
                  'detail')