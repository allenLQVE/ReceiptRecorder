from django.db import models

# Create your models here.
class Item(models.Model):
    '''
    Store items that can be purchased in store
    '''
    name = models.CharField(max_length=100)
    desc = models.TextField(blank=True)
    unit = models.CharField(blank=True, max_length=20)

    class Meta:
        db_table = 'item'

class Store(models.Model):
    '''
    Grocery Stores
    '''
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    desc = models.TextField(blank=True)

    class Meta:
        db_table = 'store'

class PurchaseRecord(models.Model):
    '''
    Record of shopped items (receipt)
    '''
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    purchaseDate = models.DateField()
    price = models.FloatField()
    saving = models.FloatField()
    units = models.FloatField()
    detail = models.TextField(blank=True)

    class Meta:
        db_table = 'purchaseRecord'

def getRecordsByItem(*args, **kwargs):
    '''
    Get records by an item name
    '''
    itemName = kwargs.get('item')

    result = PurchaseRecord.objects.filter(item__name=itemName)
    return result

def getRecordsByStore(*args, **kwargs):
    '''
    Get records by a store name
    '''
    storeName = kwargs.get('store')

    result = PurchaseRecord.objects.filter(store__name=storeName)
    return result