from django.http import HttpResponse
from django.shortcuts import render
from TextAnnotator.models import User
import json
import bcrypt
import jwt
from django.views.decorators.csrf import csrf_exempt
import Annotator.settings as settings
import datetime
from rest_framework import exceptions
from django.http import HttpResponseRedirect


@csrf_exempt
def index(request):
    try:
        user = verify_token(request)
        return render(request, 'TextAnnotator/annotate.html')
    except exceptions.AuthenticationFailed:
        return HttpResponseRedirect("/login/")


@csrf_exempt
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








    # def text_document(request,id):
    #     if request.method == 'GET':
    #         return HttpResponse(Raw_documents.objects.filter(id=id)[0].to_json())
    #     if request.method == 'PUT':
    #         data = json.loads(request.body.decode("utf-8"))
    #         doc = Raw_documents.objects.filter(id=unicode(data['id']))
    #         doc.update(translations=str(data['translations']))
    #         #doc.save(force_insert=False)
    #         return HttpResponse(Raw_documents.objects.filter(id=data['id'])[0].to_json())
