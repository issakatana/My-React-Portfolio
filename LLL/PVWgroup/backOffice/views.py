from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime
import pytz
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from authentication.models import CustomUser, Member, PersonalDetails, ContactDetails, Nominee, NextOfKin
from backOffice.models import Transaction, AdjustedShareContributions, Benovelent, BenevolentClaim, AdvanceLoan, WelfareLoan, ReducingTable, Payroll, DeceasedInformation, WelfareStatistics
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseServerError, JsonResponse
from django.db import transaction
import logging
from django.db.models import Q


################# ADMIN DASHBOARD PAGE VIEWS ###############
def is_superuser(user):
    return user.is_superuser


def get_or_create_member(user):
    try:
        return user.member
    except Member.DoesNotExist:
        member = Member.objects.create(user=user)
        return member  

@login_required
@user_passes_test(is_superuser)
def admindashboard(request):
    try:
        current_user = request.user
        name = current_user.username
        last_login_utc = request.user.last_login

        # Fetch data from the Member model
        members_data = Member.objects.all()  # You may want to apply some filters here based on your requirements

        # Calculate the sums
        benovelent_sum = members_data.aggregate(Sum('benovelent_contribution'))['benovelent_contribution__sum'] or 0
        shares_sum = members_data.aggregate(Sum('shares_contribution'))['shares_contribution__sum'] or 0
        normal_loan_sum = members_data.aggregate(Sum('normal_loan'))['normal_loan__sum'] or 0
        salary_advance_loan_sum = members_data.aggregate(Sum('salary_advance_loan'))['salary_advance_loan__sum'] or 0
        loan_outstanding_sum = members_data.aggregate(Sum('loan_outstanding'))['loan_outstanding__sum'] or 0
        welfare_sum = members_data.aggregate(Sum('welfare'))['welfare__sum'] or 0

        unapproved_accounts_count = CustomUser.objects.filter(is_approved=False).count()
        approved_accounts_count = CustomUser.objects.filter(is_approved=True).count()

        # Retrieve or create an instance of WelfareStatistics
        welfare_statistics, created = WelfareStatistics.objects.get_or_create(pk=1)
      
        if last_login_utc:
            # Check if last_login_utc has timezone information
            if last_login_utc.tzinfo is None or last_login_utc.tzinfo.utcoffset(last_login_utc) is None:
                last_login_utc = timezone.make_aware(last_login_utc, timezone.utc)

            # Convert UTC time to Nairobi time
            nairobi_tz = pytz.timezone('Africa/Nairobi')
            last_login_nairobi = last_login_utc.astimezone(nairobi_tz)
        else:
            last_login_nairobi = None
        current_path = request.path
        page_name = current_path.split('/')[-1]
        page_title_map = {
            'admindashboard': 'My Dashboard',
        }
        page_title = page_title_map.get(page_name, 'Admin Dashboard')
        context = {
            'page_title': page_title,
            'name': name,
            'last_login': last_login_nairobi,

            'unapproved_accounts_count' : unapproved_accounts_count,
            'approved_accounts_count': approved_accounts_count,

           'welfare_shares_balance': format(welfare_statistics.welfare_shares_balance, ','),
           'welfare_benevolent_balance': format(welfare_statistics.welfare_benevolent_balance, ','),

            'benovelent_sum': benovelent_sum,
            'shares_sum': shares_sum,
            'normal_loan_sum': normal_loan_sum,
            'salary_advance_loan_sum': salary_advance_loan_sum,
            'loan_outstanding_sum': loan_outstanding_sum,
            'welfare_sum': welfare_sum,
        }
        return render(request, 'admindashboard.html', context)
    except Member.DoesNotExist:
        return HttpResponseServerError("Member not found for the current user.")
    except Exception as e:
        return HttpResponseServerError(f"An error occurred: {str(e)}")
  

 


def pvwUpdateContributions(request):
    try:
        with transaction.atomic():
            members_data = Member.objects.all()

            for member in members_data:
                repaid_advance_amount, repaid_advance_interest = 0, 0

                # Check if the member has a Benovelent and Shares instance
                if hasattr(member, 'benovelent') and hasattr(member, 'share_amount'):
                    benovelent_contribution = member.benovelent.benov_amount
                    share_contribution = member.share_amount.share_amount

                    print(benovelent_contribution)
                    print(share_contribution)

                    # Process advance loans
                    advance_loan_instances = AdvanceLoan.objects.filter(
                        member=member,
                        is_disbursed=True,
                        is_repaid=False
                    )

                    if advance_loan_instances.exists():
                        for advance_loan_instance in advance_loan_instances:
                            repaid_advance_amount = advance_loan_instance.borrowed_amount
                            repaid_advance_interest = advance_loan_instance.interest
                    else:
                        print("No matching AdvanceLoan instances found.")

                    if repaid_advance_amount > 0:
                        member.clear_salary_advance_loan()
                        advance_loan_instance.approve_loan_repaid()

                        Transaction.objects.create(
                            member=member,
                            activity_type='advance loan repayment',
                            description="Advance Loan Repaid Successfully",
                            debit=repaid_advance_amount,
                            credit=0,
                        )

                        Transaction.objects.create(
                            member=member,
                            activity_type='advance loan interest',
                            description="Advance Loan interest on repayment",
                            debit=repaid_advance_interest,
                            credit=0,
                        )

                    # Process welfare loans
                    welfare_loan_instances = WelfareLoan.objects.filter(
                        member=member,
                        is_disbursed=True,
                        is_repaid=False
                    )

                    for welfare_loan_instance in welfare_loan_instances:
                        reducing_table_entries = welfare_loan_instance.reducing_table.filter(
                            is_picked=False,
                            date_picked=None
                        ).order_by('month')[:1]

                        if reducing_table_entries.exists():
                            reducing_entry = reducing_table_entries[0]
                            reducing_entry.is_picked = True
                            reducing_entry.date_picked = timezone.now().date()
                            reducing_entry.status = 'picked'
                            reducing_entry.save()

                            member.deduct_from_normal_loan(reducing_entry.installment, reducing_entry.interest)

                            payroll_instance, created = Payroll.objects.get_or_create(member=member)
                            payroll_instance.update_loan_wf_from_reducing_table(welfare_loan_instance)

                            print(f"Reducing Table Entry picked for Welfare Loan {welfare_loan_instance.loan_id}")
                        else:
                            print(f"No suitable reducing table entry found for Welfare Loan {welfare_loan_instance.loan_id}")
                            payroll_instance, created = Payroll.objects.get_or_create(member=member)
                            payroll_instance.loan_wf = 0
                            payroll_instance.save()

                    # Update contributions for the member
                    member.update_benovelent_contribution(benovelent_contribution)
                    member.update_shares_contribution(share_contribution)
                    member.update_welfare()

                    # Create or update Payroll record
                    payroll, created = Payroll.objects.get_or_create(member=member)
                    payroll.full_name = member.personal_details.get_full_name()
                    payroll.welfare = share_contribution
                    payroll.benovelent = benovelent_contribution
                    payroll.advance = repaid_advance_amount + repaid_advance_interest
                    payroll.save()

                    # Create transaction records
                    Transaction.objects.create(
                        member=member,
                        activity_type='benovelent',
                        description="Benovelent Contribution Update",
                        debit=0,
                        credit=benovelent_contribution,
                    )

                    Transaction.objects.create(
                        member=member,
                        activity_type='shares',
                        description="Shares Contribution Update",
                        debit=0,
                        credit=share_contribution,
                    )

                else:
                    print(f"No Benovelent instance found for Member {member.user.member_number}")

            return redirect('admindashboard')

    except Exception as e:
        return HttpResponseServerError(f"An error occurred: {str(e)}")







