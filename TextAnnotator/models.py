from __future__ import unicode_literals

from django.db import models
from mongoengine import *


class User(Document):
    name = StringField(required=True)
    salt = StringField(required=False)
    email = StringField(required=True)
    password = StringField(required=False)
    role = StringField(required=True)
    doc_assigned = IntField(default=0)
    initial_password_changed = BooleanField(default=False)


class Raw_documents(Document):
    id = IntField(primary_key=True)
    text = StringField(max_length=200)
    language = StringField(max_length=50)
    translations = ListField()
    user_assigned = ReferenceField(User)
    rtl = BooleanField()
    assigned = BooleanField(default=False)


class Users_docs(Document):
    user_id = IntField(primary_key=True)
