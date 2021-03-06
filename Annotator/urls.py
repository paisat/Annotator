"""Annotator URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from TextAnnotator import views

urlpatterns = [
    url(r'^index/', views.index, name='index'),
    url(r'^admin/', admin.site.urls),
    url(r'^users/', views.user),
    url(r'^auth-token/', views.get_auth_token),
    url(r'^auth-token-verify/$', views.verify_token),
    url(r'^login/', views.login),
    url(r'^account/$', views.account),
    url(r'^user/language/(?P<language>[a-z|A-Z]*)/$', views.doc_by_language),
    url(r'^user/action/(?P<action>[a-z|A-Z]+)/$', views.save_doc),
    url(r'^user/document/$', views.assigned_doc),
    url(r'^allusers/$', views.allusers),
    url(r'^alldocs/$', views.alldocs),
    url(r'^all_translated_docs/$', views.all_translated_docs),
    url(r'^add-doc/$', views.adddoc),
    url(r'^rem_user/(?P<user_id>[a-z|A-Z|0-9]+)/$', views.remove_user),
    url(r'^account/changepassword/$', views.change_password),
    url(r'^user/forgotPassword/$', views.forgot_password),
    url(r'^languages/$', views.languages)
]