# def get_member_details_for_pvwUpdateContributions(request):
#     try:
#         members = Member.objects.all()
        
#         member_details_list = []
#         for member in members:
#             member_details = {
#                 # General Details
#                 'full_name': member.personal_details.get_full_name() or 'No data provided',
#                 'member_number': member.user.member_number or 'No data provided',
#                 'position': member.personal_details.position or 'No data provided',

#                 # Share Details
#                 'shares_contribution_balance': member.shares_contribution or 'No data provided',
#                 'share_amountTo_contribute': member.share_amount.share_amount or 'No data provided',
#                 'new_shares_contribution_balance': member.shares_contribution + member.share_amount.share_amount,

#                 # Benevolent Details
#                 'benevolent_contribution_balance': member.benovelent_contribution or 'No data provided',
#                 'benevolent_amountTo_contribute': member.benovelent.benov_amount or 'No data provided',
#                 'new_benevolent_contribution_balance': member.benovelent_contribution + member.benovelent.benov_amount,

#                 # Before Balances
#                 'total_welfare_shares_contribution_before': 0,
#                 'total_welfare_benovelent_contribution_before': 0,
#                 'total_welfare_interest_before': 0,

#                 # After Balances
#                 'total_welfare_shares_contribution_after': 0,
#                 'total_welfare_benovelent_contribution_after': 0,
#                 'total_welfare_interest_after': 0
#             }
#             member_details_list.append(member_details)
        
#         return JsonResponse({'members': member_details_list})
#     except Member.DoesNotExist:
#         return JsonResponse({'error': 'Members not found'}, status=404)


from django.db.models import Sum

def get_member_details_for_pvwUpdateContributions(request):
    try:
        members = Member.objects.all()

        # Calculate total share and benevolent contributions
        total_share_amount = members.aggregate(total_share_amount=Sum('share_amount__share_amount'))['total_share_amount'] or 0
        total_benevolent_amount = members.aggregate(total_benevolent_amount=Sum('benovelent__benov_amount'))['total_benevolent_amount'] or 0

        # Collect member details
        member_details_list = []

        for member in members:
            member_details = {
                # General Details
                'full_name': member.personal_details.get_full_name() or 'No data provided',
                'member_number': member.user.member_number or 'No data provided',
                'position': member.personal_details.position or 'No data provided',

                # Share Details
                'shares_contribution_balance': member.shares_contribution or 'No data provided',
                'share_amountTo_contribute': member.share_amount.share_amount or 'No data provided',
                'new_shares_contribution_balance': member.shares_contribution + member.share_amount.share_amount,

                # Benevolent Details
                'benevolent_contribution_balance': member.benovelent_contribution or 'No data provided',
                'benevolent_amountTo_contribute': member.benovelent.benov_amount or 'No data provided',
                'new_benevolent_contribution_balance': member.benovelent_contribution + member.benovelent.benov_amount,
            }

            member_details_list.append(member_details)

        # Check if WelfareStatistics instance exists
        welfare_statistics = WelfareStatistics.objects.first()

        # Use the model method to calculate overall balances
        overall_balances = welfare_statistics.calculate_overall_balances(total_share_amount, total_benevolent_amount) if welfare_statistics else {
            'total_welfare_shares_contribution_before': 0,
            'total_welfare_benovelent_contribution_before': 0,
            'total_welfare_interest_before': 0,
            'total_welfare_shares_contribution_after': 0,
            'total_welfare_benovelent_contribution_after': 0,
            'total_welfare_interest_after': 0,
        }

        return JsonResponse({'members': member_details_list, 'overall_balances': overall_balances})
    
    except Member.DoesNotExist:
        return JsonResponse({'error': 'Members not found'}, status=404)

from typing import Optional



