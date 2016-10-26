import json
import random

import bcrypt
import datetime
import jwt
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework import exceptions

import Annotator.settings as settings
from TextAnnotator.models import Raw_documents
from TextAnnotator.models import User


@csrf_exempt
def index(request):
    try:
        user = verify_token(request)
        return render(request, 'TextAnnotator/annotate.html')
    except exceptions.AuthenticationFailed:
        return HttpResponseRedirect("/login/")


def user(request):
    if request.method == 'POST':
        try:

            user = verify_token(request)

            if user.role != "admin":
                raise exceptions.AuthenticationFailed("Must be admin to execute this API")

            user_data = json.loads(request.body)
            existing_user = User.objects(email=user_data['email'])

            if not len(existing_user) == 0:
                error_msg = dict()
                error_msg["message"] = "User already exists"
                return HttpResponse(json.dumps(error_msg), status=409)

            user = User.objects.create(name=user_data['name'], email=user_data['email'], role=user_data['role'])
            user.save()

            user_id = str(user.id)
            passwd_salt = bcrypt.gensalt()
            combo_password = user_id + passwd_salt + user_data['password'].encode('utf-8')
            hashed_password = bcrypt.hashpw(combo_password, passwd_salt)
            user.password = hashed_password
            user.salt = passwd_salt
            user.save()

            return HttpResponse(status=200)
        except exceptions.AuthenticationFailed:
            return HttpResponseRedirect("/login/")
        except:
            error_msg = dict()
            error_msg["message"] = "Something went wrong, Please try again"
            return HttpResponse(json.dumps(error_msg), status=500)


@csrf_exempt
def get_auth_token(request):
    if request.method == 'POST':
        request_data = json.loads(request.body)

        if not is_auth_request_data_valid(request_data):
            return create_http_message("User name and password required", 400)

        existing_user = User.objects(email=request_data['email'])

        if len(existing_user) == 0:
            return create_http_message("Username / password doesn't match", 401)

        existing_user = existing_user[0]

        password_hash = bcrypt.hashpw(
            str(existing_user.id) + existing_user.salt.encode('utf-8') + request_data['password'].encode('utf-8'),
            existing_user.salt.encode('utf-8'))

        if not password_hash == existing_user.password:
            return create_http_message("Username / password doesn't match", 401)

        payload = {
            'email': existing_user.email,
            'exp': datetime.datetime.utcnow() + settings.JWT_SETTINGS['JWT_EXPIRATION_DELTA']
        }

        jwt_token = jwt.encode(
            payload,
            settings.JWT_SETTINGS['JWT_SECRET_KEY'],
            settings.JWT_SETTINGS['JWT_ALGORITHM']
        ).decode('utf-8')

        token = {
            'token': jwt_token,
            'user_email': existing_user.email
        }

        return HttpResponse(json.dumps(token), status=200)


def verify_token(request):
    token = request.COOKIES.get("token")

    if not token:
        raise exceptions.AuthenticationFailed("Username/password doesn't match")

    options = {
        'verify_exp': True
    }

    try:

        jwt_token = jwt.decode(
            token,
            settings.JWT_SETTINGS['JWT_SECRET_KEY'],
            True,
            options=options,
            leeway=0,
            audience=None,
            issuer=None,
            algorithms=[settings.JWT_SETTINGS['JWT_ALGORITHM']]
        )

        if "email" not in jwt_token:
            raise jwt.InvalidTokenError

        existing_user = User.objects(email=jwt_token.get("email"))

        if len(existing_user) == 0:
            raise exceptions.AuthenticationFailed("User Account deleted. Please contact Admin")

        token_response = {
            'token': token,
            'user_email': existing_user[0].email
        }
        return existing_user[0]


    except jwt.ExpiredSignature:
        raise exceptions.AuthenticationFailed("Session Expired")
    except jwt.DecodeError:
        return exceptions.AuthenticationFailed("Username/passowrd doesn't match")
    except jwt.InvalidTokenError:
        return exceptions.AuthenticationFailed("Username/passowrd doesn't match")


def login(request):
    return render(request, 'TextAnnotator/login.html')


def account(request):
    try:
        user = verify_token(request)
        return render(request, 'TextAnnotator/account.html')
    except exceptions.AuthenticationFailed:
        return HttpResponseRedirect("/login/")


def is_auth_request_data_valid(request_data):
    if 'email' not in request_data or 'password' not in request_data:
        return False

    return True


def create_http_message(msg, status_code):
    message = dict()
    message['message'] = msg

    return HttpResponse(json.dumps(message), status=status_code)


def doc_by_language(request, language):
    try:
        user = verify_token(request)

        num_of_docs = Raw_documents.objects.count()
        if num_of_docs == 0:
            return HttpResponse({})
        num_of_lang_docs = Raw_documents.objects.filter(language=unicode(language)).count()
        if num_of_lang_docs < 1:
            s = json.loads("[]")
            return HttpResponse(s)

        if user.doc_assigned != 0:
            doc = Raw_documents.objects.filter(id=user.doc_assigned)
            s = json.loads("["+doc.to_json()+"]")
            return HttpResponse(s)

        found = False
        count = []
        while len(count) < num_of_lang_docs:
            i = random.randint(0, num_of_lang_docs - 1)
            if i not in count:
                count.append(i)
            doc = Raw_documents.objects.filter(language=unicode(language))
            if not doc[i].assigned:
                found = True
                break
        if found == True:
            doc[i].update(assigned=True)
            doc[i].update(user_assigned=user)
            user.update(doc_assigned=int(doc[i].id))
            s = json.loads("["+doc.to_json()+"]")
            return HttpResponse(s)
        else:
            s = json.loads("[]")
            return HttpResponse(s)
    except exceptions.AuthenticationFailed:
        return HttpResponseRedirect("/login/")


def save_doc(request, user_id, action):
    data = json.loads(request.body)
    try:
        user = User.objects.filter(id=unicode(user_id))
        l = len(user)
        u_id = user[0].id
    except Exception:
        s = json.loads("[]")
        return HttpResponse(s)

    try:
        doc = Raw_documents.objects.filter(id=unicode(user[0].doc_assigned))
        l = len(doc)
        doc_id = doc[0].id
    except Exception:
        s = json.loads("[]")
        return HttpResponse(s)

    if action.lower() == "next":
        doc.update(translations=str(data['translations']))
        return HttpResponse("Annotations saved")
    if action.lower() == "skip":
        doc.update(translations=[])
        doc.update(assigned=False)
        doc.update(user_assigned=None)
        user.update(doc_assigned=0)
        return HttpResponse("Annotations discarded")

def assigned_doc(request,user_id):
    try:
        user = User.objects.filter(id=unicode(user_id))
        l = len(user)
        u_id = user[0].id
    except Exception:
        s = json.loads("[]")
        return HttpResponse(s)

    if user[0].doc_assigned != 0:
        doc = Raw_documents.objects.filter(id=user[0].doc_assigned)
        s = json.loads("["+doc.to_json()+"]")
        return HttpResponse(s)
    else:
        doc = Raw_documents.objects.filter(id=user[0].doc_assigned)
        s = json.loads("["+doc.to_json()+"]")
        return HttpResponse(s)
