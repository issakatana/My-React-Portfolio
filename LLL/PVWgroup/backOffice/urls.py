from django.urls import path
from . import views


#create urls
urlpatterns = [
    # pages
    path('admin-dashboard', views.admindashboard, name = 'admindashboard'),
    path('admin-profile', views.adminprofile, name = 'adminprofile'),
    path('admin-approvals', views.adminapprovals, name = 'adminapprovals'),
    
    # new member approval
    path('block-account-request', views.block_account_request, name = 'block_account_request'),
    path('get_member_details/<int:member_id>/', views.get_member_details, name='get_member_details'),
    path('reject_accountCreated_request/<int:member_id>/', views.reject_accountCreated_request, name='reject_accountCreated_request'),
    path('approve_member/<int:member_id>/', views.approve_member, name='approve_member'),

    # advance loan
    path('get_advanceLoan_details/<str:loan_id>/', views.get_advanceLoan_details, name='get_advanceLoan_details'),
    path('reject_advanceLoan_request/<str:loan_id>/', views.reject_advanceLoan_request, name='reject_advanceLoan_request'),
    path('approve_advance_loan/<str:loan_id>/', views.approve_advance_loan, name='approve_advance_loan'),
    
    # welfare loan
    path('get_welfareLoan_details/<str:loan_id>/', views.get_welfareLoan_details, name='get_welfareLoan_details'),
    path('reject_welfareLoan_request/<str:loan_id>/', views.reject_welfareLoan_request, name='reject_welfareLoan_request'),
    path('approve_welfare_loan/<str:loan_id>/', views.approve_welfare_loan, name='approve_welfare_loan'),

    #benevolent claim
    path('get_benevolent_claim_details/<int:id>/', views.get_benevolent_claim_details, name='get_benevolent_claim_details'),
    path('reject_benevolentClaim_request/<int:id>/', views.reject_benevolentClaim_request, name='reject_benevolentClaim_request'),
    path('approve_benevolent_claim/<int:id>/', views.approve_benevolent_claim, name='approve_benevolent_claim'),

    # algorithms
    path('pvwUpdateContributions', views.pvwUpdateContributions, name = 'pvwUpdateContributions'),
    path('approve_contribution/', views.approve_contribution, name='approve_contribution'),
    
    path('get_member_details_for_pvwUpdateContributions/', views.get_member_details_for_pvwUpdateContributions, name='get_member_details_for_pvwUpdateContributions'),
    path('revert_pvwMonthlyUpdate_Contributions/', views.revert_pvwMonthlyUpdate_Contributions, name='revert_pvwMonthlyUpdate_Contributions'),
    path('approve_pvwMonthlyUpdate_Contributions/', views.approve_pvwMonthlyUpdate_Contributions, name='approve_pvwMonthlyUpdate_Contributions'),
]