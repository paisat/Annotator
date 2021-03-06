import json

import random
import yaml

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
from TextAnnotator.models import Languages
from django.core.mail import send_mail
import string
import random
import logging

logging.basicConfig()
logger = logging.getLogger("Annotator Logger")


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

            random_password = ''.join(
                random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(10))

            user_id = str(user.id)
            passwd_salt = bcrypt.gensalt()
            combo_password = user_id + passwd_salt + random_password.encode('utf-8')
            hashed_password = bcrypt.hashpw(combo_password, passwd_salt)
            user.password = hashed_password
            user.salt = passwd_salt
            user.save()

            send_mail('Welcome To Language Annotator',
                      'Log in using these credentials \n email = ' + user_data[
                          'email'] + '\n password = ' + random_password + '\n Log in Link : ' + 'http://52.24.230.241:8085/login/',
                      'knight@isi.edu', [user_data['email']],
                      fail_silently=False)

            return HttpResponse(status=200)
        except exceptions.AuthenticationFailed:
            return HttpResponseRedirect("/login/")
        except:
            logger.exception("Something went wrong")
            return create_http_message("Something went wrong!. Please try again.", status_code=500)


@csrf_exempt
def get_auth_token(request):
    try:

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

            message = dict()
            message['initial_password_changed'] = existing_user.initial_password_changed

            auth_response = HttpResponse(json.dumps(message))
            set_response_cookie(auth_response, "token", token['token'])

            return auth_response
    except:
        logger.exception("Something went wrong")
        return create_http_message("Something went wrong!. Please try again.", status_code=500)


def set_response_cookie(response, key, value):
    expires = datetime.datetime.strftime(datetime.datetime.utcnow() + settings.JWT_SETTINGS['JWT_EXPIRATION_DELTA'],
                                         "%a, %d-%b-%Y %H:%M:%S GMT")
    response.set_cookie(key, value, expires=expires)


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


def login(request, password_change=False):
    if request.POST:

        if 'passwordChange' in request.POST:
            password_change = bool(str(request.POST['passwordChange']))

    return render(request, 'TextAnnotator/login.html', {'password_change': password_change})


def account(request):
    try:
        user = verify_token(request)

        is_admin = False

        if user.role == 'admin':
            is_admin = True

        return render(request, 'TextAnnotator/account.html', context={'is_admin': is_admin})
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

        if user.doc_assigned != 0:
            doc = Raw_documents.objects.filter(id=user.doc_assigned)
            return HttpResponse(doc.to_json())

        if language != 'assigned':

            random_doc = Raw_documents._get_collection().aggregate(
                [{'$match': {'assigned': False, 'language': language}}, {'$sample': {'size': 1}}])

            doc = None

            for document in random_doc:
                doc = document

            if not doc:
                return HttpResponse(json.dumps([]))

            doc = Raw_documents.objects.filter(id=doc['_id'])
            doc[0].update(assigned=True)
            doc[0].update(user_assigned=user)
            user.update(doc_assigned=int(doc[0].id))

            return HttpResponse(doc.to_json())

        return HttpResponse(json.dumps([]))

    except exceptions.AuthenticationFailed:
        return HttpResponseRedirect("/login/")
    except:
        logger.exception("Something went wrong")
        return create_http_message("Something went wrong!. Please try again.", status_code=500)

def change_password(request):
    try:

        user = verify_token(request)
        request_data = json.loads(request.body)

        newPassword = request_data['newPassword']

        if not newPassword or not (len(newPassword) >= 6 and len(newPassword) <= 15):
            raise Exception()

        user_id = str(user.id)
        passwd_salt = bcrypt.gensalt()
        combo_password = user_id + passwd_salt + newPassword.encode('utf-8')
        hashed_password = bcrypt.hashpw(combo_password, passwd_salt)
        user.password = hashed_password
        user.salt = passwd_salt

        if not user.initial_password_changed:
            user.initial_password_changed = True

        user.save()

        return HttpResponse(status=200)

    except exceptions.AuthenticationFailed:
        return HttpResponseRedirect("/login/")
    except exceptions.PermissionDenied:
        return create_http_message("Current Password is wrong", exceptions.PermissionDenied.status_code)
    except:
        logger.exception("Something went wrong")
        return create_http_message("Something Went Wrong. Please Try again", 500)


