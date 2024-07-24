from django.db import models

# Create your models here.
class Item(models.Model):
    name = models.CharField(max_length=100)
    desc = models.TextField(blank=True)
    unit = models.CharField(blank=True, max_length=20)

class Store(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    desc = models.TextField(blank=True)

class PurchaseRecord(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    purchaseDate = models.DateField()
    price = models.FloatField()
    saving = models.FloatField()
    units = models.FloatField()
    detail = models.TextField(blank=True)