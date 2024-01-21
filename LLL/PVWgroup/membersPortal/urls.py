from django.urls import path
from . import views



# URLS
urlpatterns = [
    path('dashboard', views.dashboard, name = 'dashboard'),
    path('profile', views.profile, name = 'profile'),
    path('accounts', views.accounts, name = 'accounts'),
    path('faq', views.faq, name = 'faq'),

    # loan page
    path('loans', views.loans, name = 'loans'),
    
    path('get_guarantor_info/<path:member_number>/', views.get_guarantor_info, name='get_guarantor_info'),

    path('generate_guarantorship_verification_code/', views.generate_guarantorship_verification_code, name='generate_guarantorship_verification_code'),

    path('verify_mail_sms_code/', views.verify_mail_sms_code, name='verify_mail_sms_code'),

    # path('fetch_verification_codes/', views.fetch_verification_codes, name='fetch_verification_codes'),

    path('handle_loan_submission', views.handle_loan_submission, name='handle_loan_submission'),

    
    path('check_AdvanceloanEligibility_withSalary/<str:salary>/', views.check_AdvanceloanEligibility_withSalary, name='check_AdvanceloanEligibility_withSalary'),
    path('check_NormalloanEligibility_withSalary/<str:salary>/', views.check_NormalloanEligibility_withSalary, name='check_NormalloanEligibility_withSalary'),
     
   
    path('filter_schedules/', views.filter_schedules, name='filter_schedules'),

    # share adjustment
    path('checkPinForShareAdjustment', views.checkPinForShareAdjustment, name='checkPinForShareAdjustment'),
    path('Submit-Share-Adjustment', views.Submit_Share_Adjustment, name ='Submit-Share-Adjustment'),

    # share transfer
    path('checkPinForShareTransfer', views.checkPinForShareTransfer, name='checkPinForShareTransfer'),
    path('transfer_shares', views.transfer_shares, name='transfer_shares'),

    #benevolent claim submission
    path('get_deceased_information_details/', views.get_deceased_information_details, name='get_deceased_information_details'),
    path('update_is_deceased/<int:nominee_id>/', views.update_is_deceased, name='update_is_deceased'),
    path('revert_is_deceased/<int:nominee_id>/', views.revert_is_deceased, name='revert_is_deceased'),
    path('benevolent_claim_view', views.benevolent_claim_view, name='benevolent_claim_view'),
]