def save_doc(request, action):
    try:
        user = verify_token(request)
        data = json.loads(request.body)

        try:
            doc = Raw_documents.objects.filter(id=unicode(user.doc_assigned))
            l = len(doc)
            doc_id = doc[0].id
        except Exception:
            s = json.loads("[]")
            return HttpResponse(s)

        if action.lower() == "save":
            doc.update(translations=data)
            return HttpResponse(status=200)
        if action.lower() == "next":

            if len(data) == 0:
                doc.update(assigned=False)

            doc.update(translations=data)
            user.update(doc_assigned=0)
            return HttpResponse(status=200)
        if action.lower() == "skip":
            doc.update(translations=[])
            doc.update(assigned=False)
            doc.update(user_assigned=None)
            user.update(doc_assigned=0)
            return HttpResponse(status=200)
    except exceptions.AuthenticationFailed:
        return HttpResponseRedirect("/login/")
    except:
        logger.exception("Something went wrong")
        return create_http_message("Something Went Wrong", status_code=500)


def forgot_password(request):
    try:
        data = json.loads(request.body)
        existing_user = User.objects(email=data['email'])

        if len(existing_user) != 0:
            existing_user = existing_user[0]
            existing_user.initial_password_changed = False

            random_password = ''.join(
                random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(10))

            user_id = str(existing_user.id)
            passwd_salt = bcrypt.gensalt()
            combo_password = user_id + passwd_salt + random_password.encode('utf-8')
            hashed_password = bcrypt.hashpw(combo_password, passwd_salt)
            existing_user.password = hashed_password
            existing_user.salt = passwd_salt
            existing_user.save()

            send_mail('Language Annotator password has been reset',
                      'Log in using these credentials \n email = ' + existing_user[
                          'email'] + '\n password = ' + random_password + '\n Log in Link : ' + 'http://52.24.230.241:8085/login/',
                      'knight@isi.edu', [existing_user['email']],
                      fail_silently=False)

            return create_http_message("", status_code=200)
        else:
            return create_http_message("", status_code=200)

    except:
        logger.exception("Something went wrong")
        return create_http_message("Something went wrong!. Please try again.", status_code=500)

def assigned_doc(request):
    try:
        user = verify_token(request)

        if user.doc_assigned != 0:
            doc = Raw_documents.objects.filter(id=user.doc_assigned)
            return HttpResponse(doc.to_json())
        else:
            doc = Raw_documents.objects.filter(id=user.doc_assigned)
            return HttpResponse(doc.to_json())

    except exceptions.AuthenticationFailed:
        return HttpResponseRedirect("/login/")
    except:
        logger.exception("Something went wrong")
        return create_http_message("Something went wrong!. Please try again.", status_code=500)


def remove_user(request,user_id):
    try:
        user = User.objects.filter(id=unicode(user_id))
        l = len(user)
        u_id = user[0].id
    except Exception:
        s = json.loads("[]")
        return HttpResponse(s)

    if user[0].doc_assigned != 0:
        doc = Raw_documents.objects.filter(id=unicode(user[0].doc_assigned))
        doc.update(translations=[])
        doc.update(assigned=False)
        doc.update(user_assigned=None)
        user.update(doc_assigned=0)
        user.delete()
        #delete user
    else:
        #delete user
        user.delete()
    return HttpResponse()

def adddoc(request):
    data = json.loads(request.body)
    language = data["language"]
    text = data["document"]
    rtl = data["rtl"]
    recs = Raw_documents.objects()
    ids = []
    for rec in recs():
        ids.append(rec.id)
    if len(ids)>0:
        new_id = max(ids) +1
    else:
        new_id=1
    try :
        doc = Raw_documents.objects.create(language=language,text=text,id=new_id,rtl=rtl)
    except Exception:
        print "here exception"
        logger.exception("something wrong ")
        return HttpResponse("Some problem encountered while saving document.")

    return HttpResponse()


def allusers(request):
    return HttpResponse(User.objects.to_json())

def alldocs(request):
    return HttpResponse(Raw_documents.objects.to_json())


def all_translated_docs(request):
    docs = Raw_documents.objects.filter(translations=[])
    ids =[ x.id for x in Raw_documents.objects.all() if x not in docs]
    #print new_docs
    new_docs = []
    for i in ids:
        new_docs.append(Raw_documents.objects.filter(id=i)[0])
    str = ""
    for n in new_docs:
        str += n.to_json()
    #return HttpResponse( json.loads("["+str+"]"))
    return HttpResponse(yaml.safe_load("["+str+"]"))

def languages(request):
    l = Languages.objects.to_json()
    l = l.replace("_id","id")
    l = l.replace("name", "text")
    return HttpResponse(l)