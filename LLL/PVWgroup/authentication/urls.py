from django.urls import path
from . import views
from .views import user_logout
from .views import custom_password_reset, custom_password_reset_confirm


urlpatterns = [
    # pages
    path('', views.home, name = 'home'),
    path('contact', views.contact, name = 'contact'),
    path('signup', views.signup, name = 'signup'),
    path('user-login', views.user_login, name = 'login'),
    path('admin-login', views.admin_login, name = 'admin_login'),
    path('logout/', user_logout, name='logout'),
    # algorithms
    path('get_counties/', views.get_counties, name='get_counties'),
    path('save_form_data/', views.save_form_data, name='save_form_data'),
    path('check-idnumber/<str:id_number>/', views.check_id_number_availability, name='check_id_number_availability'),
    path('check-phonenumber/<str:phone_number>/', views.check_phone_number_availability, name='check_phone_number_availability'),
    path('check-email/<str:email>/', views.check_email_availability, name='check_email_availability'),

    # password reset
    path('password_reset/', custom_password_reset, name='custom_password_reset'),
    path('password_reset_confirm/<uidb64>/<token>/', custom_password_reset_confirm, name='custom_password_reset_confirm'),
]