from __future__ import unicode_literals

from django.db import models
from mongoengine import *


#
#
# class Raw_documents(Document):
#     id = IntField(primary_key=True)
#     text = StringField(max_length=200)
#     language = StringField(max_length=50)
#     translations = ListField()
#     rtl = BooleanField()


class User(Document):
    name = StringField(required=True)
    salt = StringField(required=False)
    email = StringField(required=True)
    password = StringField(required=False)
    role = StringField(required=True)
