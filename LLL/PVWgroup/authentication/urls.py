from django.urls import path
from . import views
from .views import user_logout
from .views import custom_password_reset, custom_password_reset_confirm


urlpatterns = [
    # PAGES

    # Staff login
    path('admin-login', views.admin_login, name = 'admin_login'),
    path('admin-login-authentication/', views.admin_login_authentication, name = 'admin-login-authentication'),
    path('verify_mail_sms_code_forAdminAuthentication/', views.verify_mail_sms_code_forAdminAuthentication, name='verify_mail_sms_code_forAdminAuthentication'),

    # user login
    path('user-login', views.user_login, name = 'login'),
    path('user-login-authentication/', views.user_login_authentication, name = 'user-login-authentication'),

    path('', views.home, name = 'home'),
    path('contact', views.contact, name = 'contact'),
    path('signup', views.signup, name = 'signup'),
   
   
    path('logout/', user_logout, name='logout'),
    
    # ALGORITHIMS

    # Forgot password and Reset
    path('password_reset/', custom_password_reset, name='custom_password_reset'),
    path('custom_password_reset_confirm/', views.custom_password_reset_confirm, name='custom_password_reset_confirm'),
    path('custom_password_reset_confirm/custom_password_resetting_confirm/', views.custom_password_resetting_confirm, name='custom_password_resetting_confirm'),

    path('get_counties/', views.get_counties, name='get_counties'),
    path('save_form_data/', views.save_form_data, name='save_form_data'),
    path('check-idnumber/<str:id_number>/', views.check_id_number_availability, name='check_id_number_availability'),
    path('check-username/<str:username>/', views.check_username_availability, name='check_username_availability'),
    path('check-phonenumber/<str:phone_number>/', views.check_phone_number_availability, name='check_phone_number_availability'),
    path('check-email/<str:email>/', views.check_email_availability, name='check_email_availability'),
]