def approve_pvwMonthlyUpdate_Contributions(request):
    try:
        with transaction.atomic():
            members_data = Member.objects.all()
            total_share_amount = 0
            total_benevolent_amount = 0

            if request.method == 'POST':
                if request.user.is_staff and request.user.status == "Approved":
                    for member in members_data:
                        member_status = member.user.status
                        
                        if member_status == "Approved":
                            # Update contributions for the member
                            member.update_benovelent_contribution(member.benovelent.benov_amount)
                            member.update_shares_contribution(member.share_amount.share_amount)
                            member.update_welfare()                           

                            # Create transaction records
                            Transaction.objects.create(
                                member=member,
                                activity_type='benovelent',
                                description="Benovelent Contribution Update",
                                debit=0,
                                credit=member.benovelent.benov_amount,
                            )

                            Transaction.objects.create(
                                member=member,
                                activity_type='shares',
                                description="Shares Contribution Update",
                                debit=0,
                                credit=member.share_amount.share_amount,
                            )

                            # Update total share and benevolent amounts
                            total_share_amount += member.share_amount.share_amount
                            total_benevolent_amount += member.benovelent.benov_amount

                    # Retrieve or create an instance of WelfareStatistics
                    welfare_statistics, created = WelfareStatistics.objects.get_or_create(pk=1)

                    # Update welfare_statistics balances
                    welfare_statistics.welfare_shares_balance += total_share_amount
                    welfare_statistics.welfare_benevolent_balance += total_benevolent_amount

                    # Call the update_welfare_balances method
                    welfare_statistics.update_welfare_balances(
                        welfare_statistics.welfare_shares_balance,
                        welfare_statistics.welfare_benevolent_balance
                    )

                    return JsonResponse({
                        'success': f'Successfully approved Welfare Loan.',
                        'total_share_amount': format(total_share_amount, ','),
                        'total_benevolent_amount': format(total_benevolent_amount, ','),
                        'new_total_share_amount_balance': format(welfare_statistics.welfare_shares_balance, ','),
                        'new_total_benevolent_amount_balance': format(welfare_statistics.welfare_benevolent_balance, ','),
                    })
                else:
                    return JsonResponse({'error': 'Update not found or is already updated'}, status=400)
            else:
                return JsonResponse({'error': 'Method not allowed'}, status=405)

    except Member.DoesNotExist:
        return JsonResponse({'error': 'Member not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)


def revert_pvwMonthlyUpdate_Contributions(request):
    try:
        print('hello')

    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)




# def pvwUpdateContributions(request):
#     try:
#         with transaction.atomic():
#             members_data = Member.objects.all()

#             for member in members_data:
#                 repaid_advance_amount = 0
#                 repaid_advance_interest = 0

#                 # Check if the member has a Benovelent instance
#                 if hasattr(member, 'benovelent'):
#                     # Fetch benovelent contribution from the Benovelent model
#                     benovelent_contribution = member.benovelent.benov_amount
#                     # Fetch share contribution from the share model model
#                     share_contribution = member.share_amount.share_amount

#                     try:
#                         advance_loan_instances = AdvanceLoan.objects.filter(member=member, is_disbursed=True, is_repaid=False)
#                         if advance_loan_instances.exists():
#                             for advance_loan_instance in advance_loan_instances:
#                                 repaid_advance_amount = advance_loan_instance.borrowed_amount
#                                 repaid_advance_interest = advance_loan_instance.interest
#                         else:
#                             print("No matching AdvanceLoan instances found.")
#                     except AdvanceLoan.DoesNotExist:
#                         pass  # Handle the exception if needed

#                     # Check if advance loan is greater than zero
#                     if repaid_advance_amount > 0:
#                         # Set salary_advance_loan back to zero in the Member model
#                         member.clear_salary_advance_loan()

#                         # Set is_repaid to True in the AdvanceLoan model
#                         advance_loan_instance.approve_loan_repaid()

#                         # Create a transaction record for advance loan repayment
#                         Transaction.objects.create(
#                             member=member,
#                             activity_type='advance loan repayment',
#                             description="Advance Loan Repaid Successfully",
#                             debit=repaid_advance_amount,
#                             credit=0,
#                         )

#                         Transaction.objects.create(
#                             member=member,
#                             activity_type='advance loan interest',
#                             description="Advance Loan interest on repayment",
#                             debit=repaid_advance_interest,
#                             credit=0,
#                         )

#                     try:
#                         welfare_loan_instances = WelfareLoan.objects.filter(member=member, is_disbursed=True, is_repaid=False)
#                         for welfare_loan_instance in welfare_loan_instances:
                        
#                             reducing_table_entries = welfare_loan_instance.reducing_table.filter(
#                                 is_picked=False,
#                                 date_picked=None
#                             ).order_by('month')[:1]

#                             if reducing_table_entries.exists():
#                                 reducing_entry = reducing_table_entries[0]
                                
#                                 # Update reducing table entry
#                                 reducing_entry.is_picked = True
#                                 reducing_entry.date_picked = timezone.now().date()
#                                 reducing_entry.status = 'picked'
#                                 reducing_entry.save()

#                                 # Update member model and deduct from normal_loan and normal_loan_interest
#                                 member.deduct_from_normal_loan(reducing_entry.installment, reducing_entry.interest)

#                                 # Fetch or create the Payroll instance associated with the member
#                                 payroll_instance, created = Payroll.objects.get_or_create(member=member)

#                                 # Update payroll model and loan_wf from reducing table
#                                 payroll_instance.update_loan_wf_from_reducing_table(welfare_loan_instance)

#                                 print(f"Reducing Table Entry picked for Welfare Loan {welfare_loan_instance.loan_id}")

#                             else:
#                                 print(f"No suitable reducing table entry found for Welfare Loan {welfare_loan_instance.loan_id}")
#                                 # Fetch or create the Payroll instance associated with the member
#                                 payroll_instance, created = Payroll.objects.get_or_create(member=member)
                                
#                                 # Update loan_wf with zero
#                                 payroll_instance.loan_wf = 0
#                                 payroll_instance.save()

#                     except WelfareLoan.DoesNotExist:
#                         pass 

#                     # Update benovelent contribution for the member
#                     member.update_benovelent_contribution(benovelent_contribution)
#                     member.update_shares_contribution(share_contribution)
#                     member.update_welfare()

#                     # Create or update Payroll record
#                     payroll, created = Payroll.objects.get_or_create(member=member)
#                     payroll.full_name = member.personal_details.get_full_name()
#                     payroll.welfare = share_contribution
#                     payroll.benovelent = benovelent_contribution
#                     payroll.advance = repaid_advance_amount + repaid_advance_interest
#                     payroll.save()

#                     # Create a transaction record for benovelent contribution
#                     Transaction.objects.create(
#                         member=member,
#                         activity_type='benovelent',
#                         description="Benovelent Contribution Update",
#                         debit=0,
#                         credit=benovelent_contribution,
#                     )

#                     # Create a transaction record for shares contribution
#                     Transaction.objects.create(
#                         member=member,
#                         activity_type='shares',
#                         description="Shares Contribution Update",
#                         debit=0,
#                         credit=share_contribution,
#                     )
#                 else:
#                     # Handle the case where a Benovelent instance is not found
#                     print(f"No Benovelent instance found for Member {member.user.member_number}")

#             return redirect('admindashboard')
#     except Exception as e:
#         return HttpResponseServerError(f"An error occurred: {str(e)}")




logger = logging.getLogger(__name__)
def approve_contribution(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            member_id = data.get('member_id')

            if member_id is None:
                return JsonResponse({'error': 'Missing member_id in the request data'}, status=400)

        
            # Update share amount and approve the contribution
            with transaction.atomic():
                adjusted_contribution = AdjustedShareContributions.objects.get(member_id=member_id)
                
                adjusted_contribution.update_share_amount_with_new_amount()

                # Create a transaction record for the approved contribution
                Transaction.objects.create(
                    member=adjusted_contribution.member,
                    activity_type='contribution approved',
                    description='{adjusted_contribution.member.member_number} adjustment of share contribution approved.',
                    debit=0,
                    credit=adjusted_contribution.new_amount,
                )

            return JsonResponse({'message': 'Contribution approved successfully'})
        except AdjustedShareContributions.DoesNotExist:
            return JsonResponse({'error': 'AdjustedShareContributions not found for the given member_id'}, status=404)
        except Exception as e:
            # Log the exception details
            logger.error(f'An error occurred in approve_contribution: {str(e)}')
            return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)



################# ADMIN PROFILE PAGE VIEWS ###############
@login_required
def adminprofile(request):
    try:
        current_user = request.user
        name = current_user.username
        adminKey = current_user.member_number
        email = current_user.email
        last_login_utc = request.user.last_login

        if last_login_utc:
            # Check if last_login_utc has timezone information
            if last_login_utc.tzinfo is None or last_login_utc.tzinfo.utcoffset(last_login_utc) is None:
                last_login_utc = timezone.make_aware(last_login_utc, timezone.utc)

            # Convert UTC time to Nairobi time
            nairobi_tz = pytz.timezone('Africa/Nairobi')
            last_login_nairobi = last_login_utc.astimezone(nairobi_tz)
        else:
            last_login_nairobi = None
        current_path = request.path
        page_name = current_path.split('/')[-1]
        page_title_map = {
            'adminprofile': 'My Profile',
        }
        page_title = page_title_map.get(page_name, 'My Profile')
        context = {
            'page_title': page_title,
            'name': name,
            'adminKey':  adminKey,
            'email':email,
            'last_login': last_login_nairobi,
        }
        return render(request, 'adminprofile.html', context)
    
    except Member.DoesNotExist:
        return redirect('adminprofile')      



################# ADMIN APPROVALS PAGE VIEWS ###############
def adminapprovals(request):
    current_user = request.user
    name = current_user.username
    # Get the queryset of new accounts that are not approved yet
    new_accounts = CustomUser.objects.filter(
        Q(Q(is_approved=False) & ~Q(status='Rejected')) |
        Q(status='Blocked')
    )
    members_data = Member.objects.all()
    last_login_utc = request.user.last_login

    # Get the queryset of shares contributions 
    benovelent_contribution_schedules = Benovelent.objects.filter(is_approved=True)
    # Get the queryset of shares contributions 
    share_contribution_schedules = AdjustedShareContributions.objects.filter(is_approved=True)
    adjusted_contributions = AdjustedShareContributions.objects.filter(is_approved=False)
    # Fetch member transactions 
    transactions = Transaction.objects.filter()

    # Get advance loan unapproved requests 
    advance_loan_unapproved_requests =  AdvanceLoan.objects.filter(is_disbursed=False, status='pending')

    # Get welfare loan unapproved requests 
    welfare_loan_unapproved_requests =  WelfareLoan.objects.filter(is_disbursed=False, status='pending')

    # Get  benovelent claims unapproved requests 
    benevolent_claims =  BenevolentClaim.objects.filter(is_approved=False, status='pending')

    # Get running advance loan
    advance_loan_runnings = AdvanceLoan.objects.filter(is_disbursed=True, is_repaid=False, status='approved')

    # Get welfare loan unapproved requests 
    benovelent_contribution_schedules = Benovelent.objects.filter(is_approved=True)

    if last_login_utc:
        # Check if last_login_utc has timezone information
        if last_login_utc.tzinfo is None or last_login_utc.tzinfo.utcoffset(last_login_utc) is None:
            last_login_utc = timezone.make_aware(last_login_utc, timezone.utc)

        # Convert UTC time to Nairobi time
        nairobi_tz = pytz.timezone('Africa/Nairobi')
        last_login_nairobi = last_login_utc.astimezone(nairobi_tz)
    else:
        last_login_nairobi = None
    current_path = request.path
    page_name = current_path.split('/')[-1]
    page_title_map = {
        'approvals': 'Approvals',
    }
    page_title = page_title_map.get(page_name, 'User Management')
    
    context = {
        'page_title':  page_title,
        'name':name,
        'new_accounts': new_accounts,
        'members_data': members_data,
        'last_login': last_login_nairobi,
        'adjusted_contributions': adjusted_contributions,
        'share_contribution_schedules': share_contribution_schedules,
        'benovelent_contribution_schedules' :benovelent_contribution_schedules,
        'transactions':transactions,
        'advance_loan_unapproved_requests': advance_loan_unapproved_requests,
        'welfare_loan_unapproved_requests': welfare_loan_unapproved_requests,
        'benevolent_claims': benevolent_claims,
        'advance_loan_runnings' : advance_loan_runnings,
    }

    return render(request, 'approvals.html', context)



# GET USER DATA FOR APPROVAL AS MEMBERS
def get_member_details(request, member_id):
    try:
        member = Member.objects.get(id=member_id)
        member_details = {
            'full_name': member.personal_details.get_full_name() or 'No data provided',
            'username': member.personal_details.username or 'No data provided',
            'email': member.contact_details.email or 'No data provided',
            'member_number': member.user.member_number or 'No data provided',
            'phone_number': member.contact_details.phoneno or 'No data provided',
            'id_number': member.personal_details.idnumber or 'No data provided',
            'position': member.personal_details.position or 'No data provided',
            'gender': member.personal_details.gender or 'No data provided',
            'dob': member.personal_details.dob or 'No data provided',
            'county': member.contact_details.county or 'No data provided',
            'sub_county': member.contact_details.subcounty or 'No data provided',
            'ward': member.contact_details.ward or 'No data provided',
            'sublocation': member.contact_details.sublocation or 'No data provided',
        }
        if member.nominees.exists():
            nominee = member.nominees.first()
            member_details.update({
                'nameofdependant': nominee.nameofdependant or 'No data provided',
                'nominee_relationship': nominee.dependantrelationship or 'No data provided',
                'nominee_idnumber': nominee.dependantidnumber or 'No data provided',
                'nominee_contact': nominee.dependantcontact or 'No data provided',
            })
        else:
            member_details.update({
                'nameofdependant': 'No data provided',
                'nominee_relationship': 'No data provided',
                'nominee_idnumber': 'No data provided',
                'nominee_contact': 'No data provided',
            })
        if member.next_of_kin.exists():
            next_of_kin = member.next_of_kin.first()
            member_details.update({
                'nextofkin_name': next_of_kin.nameofnextofkin or 'No data provided',
                'nextofkin_relationship': next_of_kin.nextofkinrelationship or 'No data provided',
                'nextofkin_idnumber': next_of_kin.nextofkinidnumber or 'No data provided',
                'nextofkin_contact': next_of_kin.nextofkincontact or 'No data provided',
            })
        else:
            member_details.update({
                'nextofkin_name': 'No data provided',
                'nextofkin_relationship': 'No data provided',
                'nextofkin_idnumber': 'No data provided',
                'nextofkin_contact': 'No data provided',
            })
        return JsonResponse(member_details)
    except Member.DoesNotExist:
        return JsonResponse({'error': 'Member not found'}, status=404)



# APPROVE USER AS PVW MEMBER
def approve_member(request, member_id):
    try:
        member = Member.objects.get(id=member_id)
        user = member.user

        full_name = member.personal_details.get_full_name()
        member_number = member.user.member_number

        # Check if the user is not already approved and the current user is a staff member
        if request.user.is_staff and not user.is_approved:
            # Create AdjustedShareContributions instance if not already created
            adjusted_share_contributions, created = AdjustedShareContributions.objects.get_or_create(
                member=member,
                defaults={
                    'share_amount': 150,
                    'new_amount': 0,
                    'request_date': timezone.now(),
                    'is_approved': True,
                    'status': 'pending',
                    'posting_date': timezone.now()
                }
            )

            # Create Benovelent instance if not already created
            benovelent, created = Benovelent.objects.get_or_create(
                member=member,
                defaults={
                    'benov_amount': 250,
                    'is_approved': True,
                    'status': 'approved',
                    'posting_date': timezone.now()
                }
            )

            # Approve new member
            user.is_approved = True
            user.status = 'Approved'
            user.save()

            return JsonResponse({
                'success': f'Successfully approved {full_name} as a member of Parkside Villa Welfare Group with Member Number {member_number}',
                'full_name': full_name,
                'member_number': member_number,
            })
        elif request.user.is_staff and user.is_approved: 
            # Unblock existing member
            user.status = 'Approved'
            user.save()

            return JsonResponse({
                'success': f'Successfully unblocked {full_name} with Member Number {member_number}',
                'full_name': full_name,
                'member_number': member_number,
            })
        else:
            return JsonResponse({'error': 'Member is already approved or unauthorized'}, status=400)
    except Member.DoesNotExist:
        return JsonResponse({'error': 'Member not found'}, status=404)


# APPROVE USER AS PVW MEMBER
def reject_accountCreated_request(request, member_id):
    try:
        member = Member.objects.get(id=member_id)
        user = member.user

        # Check if the user is not already approved and the current user is a staff member
        if request.user.is_staff and not user.is_approved:
            full_name = member.personal_details.get_full_name()
            member_number = member.user.member_number

            # Reject the user
            user.is_approved = False
            user.status = 'Rejected'
            user.save()

            return JsonResponse({
                'success': f'Successfully approved {full_name} as a member of Parkside Villa Welfare Group with Member Number {member_number}',
                'full_name': full_name,
                'member_number': member_number,
            })
        else:
            return JsonResponse({'error': 'Member is already approved or unauthorized'}, status=400)
    except Member.DoesNotExist:
        return JsonResponse({'error': 'Member not found'}, status=404)



# GET USER LOAN DATA FOR ADVANCE LOAN APPROVAL
def get_advanceLoan_details(request, loan_id):
    try:
        borrowed_loan = AdvanceLoan.objects.get(loan_id=loan_id)
        borrowed_loan_details = {
            # applicants data
            'full_name': borrowed_loan.member.personal_details.get_full_name() or 'No data provided',
            'username': borrowed_loan.member.personal_details.username or 'No data provided',
            'email': borrowed_loan.member.contact_details.email or 'No data provided',
            'member_number': borrowed_loan.member.user.member_number or 'No data provided',
            'phone_number': borrowed_loan.member.contact_details.phoneno or 'No data provided',
            'id_number': borrowed_loan.member.personal_details.idnumber or 'No data provided',
            'position': borrowed_loan.member.personal_details.position or 'No data provided',
            'gender': borrowed_loan.member.personal_details.gender or 'No data provided',
            'dob': borrowed_loan.member.personal_details.dob or 'No data provided',
            'county': borrowed_loan.member.contact_details.county or 'No data provided',
            'sub_county': borrowed_loan.member.contact_details.subcounty or 'No data provided',
            'ward': borrowed_loan.member.contact_details.ward or 'No data provided',
            'sublocation': borrowed_loan.member.contact_details.sublocation or 'No data provided',

            # applicants guarantor data
            'guarantors': [],
           
            # Applicant's Assets Information
            'gross_salary': borrowed_loan.member.gross_salary or '0.00',
            'shares_contribution': borrowed_loan.member.shares_contribution or '0.00',
            'benovelent_contribution': borrowed_loan.member.benovelent_contribution or '0.00',
            'normal_loan': borrowed_loan.member.normal_loan or '0.00',
            'salary_advance_loan': borrowed_loan.member.salary_advance_loan or '0.00',

            # loan data
            'date_requested': borrowed_loan.date_requested or 'No data provided',
            'loan_id': borrowed_loan.loan_id or 'No data provided',
            'borrowed_amount': borrowed_loan.borrowed_amount or 'No data provided',
            'interest_rate': borrowed_loan.interest_rate or 'No data provided',
            'interest': borrowed_loan.interest or 'No data provided',
            'amount_to_be_paid': borrowed_loan.amount_to_be_paid or 'No data provided',
            'maturity_date': borrowed_loan.maturity_date or 'No data provided',
        }
       
        # Add guarantor data for each guarantor associated with the loan
        for guarantor in borrowed_loan.advance_guarantors.all():
            guarantor_data = {
                'full_name': guarantor.full_name,
                'member_number': guarantor.member_number,
                'id_number': guarantor.id_number,
                'phone_number': guarantor.phone_number,
                'signature_status': guarantor.get_signature_status_display(),
                'loan_type_guaranteed': guarantor.loan_type_guaranteed,
                'guaranteed_repaid': guarantor.guaranteed_repaid,
            }
            borrowed_loan_details['guarantors'].append(guarantor_data)

        return JsonResponse(borrowed_loan_details)
    except AdvanceLoan.DoesNotExist:
        return JsonResponse({'error': 'AdvanceLoan not found'}, status=404)


# REJECT ADVANCE LOAN
def reject_advanceLoan_request(request, loan_id):
    try:
        with transaction.atomic():
            borrowed_loan = AdvanceLoan.objects.get(loan_id=loan_id)

            # Check if the user is not already approved and the current user is a staff member
            if request.user.is_staff and borrowed_loan.status == "pending":
                # Reject Loan
                borrowed_loan.status = "rejected"
                borrowed_loan.save()

                # Create a transaction record for the loan rejection
                Transaction.objects.create(
                    member=borrowed_loan.member,
                    activity_type='loan rejection',
                    description=f'Advance Loan {borrowed_loan.loan_id} Rejected',
                    debit=borrowed_loan.borrowed_amount,  
                    credit=0,
                )

                return JsonResponse({
                    'success': f'Successfully rejected with Member Number for Advance Loan.',
                    'loan_id': borrowed_loan.loan_id,  
                    'member_number': borrowed_loan.member.user.member_number,
                    'full_name': borrowed_loan.member.personal_details.get_full_name(),
                })
            else:
                return JsonResponse({'error': 'Loan Application not found or is already approved'}, status=400)

    except AdvanceLoan.DoesNotExist:
        return JsonResponse({'error': 'AdvanceLoan not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)


# APPROVE ADVANCE LOAN AND DISBURSE TO BORROWER
def approve_advance_loan(request, loan_id):
    try:
        with transaction.atomic():
            borrowed_loan = AdvanceLoan.objects.get(loan_id=loan_id)

            # Check if the user is not already approved and the current user is a staff member
            if request.user.is_staff and borrowed_loan.status == "pending":
                # Approve Loan
                borrowed_loan.status = "approved"
                borrowed_loan.is_disbursed = True
                borrowed_loan.posting_date = timezone.now()
                borrowed_loan.approve_loan_disbursed()
                borrowed_loan.save()

                # Update Member's salary_advance_loan
                member = borrowed_loan.member
                member.update_salary_advance_loan(borrowed_loan.borrowed_amount)
                member.update_salary_advance_loan_interest(borrowed_loan.interest)
                member.save()

                # Create a transaction record for the loan approval
                Transaction.objects.create(
                    member=borrowed_loan.member,
                    activity_type='loan disbursed',
                    description=f'Advance Loan {borrowed_loan.loan_id} approved and disbursed',
                    debit=0,
                    credit=borrowed_loan.borrowed_amount,
                )

                return JsonResponse({
                    'success': f'Successfully approved Advance Loan.',
                    'loan_id': borrowed_loan.loan_id,
                    'member_number': borrowed_loan.member.user.member_number,
                    'full_name': borrowed_loan.member.personal_details.get_full_name(),
                })
            else:
                return JsonResponse({'error': 'Loan Application not found or is already approved'}, status=400)

    except AdvanceLoan.DoesNotExist:
        return JsonResponse({'error': 'AdvanceLoan not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)





# GET USER LOAN DATA FOR WELFARE LOAN APPROVAL
def get_welfareLoan_details(request, loan_id):
    try:
        borrowed_loan = WelfareLoan.objects.get(loan_id=loan_id)
        borrowed_loan_details = {
            # applicants data
            'full_name': borrowed_loan.member.personal_details.get_full_name() or 'No data provided',
            'username': borrowed_loan.member.personal_details.username or 'No data provided',
            'email': borrowed_loan.member.contact_details.email or 'No data provided',
            'member_number': borrowed_loan.member.user.member_number or 'No data provided',
            'phone_number': borrowed_loan.member.contact_details.phoneno or 'No data provided',
            'id_number': borrowed_loan.member.personal_details.idnumber or 'No data provided',
            'position': borrowed_loan.member.personal_details.position or 'No data provided',
            'gender': borrowed_loan.member.personal_details.gender or 'No data provided',
            'dob': borrowed_loan.member.personal_details.dob or 'No data provided',
            'county': borrowed_loan.member.contact_details.county or 'No data provided',
            'sub_county': borrowed_loan.member.contact_details.subcounty or 'No data provided',
            'ward': borrowed_loan.member.contact_details.ward or 'No data provided',
            'sublocation': borrowed_loan.member.contact_details.sublocation or 'No data provided',

            # applicants guarantor data
            'guarantors': [],
           
            # Applicant's Assets Information
            'gross_salary': borrowed_loan.member.gross_salary or '0.00',
            'shares_contribution': borrowed_loan.member.shares_contribution or '0.00',
            'benovelent_contribution': borrowed_loan.member.benovelent_contribution or '0.00',
            'normal_loan': borrowed_loan.member.normal_loan or '0.00',
            'salary_advance_loan': borrowed_loan.member.salary_advance_loan or '0.00',

            # loan data
            'date_requested': borrowed_loan.date_requested or 'No data provided',
            'loan_id': borrowed_loan.loan_id or 'No data provided',
            'borrowed_amount': borrowed_loan.borrowed_amount or 'No data provided',
            'interest_rate': borrowed_loan.interest_rate or 'No data provided',
            'duration': borrowed_loan.duration_months or 'No data provided',
            'installment': borrowed_loan.installment or 'No data provided',
            'interest': borrowed_loan.total_loan_interest or 'No data provided',
            'amount_to_be_paid': borrowed_loan.loan_amount_to_be_paid or 'No data provided',
            'maturity_date': borrowed_loan.loan_maturity_date or 'No data provided',

            # applicants reducing table info
            'reducingTables' : [],
        }
       
        # Add guarantor data for each guarantor associated with the loan
        for guarantor in borrowed_loan.welfare_guarantors.all():
            guarantor_data = {
                'full_name': guarantor.full_name,
                'member_number': guarantor.member_number,
                'id_number': guarantor.id_number,
                'phone_number': guarantor.phone_number,
                'signature_status': guarantor.get_signature_status_display(),
                'loan_type_guaranteed': guarantor.loan_type_guaranteed,
                'guaranteed_repaid': guarantor.guaranteed_repaid,
            }
            borrowed_loan_details['guarantors'].append(guarantor_data)

        # Add reducingTable data for each loan associated with the loan id
        for reducingTable in borrowed_loan.reducing_table.all():
            reducingTable_data = {
                'maturity_date': reducingTable.installment_maturity_date,
                'duration': reducingTable.month,
                'installment': reducingTable.installment,
                'interest_rate': 0.05,
                'interest': reducingTable.interest,
                'amount_due': reducingTable.amount_due,
                'status': reducingTable.status,
                'date_paid': reducingTable.date_picked,
            }
            borrowed_loan_details['reducingTables'].append(reducingTable_data) 

        return JsonResponse(borrowed_loan_details)
    except WelfareLoan.DoesNotExist:
        return JsonResponse({'error': 'WelfareLoan not found'}, status=404)


# REJECT WELFARE LOAN
def reject_welfareLoan_request(request, loan_id):
    try:
        with transaction.atomic():
            borrowed_loan = WelfareLoan.objects.get(loan_id=loan_id)

            # Check if the user is not already approved and the current user is a staff member
            if request.user.is_staff and borrowed_loan.status == "pending":
                # Reject Loan
                borrowed_loan.status = "rejected"
                borrowed_loan.save()

                # Update status to "rejected" in the associated ReducingTable entries
                reducing_tables = ReducingTable.objects.filter(welfare_loan=borrowed_loan)
                reducing_tables.update(status='rejected')
               
                # Create a transaction record for the loan rejection
                Transaction.objects.create(
                    member=borrowed_loan.member,
                    activity_type='loan rejection',
                    description=f'Welfare Loan {borrowed_loan.loan_id} Rejected',
                    debit=borrowed_loan.borrowed_amount,  
                    credit=0,
                )

                return JsonResponse({
                    'success': f'Successfully rejected with Member Number for Advance Loan.',
                    'loan_id': borrowed_loan.loan_id,  
                    'member_number': borrowed_loan.member.user.member_number,
                    'full_name': borrowed_loan.member.personal_details.get_full_name(),
                })
            else:
                return JsonResponse({'error': 'Loan Application not found or is already approved'}, status=400)

    except WelfareLoan.DoesNotExist:
        return JsonResponse({'error': 'WelfareLoan not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)


# APPROVE WELFARE LOAN AND DISBURSE TO BORROWER
def approve_welfare_loan(request, loan_id):
    try:
        with transaction.atomic():
            borrowed_loan =  WelfareLoan.objects.get(loan_id=loan_id)

            # Check if the user is not already approved and the current user is a staff member
            if request.user.is_staff and borrowed_loan.status == "pending":
                # Approve Loan
                borrowed_loan.status = "approved"
                borrowed_loan.is_disbursed = True
                borrowed_loan.posting_date = timezone.now()
                borrowed_loan.approve_loan_disbursed()
                borrowed_loan.save()

                # Update Member's welfare_loan
                member = borrowed_loan.member
                member.update_normal_loan(borrowed_loan.borrowed_amount)
                member.update_normal_loan_interest(borrowed_loan.total_loan_interest)
                member.save()

                # Update status to "rejected" in the associated ReducingTable entries
                reducing_tables = ReducingTable.objects.filter(welfare_loan=borrowed_loan)
                reducing_tables.update(status='granted')

                # Create a transaction record for the loan approval
                Transaction.objects.create(
                    member=borrowed_loan.member,
                    activity_type='loan disbursed',
                    description=f'Welfare Loan {borrowed_loan.loan_id} approved and disbursed',
                    debit=0,
                    credit=borrowed_loan.borrowed_amount,
                )

                return JsonResponse({
                    'success': f'Successfully approved Welfare Loan.',
                    'loan_id': borrowed_loan.loan_id,
                    'member_number': borrowed_loan.member.user.member_number,
                    'full_name': borrowed_loan.member.personal_details.get_full_name(),
                })
            else:
                return JsonResponse({'error': 'Loan Application not found or is already approved'}, status=400)

    except WelfareLoan.DoesNotExist:
        return JsonResponse({'error': 'WelfareLoan not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)








# GET USER BENEVOLENT CLAIM DETAILS
def get_benevolent_claim_details(request, id):
    try:
        benevolent_claim = BenevolentClaim.objects.get(id=id)

        # Initialize overall_balances_benevolent_award
        overall_balances_benevolent_award = {
            'total_welfare_benovelent_contribution_before': 0,
            'total_welfare_benovelent_contribution_after_benevolent_award': 0,
        }

        # Iterate through all members to accumulate sums
        all_members = Member.objects.all()
        for member in all_members:
            pass

        # Applicants data
        benevolent_claim_details = {
            # applicants data
            'full_name': benevolent_claim.member.personal_details.get_full_name() or 'No data provided',
            'username': benevolent_claim.member.personal_details.username or 'No data provided',
            'email': benevolent_claim.member.contact_details.email or 'No data provided',
            'member_number': benevolent_claim.member.user.member_number or 'No data provided',
            'phone_number': benevolent_claim.member.contact_details.phoneno or 'No data provided',
            'id_number': benevolent_claim.member.personal_details.idnumber or 'No data provided',
            'position': benevolent_claim.member.personal_details.position or 'No data provided',
            'gender': benevolent_claim.member.personal_details.gender or 'No data provided',
            'dob': benevolent_claim.member.personal_details.dob or 'No data provided',
            'county': benevolent_claim.member.contact_details.county or 'No data provided',
            'sub_county': benevolent_claim.member.contact_details.subcounty or 'No data provided',
            'ward': benevolent_claim.member.contact_details.ward or 'No data provided',
            'sublocation': benevolent_claim.member.contact_details.sublocation or 'No data provided',

            # applicants guarantor data
            'dependants': [],

            # Applicant's deceased Information under claim
            'deceasedInformations': [],
            'total_amount_awarded': 0,

            # Applicant's Assets Information
            'gross_salary': benevolent_claim.member.gross_salary or '0.00',
            'shares_contribution': benevolent_claim.member.shares_contribution or '0.00',
            'benovelent_contribution': benevolent_claim.member.benovelent_contribution or '0.00',
            'normal_loan': benevolent_claim.member.normal_loan or '0.00',
            'salary_advance_loan': benevolent_claim.member.salary_advance_loan or '0.00',

            # Overall balances for benevolent award
            'overall_balances_benevolent_award': overall_balances_benevolent_award,
        }

        # Add dependant data for each dependant associated with the loan
        for dependant in benevolent_claim.member.nominees.all():
            dependant_data = {
                'nameofdependant': dependant.nameofdependant,
                'dependantrelationship': dependant.dependantrelationship,
                'dependantidnumber': dependant.dependantidnumber,
                'dependantcontact': dependant.dependantcontact,
                'is_picked_status': dependant.is_picked,
                'is_deceased_status': dependant.is_deceased,
            }
            benevolent_claim_details['dependants'].append(dependant_data)

        # Add deceased information for each entry associated with the loan
        for deceased_information in benevolent_claim.deceased_information.all():
            deceased_information_data = {
                'deceased_name': deceased_information.deceased_name,
                'deceased_id_number': deceased_information.deceased_id_number,
                'relationship_with_member': deceased_information.relationship_with_member,
                'deceased_dob': deceased_information.deceased_dob,
                'deceased_date_of_death': deceased_information.deceased_date_of_death,
                'awarded_amount': deceased_information.awarded_amount,
                'is_claim_approved': deceased_information.is_claim_approved,
            }
            benevolent_claim_details['deceasedInformations'].append(deceased_information_data)

            # Update total_amount_awarded
            benevolent_claim_details['total_amount_awarded'] += deceased_information.awarded_amount

        # Check if WelfareStatistics instance exists
        welfare_statistics = WelfareStatistics.objects.first()
        total_amount_awarded = benevolent_claim_details['total_amount_awarded']

        # Use the model method to calculate overall balances
        if welfare_statistics:
            overall_balances_benevolent_award = welfare_statistics.calculate_overall_balances_benevolent_award(total_amount_awarded)
        else:
            overall_balances_benevolent_award = {
                'total_welfare_benovelent_contribution_before': 0,
                'total_welfare_benovelent_contribution_after_benevolent_award': 0,
            }

        # Add overall_balances_benevolent_award to benevolent_claim_details
        benevolent_claim_details['overall_balances_benevolent_award'] = overall_balances_benevolent_award

        return JsonResponse(benevolent_claim_details)
    except BenevolentClaim.DoesNotExist:
        return JsonResponse({'error': 'BenevolentClaim not found'}, status=404)






# APPROVE BENEVOLENT CLAIM AND DISBURSE TO CLAIMER
def approve_benevolent_claim(request, id):
    try:
        with transaction.atomic():
            benevolent_claim = BenevolentClaim.objects.get(id=id)

            # Check if the user is not already approved and the current user is a staff member
            if request.user.is_staff and not benevolent_claim.is_approved and benevolent_claim.agreement_checked:
                # Approve Benevolent Claim
                benevolent_claim.is_approved = True
                benevolent_claim.status = "approved"
                benevolent_claim.date_approved = timezone.now()
                benevolent_claim.save()

                # Update is_claim_approved for associated DeceasedInformation instances
                deceased_information_list = benevolent_claim.deceased_information.all()
                total_award_amount = sum(deceased_info.awarded_amount for deceased_info in deceased_information_list)

                for deceased_information in deceased_information_list:
                    deceased_information.is_claim_approved = True
                    deceased_information.save()

                # Update is_picked and is_deceased for associated Nominee instances
                nominee_list = benevolent_claim.member.nominees.filter(dependantidnumber__in=[info.deceased_id_number for info in deceased_information_list])
                for nominee in nominee_list:
                    nominee.is_picked = True
                    nominee.is_deceased = True
                    nominee.save()


                # Retrieve or create an instance of WelfareStatistics
                welfare_statistics, created = WelfareStatistics.objects.get_or_create(pk=1)

                # Update welfare_statistics balances
                welfare_statistics.welfare_benevolent_balance -= total_award_amount

                # Call the update_welfare_balances method
                welfare_statistics.update_welfare_balances_benevolent_award(welfare_statistics.welfare_benevolent_balance)    

                # Create a transaction record for the member
                Transaction.objects.create(
                    member=benevolent_claim.member,
                    activity_type='benevolent claim approved',
                    description=f'Benevolent Claim {benevolent_claim.id} approved and disbursed',
                    debit=0,
                    credit=total_award_amount,
                )    

                # Create a transaction record for the staff member approving the claim
                staff_user = request.user
                if staff_user.is_staff:
                    staff_member = get_or_create_member(staff_user)
                    staff_username = staff_user.email
                    Transaction.objects.create(
                        member=staff_member,
                        activity_type='benevolent claim approved by staff',
                        description=f'Benevolent Claim {benevolent_claim.id} approved by staff member {staff_username}',
                        debit=0,
                        credit=0,
                    )
                else:
                    # Handle the case where the user is not a staff member
                    return JsonResponse({'error': 'User is not a staff member'}, status=400)

                return JsonResponse({
                    'success': f'Successfully approved Welfare Loan.',
                    'id': benevolent_claim.id,
                    'member_number': benevolent_claim.member.user.member_number,
                    'full_name': benevolent_claim.member.personal_details.get_full_name(),
                })
            else:
                return JsonResponse({'error': 'Benevolent Claim Application not found or is already approved'}, status=400)

    except BenevolentClaim.DoesNotExist:
        return JsonResponse({'error': 'Benevolent Claim not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)



  
# REJECT BENEVOLENT CLAIM 
def reject_benevolentClaim_request(request, id):
    try:
        with transaction.atomic():
            benevolent_claim = BenevolentClaim.objects.get(id=id)

            # Check if the user is not already approved and the current user is a staff member
            if request.user.is_staff and not benevolent_claim.is_approved and benevolent_claim.agreement_checked:
                # Reject Benevolent Claim
                benevolent_claim.is_approved = False
                benevolent_claim.status = "rejected"
                benevolent_claim.date_rejected = timezone.now()
                benevolent_claim.save()

                # Create a transaction record for the benevolent claim rejection
                Transaction.objects.create(
                    member=benevolent_claim.member,
                    activity_type='benevolent claim rejected',
                    description=f'Benevolent Claim {benevolent_claim.id} rejected',
                    debit=0,
                    credit=0,
                )

                # Create a transaction record for the staff member rejecting the claim
                staff_user = request.user
                if staff_user.is_staff:
                    staff_member = get_or_create_member(staff_user)
                    staff_username = staff_user.email
                    Transaction.objects.create(
                        member=staff_member,
                        activity_type='benevolent claim rejection by staff',
                        description=f'Benevolent Claim {benevolent_claim.id} rejected by staff member {staff_username}',
                        debit=0,
                        credit=0,
                    )
                else:
                    # Handle the case where the user is not a staff member
                    return JsonResponse({'error': 'User is not a staff member'}, status=400)

                return JsonResponse({
                    'success': f'Successfully rejected benevolent claim.',
                    'id': benevolent_claim.id,
                    'member_number': benevolent_claim.member.user.member_number,
                    'full_name': benevolent_claim.member.personal_details.get_full_name(),
                })
            else:
                return JsonResponse({'error': 'Benevolent Claim not found or is already approved'}, status=400)

    except BenevolentClaim.DoesNotExist:
        return JsonResponse({'error': 'Benevolent Claim not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)






def block_account_request(request):
    if request.method == 'POST':
        member_number = request.POST.get('membernumberba')
        block_reason = request.POST.get('blockReason')
        
        # Retrieve the CustomUser instance based on the provided member number
        try:
            custom_user = CustomUser.objects.get(member_number=member_number)
            
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': f'User with member number {member_number} not found'}, status=404)

        # Retrieve the associated Member instance
        try:
            member = Member.objects.get(user=custom_user)
            
        except Member.DoesNotExist:
            return JsonResponse({'error': f'Member not found for user with member number {member_number}'}, status=404)

        # Retrieve the existing CustomUser record for the member
        custom_user_instance = CustomUser.objects.filter(member=member).first()

        if custom_user_instance:
            # Update the existing record
            custom_user_instance.is_approved = True
            custom_user_instance.status = 'Blocked'
            custom_user_instance.save()

        return redirect('login')

    return render(request, 'accounts.html')