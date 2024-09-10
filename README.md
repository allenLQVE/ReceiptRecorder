# ReceiptRecorder

This application allowed users to record the merchandise they bought from different grocery stores. It can be used to compare the prices between the stores or to see the frequency of purchasing specific items.

This project uses Python with the Django rest framework to construct a RESTful API. As the structure of the project is very straightforward, the database uses a lightweight SQLite3 database that is contained in Django. It contains records that represent the purchase of different merchandise in different grocery stores, items that represent the merchandise, and stores that represent different grocery stores.

The UI is in the [receiptrecorder_frontend](https://github.com/allenLQVE/receiptrecorder_frontend) which was built up with React.

### Guide
This project runs with Python 3.12.4 and Django 5.0.7. It requires the Django Rest Framework and Django CORS Headers so please do \
```pip install djangorestframework``` and ```pip install django-cors-headers``` \

After Django is set up, the project can be run for development with \
```python runserver manage.py```

### Warning
This project is not ready to be deployed. Please be aware that security needs to be taken care of before deployment. 
