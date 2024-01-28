from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import pytz
from django.shortcuts import get_object_or_404
from django.http import HttpResponseServerError
from django.utils import timezone
from authentication.models import CustomUser, Member, PersonalDetails, ContactDetails, Nominee, NextOfKin
from membersPortal.models import MailSmsVerificationCode
from backOffice.models import Transaction, Benovelent, AdjustedShareContributions, AdvanceLoan, WelfareLoan, ReducingTable, Guarantor, DeceasedInformation, BenevolentClaim
from django.contrib import messages
from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.views.decorators.http import require_GET
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ObjectDoesNotExist
import decimal 
from django.views.decorators.http import require_POST
from django.db.models import Q
import random
from django.core.mail import send_mail
from django.template.loader import render_to_string
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status
# from .serializers import MemberSerializer




#################### --------------------- DASHBOARD PAGE VIEW START ----------------- ##################


@login_required
def dashboard(request):
    try:
        member_instance = Member.objects.get(user=request.user)
        personal_details = member_instance.personal_details
        full_name = f"{personal_details.fname} {personal_details.onames}"
        current_user = request.user.member_number
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

        # Fetch transactions for the current user excluding 'benovelent' activity type
        transactions = Transaction.objects.filter(member=member_instance).exclude(activity_type='benovelent')
        
        # Calculate balances
        benovelent_balance = member_instance.benovelent_contribution
        shares_balance = member_instance.shares_contribution

        salary_advance_loan = member_instance.salary_advance_loan
        normal_loan = member_instance.normal_loan
        
        salary_advance_loan_interest = member_instance.salary_advance_loan_interest
        normal_loan_interest = member_instance.normal_loan_interest

        outstanding_loan_interest = salary_advance_loan_interest + normal_loan_interest
        outstanding_loan_principal = salary_advance_loan +  normal_loan

        current_path = request.path
        page_name = current_path.split('/')[-1]
        page_title_map = {
            'dashboard': 'My Dashboard',
        }
        page_title = page_title_map.get(page_name, 'DASHBOARD')
        context = {
            'page_title': page_title,
            'current_user': current_user,
            'last_login': last_login_nairobi,
            'full_name': full_name,
            'transactions': transactions,
            'benovelent_balance': benovelent_balance,
            'shares_balance': shares_balance,
            'outstanding_loan_principal' : outstanding_loan_principal,
            'outstanding_loan_interest' : outstanding_loan_interest,
        }
        return render(request, 'dashboard.html', context)
    except Member.DoesNotExist:
        return HttpResponseServerError("Member not found for the current user.")
    except Exception as e:
        return HttpResponseServerError(f"An error occurred: {str(e)}")




################# ---------------------PROFILE PAGE VIEWS --------------###############
@login_required
def profile(request):
    try:
        # Assuming you have a one-to-one relationship between User and Member
        member_instance = Member.objects.get(user=request.user)
        current_user_active = request.user.is_active
        personal_details = member_instance.personal_details

        full_name = f"{personal_details.fname} {personal_details.onames}"

        # current path track
        current_path = request.path
        page_name = current_path.split('/')[-1]
        page_title_map = {'profile': 'My Profile'}
        page_title = page_title_map.get(page_name, 'My Profile')

        # currently logged user data
        user = request.user
        member = user.member
        has_nominees = Nominee.objects.filter(member=member).exists()
        has_next_of_kin = NextOfKin.objects.filter(member=member).exists()

        # render data
        context = {
            'current_user': user,
            'full_name': full_name,
            'current_user_active': current_user_active,
            'page_title': page_title,
            'has_nominees': has_nominees,
            'has_next_of_kin': has_next_of_kin,
        }

        return render(request, 'profile.html', context)
    
    except Member.DoesNotExist:
        return redirect('profile')  




###################------------------------ ACCOUNTS PAGE VIEW START -----------------------#################
def accounts(request):
    try:    
        member_instance = Member.objects.get(user=request.user)
        current_user_active = request.user.is_active
        personal_details = member_instance.personal_details
        contact_details = member_instance.contact_details

        full_name = f"{personal_details.fname} {personal_details.onames}"
        member_position =  personal_details.position
        member_idno =  personal_details.idnumber
        phone_number = contact_details.phoneno
        residence = contact_details.residence


        # Fetch transactions for the current user excluding specific activity types
        transactions = Transaction.objects.filter(
            member=member_instance
        ).exclude(activity_type__in=['benovelent', 'share adjustment', 'contribution approved', 'loan rejection', 'loan submitted'])

        # Calculate balances
        share_amount = member_instance.share_amount.share_amount
        shares_balance = member_instance.shares_contribution

        salary_advance_loan = member_instance.salary_advance_loan
        normal_loan = member_instance.normal_loan
        salary_advance_loan_interest = member_instance.salary_advance_loan_interest
        normal_loan_interest = member_instance.normal_loan_interest

        advance_loan_repayable = salary_advance_loan +  salary_advance_loan_interest
        normal_loan_repayable = normal_loan +  normal_loan_interest

        outstanding_loan_interest = salary_advance_loan_interest + normal_loan_interest
        outstanding_loan_principal = salary_advance_loan +  normal_loan
    
        # Count share contributions
        share_contributions_count = transactions.filter(activity_type='shares').count()

        current_path = request.path
        page_name = current_path.split('/')[-1]
        page_title_map = {
            'accounts': 'My Accounts',
        }
        page_title = page_title_map.get(page_name, 'My Account')

        context = {
            'page_title':  page_title,
            'current_user_active': current_user_active,
            
            'full_name': full_name,
            'member_idno':  member_idno,
            'member_position': member_position,
            'residence':residence,
            'phone_number':phone_number,

            'current_user': request.user,
            'share_amount': share_amount,
            'shares_balance': shares_balance,
            'salary_advance_loan': salary_advance_loan,
            'normal_loan': normal_loan,
            'salary_advance_loan_interest': salary_advance_loan_interest,
            'advance_loan_repayable' :  advance_loan_repayable,
            'normal_loan_repayable' :  normal_loan_repayable,
            'normal_loan_interest': normal_loan_interest,
            'share_contributions_count': share_contributions_count,
            'outstanding_loan_interest' :  outstanding_loan_interest,
            'outstanding_loan_principal' : outstanding_loan_principal,
            'page_title': page_title,
            'transactions': transactions,
        }

        return render(request, 'accounts.html', context)

    except Member.DoesNotExist:
            return redirect('accounts') 




################# ---------LOAN PAGE AND PROCESSES VIEWS START---------#################
    

@login_required
def loans(request):
    try:
        member_instance = Member.objects.get(user=request.user)
        current_user = request.user.member_number
        personal_details = member_instance.personal_details
        contact_details = member_instance.contact_details

        full_name = f"{personal_details.fname} {personal_details.onames}"
        id_number_number = request.user.member_number
        member_position = personal_details.position
        member_idno = personal_details.idnumber
        phone_number = contact_details.phoneno
        residence = contact_details.sublocation

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
            'loans': 'My Loans',
        }
        page_title = page_title_map.get(page_name, 'My Loans')

        # Fetch guarantor information for the user
        user_guarantors = Guarantor.objects.filter(
            member_number=current_user,
            guaranteed_repaid=False,
            # signature_status__in=['Pending', 'Accepted', 'Rejected']
            )
        
        # Fetch the latest verification codes for the receiver user where is_picked is False and is_expired is False
        verification_codes = MailSmsVerificationCode.objects.filter(
            is_picked=False,
            expired=False
        )
    
        # Print the verification codes for debugging
        print("Fetched Verification Codes:")
        for code in verification_codes:
            print(f"Picked: {code.is_picked}, Expired: {code.expired}, Code: {code.code}, Purpose: {code.code_purpose}, Sender Member: {code.sender_member}, Receiver Member: {code.receiver_member}")

        # Fetch advance Loan for the user
        advanceloans = AdvanceLoan.objects.filter(
            member=member_instance, is_repaid=False, is_disbursed=True
        )

        # Fetch welfare Loan for the user
        welfareloans = WelfareLoan.objects.filter(
            member=member_instance, is_repaid=False, is_disbursed=True, status='approved'
        )
        
        reducing_tabless = ReducingTable.objects.filter(
            welfare_loan__in=welfareloans,
            status__in=['granted', 'picked']
        )

        # Combine transactions and reducing_tabless data
        combined_data = list(advanceloans) + list(welfareloans)
        # Sort the combined data by posting_date
        combined_data.sort(key=lambda x: x.posting_date, reverse=True)

        # Fetch advance Loan for the user
        runningAdvanceLoans = AdvanceLoan.objects.filter(
            member=member_instance,
            is_repaid=False,
            amount_to_be_paid__gt=0,
            status__in=['pending', 'approved', 'partialPaid', 'pendingPayment']
        )

        # Fetch Welfare Loans where is_repaid is False and amount_to_be_paid is greater than zero
        runningWelfareLoans = WelfareLoan.objects.filter(
            member=member_instance,
            is_repaid=False,
            loan_amount_to_be_paid__gt=0,
            status__in=['pending', 'approved', 'partialPaid', 'pendingPayment']
        )

        context = {
            'page_title': page_title,
            'current_user': current_user,
            'last_login': last_login_nairobi,
            'full_name': full_name,
            'id_number_number': id_number_number,
            'member_position': member_position,
            'member_idno': member_idno,
            'phone_number': phone_number,
            'residence': residence,
            'advanceloans': advanceloans,
            'welfareloans': welfareloans,
            'reducing_tabless': reducing_tabless,
            'combined_data': combined_data,
            'runningAdvanceLoans': runningAdvanceLoans,
            'runningWelfareLoans': runningWelfareLoans,
            'user_guarantors': user_guarantors, 
            'verification_codes':verification_codes
        }
        return render(request, 'loans.html', context)
    except Member.DoesNotExist:
        return HttpResponseServerError("Member not found for the current user.")
    except Exception as e:
        return HttpResponseServerError(f"An error occurred: {str(e)}")


@require_GET
def check_LoanAmountMax(request, loanAmount):
    try:
        # Assuming the request user is associated with the Member model
        member = request.user.member

        # Convert shares_saved to float before performing multiplication
        shares_saved_float = float(member.shares_contribution)

        # Calculate the maximum loan amount based on shares saved
        max_loan_amount = 4 * shares_saved_float

        # Check if the requested loan amount exceeds the maximum
        if float(loanAmount) > max_loan_amount:
            return JsonResponse({'error': 'Requested loan amount exceeds maximum allowable. Please try entering a lower amount and try again.'})

    except Member.DoesNotExist:
        # If the Member does not exist, set is_loan_eligible to False
        return JsonResponse({'error': 'Member does not exist or is not eligible for a loan.'})

    # If the loan amount is eligible, return an empty response (200 OK)
    return JsonResponse({})


# View to get guarantor info 
@login_required
def get_guarantor_info(request, member_number):
    try:
        with transaction.atomic():
            user = get_object_or_404(CustomUser, member_number=member_number, is_approved=True, is_superuser=False, status="Approved")

            # Calculate share contribution and loan amount
            share_contribution = float(request.user.member.shares_contribution)
            loan_amount = float(request.GET.get('loan_amount', 0))

            # Check for self-guarantorship
            is_self_guarantorship = False
            if request.user.member_number == member_number:
                if loan_amount > share_contribution * 0.9:
                    return JsonResponse({'status': 'not self guarantorship'})
                else:
                    is_self_guarantorship = True

            # Check if the provided member number has guaranteed more than two loans
            num_active_guarantees = Guarantor.objects.filter(
                Q(member_number=member_number) & ~Q(guaranteed_repaid=True)
            ).count()

            if num_active_guarantees >= 2 and not is_self_guarantorship:
                return JsonResponse({'status': 'maximum limit'})

            # Fetch personal, contact details and prepare response data
            personal_details = PersonalDetails.objects.get(member__user=user)
            contact_details = ContactDetails.objects.get(member__user=user)

            response_data = {
                'member_number': user.member_number,
                'full_name': f"{personal_details.surname} {personal_details.fname} {personal_details.onames}",
                'id_number': personal_details.idnumber,
                'phone_number': contact_details.phoneno,
                'is_self_guarantorship': is_self_guarantorship
            }
            return JsonResponse(response_data)
        
    # Handle specific exception and general exceptions: User not found   
    except CustomUser.DoesNotExist:
        return render(request, '404.html')
    except Exception as e:
        print(f"Error: {str(e)}")
        response_data = {'error': str(e)}
        return JsonResponse(response_data, status=500)



def filter_schedules(request):
    # Extract form data
    member_filter = request.POST.get('member_filter')
    member_number = request.POST.get('member_number')
    start_date = request.POST.get('start_date')
    end_date = request.POST.get('end_date')
    
    print(member_filter)
    print(member_number)
    print(start_date)
    print(end_date)
   

    # Return the filtered data as JSON
    return JsonResponse({'html': render_to_string('partial_approvals.html', {})})


def generate_guarantorship_verification_code(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        guarantor_id_number = data.get('guarantorIdNumber', '')

        # Find the PersonalDetails instance associated with the guarantor_id_number
        try:
            personal_details = PersonalDetails.objects.get(idnumber=guarantor_id_number)
        except PersonalDetails.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'PersonalDetails not found'})

        # Now, you can access the associated Member instance through the related_name
        guarantor = personal_details.member

        # Get the member code sender (request user)
        member_code_sender = request.user.member

        # Generate a verification code using the VerificationCode model
        verification_instance = MailSmsVerificationCode.generate_unique_code(member_code_sender, guarantor, 'guarantorship_verification')

        # Check if the guarantor has an email
        if guarantor.user.email:
            # Get full name of the sender
            sender_full_name = request.user.member.personal_details.get_full_name()
            # Send email to the guarantor
            subject = 'Guarantorship Verification Code'
            message = f'Dear {guarantor.user.username},\n\n {sender_full_name} has nominated you as a guarantor for Loan. By sharing this code {verification_instance.code} you consent to providing and processing of your personal data and agree to the terms & conditions as listed at Parkside Villa Welfare Group.'
            from_email = 'pvwgtestmail@hamiscodecraft.co.ke'
            recipient_list = [guarantor.user.email]

            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
        else:
            return JsonResponse({'status': 'error', 'message': 'Guarantor has no email'})

        return JsonResponse({'status': 'success', 'verification_code': verification_instance.code})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def verify_mail_sms_code(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            entered_code = data.get('code', '')

            if not entered_code or not isinstance(entered_code, str) or len(entered_code) != 6:
                return JsonResponse({'status': 'error', 'message': 'Invalid or missing verification code'})
            
            try:
                # Retrieve the verification code from the database
                verification_code = MailSmsVerificationCode.objects.get(code=entered_code)
          
                # Check if the code is expired or already picked
                if verification_code.expired or verification_code.is_picked:
                    return JsonResponse({'status': 'error', 'is_valid': False, 'is_expired': verification_code.expired, 'is_picked': False})

                # Mark the code as picked
                verification_code.is_picked = True
                verification_code.save()

                return JsonResponse({'status': 'success', 'is_valid': True, 'is_expired': False, 'is_picked': False})
            except MailSmsVerificationCode.DoesNotExist:
                return JsonResponse({'status': 'error', 'is_valid': False, 'is_expired': False, 'is_picked': False})
        except json.decoder.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


# Loan submission model
def handle_loan_submission(request):
    if request.method == 'POST':
        try:
            loan_data = json.loads(request.body)

            # Extracting relevant data form loanFromData
            idnumber = loan_data['personalDetails']['id_number']
            borrowed_amount = loan_data['loanDetails']['loan_amount']
            loan_purpose = loan_data['loanDetails']['loan_purpose']
            is_advance_loan = loan_data['loanDetails']['loanType']['advanceLoan']
            is_welfare_loan = loan_data['loanDetails']['loanType']['normalLoan']

            try:
                personal_details = PersonalDetails.objects.get(idnumber=idnumber)
                member = personal_details.member

                # Check for disbursed and not repaid loans
                has_disbursed_loan = member.advance_loans.filter(is_disbursed=True, is_repaid=False).exists() or \
                                    member.welfare_loans.filter(is_disbursed=True, is_repaid=False).exists()

                if has_disbursed_loan:
                    return JsonResponse({'error': 'User already has a disbursed loan. Cannot submit a new loan.'}, status=400)

                # Check for pending loan application
                pending_loan_application = member.advance_loans.filter(is_disbursed=False, is_repaid=False, status='pending').exists() or \
                                        member.welfare_loans.filter(is_disbursed=False, is_repaid=False, status='pending').exists()

                if pending_loan_application:
                    return JsonResponse({'error': 'User already has a pending loan application. Please wait for approval.'}, status=400)

            except PersonalDetails.DoesNotExist:
                # Handle the case where PersonalDetails with the given idnumber doesn't exist
                return JsonResponse({'error': 'User not found.'}, status=404)
            
            duration_months = None
            interest_rate = None

            # Check if 'loanDetails' key exists in loan_data and contains the necessary fields
            loan_details = loan_data.get('loanDetails')
            if not loan_details:
                return JsonResponse({'error': 'Invalid or missing loan details'}, status=400)
            # Get PersonalDetails instance using the 'idnumber'
            try:
                personal_details = PersonalDetails.objects.get(idnumber=idnumber)
            except PersonalDetails.MultipleObjectsReturned:
                # If multiple instances exist, use the first one
                personal_details = PersonalDetails.objects.filter(idnumber=idnumber).first()
                
            # Get or create Member instance using the 'personal_details' field
            member, created = Member.objects.get_or_create(
                personal_details=personal_details
            )
            
            # handle advance loan
            if is_advance_loan:
                # Create AdvanceLoan instance
                advance_loan = AdvanceLoan(
                    member=member,
                    static_loan_borrowed_amount=borrowed_amount,
                    borrowed_amount=borrowed_amount,
                    date_requested=timezone.now().date(),
                    loan_id='',
                    loan_purpose=loan_purpose,
                )
                advance_loan.save()
                # Create advance loan guarantor instance
                guarantor_data = loan_data.get('guarantors')
                if guarantor_data:
                    # Assuming guarantor_data is a list of dictionaries
                    for guarantor in guarantor_data:
                        guarantor_member_number = guarantor.get('member_number')
                        guarantor_status = guarantor.get('status')
                        guarantor_full_name = guarantor.get('full_name')
                        guarantor_id_number = guarantor.get('id_number')
                        guarantor_phone_number = guarantor.get('phone_number')
                        # Create Guarantor instance for AdvanceLoan
                        advance_loan_guarantor = Guarantor(
                            advance_loan=advance_loan,
                            member_number=guarantor_member_number,
                            signature_status=guarantor_status,
                            full_name=guarantor_full_name,
                            id_number=guarantor_id_number,
                            phone_number=guarantor_phone_number,
                            loan_type_guaranteed='Advance',
                        )
                        advance_loan_guarantor.save()
                # Create a transaction record for the loan submission
                Transaction.objects.create(
                    member=member,
                    activity_type='loan submitted',
                    description=f'Advance Loan request submitted for {loan_purpose}',
                    debit=0,
                    credit=borrowed_amount,
                )
                return JsonResponse({'success': True, 'message': 'Advance Loan submitted successfully!'})

            # handle welfare loan
            elif is_welfare_loan:
                repayment_period = loan_data['loanDetails'].get('repayment_period')
                monthly_installment = loan_data['loanDetails'].get('monthly_installment')
                # Check if repayment_period or monthly_installment is None or empty string
                if repayment_period is None or monthly_installment is None:
                    return JsonResponse({'error': 'Invalid or missing repaymentPeriod or installment'}, status=400)
               
                # Convert to integers
                try:
                    duration_months = int(repayment_period)
                    monthly_installment_value = Decimal(str(monthly_installment))
                    interest_rate = Decimal(0.05)
                except ValueError:
                    return JsonResponse({'error': 'Invalid values for repaymentPeriod or installment'}, status=400)
            
                # Additional check for positive values
                if Decimal(str(duration_months)) <= 0 or Decimal(str(monthly_installment_value)) <= 0:
                    return JsonResponse({'error': 'Invalid duration_months or installment values'}, status=400)
              
                # Create WelfareLoan instance
                welfare_loan = WelfareLoan(
                    member=member,
                    loan_id='',
                    date_requested=timezone.now().date(),
                    static_loan_borrowed_amount=borrowed_amount,
                    borrowed_amount=borrowed_amount,
                    loan_purpose=loan_purpose,
                    interest_rate=interest_rate,
                    duration_months=duration_months,
                    installment = monthly_installment_value,
                    is_disbursed=False,
                    posting_date=timezone.now().date(),
                )
                welfare_loan.save()
                    
                # Create welfare loan guarantor instance
                guarantor_data = loan_data.get('guarantors')
               
                if guarantor_data:
                    # Assuming guarantor_data is a list of dictionaries
                    for guarantor in guarantor_data:
                        guarantor_member_number = guarantor.get('member_number')
                        guarantor_status = guarantor.get('status')
                        guarantor_full_name = guarantor.get('full_name')
                        guarantor_id_number = guarantor.get('id_number')
                        guarantor_phone_number = guarantor.get('phone_number')
                        # Create Guarantor instance for WelfareLoan
                        welfare_loan_guarantor = Guarantor(
                            welfare_loan=welfare_loan,
                            member_number=guarantor_member_number,
                            signature_status=guarantor_status,
                            full_name=guarantor_full_name,
                            id_number=guarantor_id_number,
                            phone_number=guarantor_phone_number,
                            loan_type_guaranteed='Normal',
                        )
                        welfare_loan_guarantor.save()
                   
                # Generate reducing table
                welfare_loan.generate_reducing_table()   
                 
                # Create a transaction record for the loan submission
                Transaction.objects.create(
                    member=member,
                    activity_type='loan submitted',
                    description=f'Welfare Loan request submitted for {loan_purpose}',
                    debit=0,
                    credit=borrowed_amount,
                )
                return JsonResponse({'success': True, 'message': 'Normal Loan submitted successfully!'})
            
            else:
                return JsonResponse({'error': 'At least advance or normal Loan must be checked, both cannot be false'})

        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


# advance loan repayment
@login_required
def advanceLoan_repayment(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        loan_id = data.get('loan_id')
        repayment_amount = data.get('full_amount')

        # Ensure that the loan belongs to the requesting user
        try:
            advLoan = request.user.member.advance_loans.get(
                loan_id=loan_id,
                is_repaid=False,
                status__in=['partialPaid', 'approved'],
                is_disbursed=True,
                amount_to_be_paid__gt=0,
            )

        except AdvanceLoan.DoesNotExist:
            return JsonResponse({'status': 'Loan not found'})
        
        # Update the status to "pendingPayment" for full repayment
        if advLoan.amount_to_be_paid == repayment_amount:
            advLoan.status = 'pendingPayment'
            advLoan.userRepayableRequest = repayment_amount
            advLoan.save()
        else:
            advLoan.status = 'partialPaid'
            advLoan.userRepayableRequest = repayment_amount
            advLoan.save() 

        # Return response with guarantors' information
        response_data = {
            'status': 'success',
            'message': 'Full repayment request submitted',
        }
        return JsonResponse(response_data)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


# @login_required
# def advanceLoan_fully_repayment(request):
#     if request.method == 'POST':
#         data = json.loads(request.body.decode('utf-8'))
#         loan_id = data.get('loan_id')
#         fully_repayment_amount = data.get('full_amount')

#         # Ensure that the loan belongs to the requesting user
#         try:
#             advLoan = request.user.member.advance_loans.get(
#                 loan_id=loan_id,
#                 is_repaid=False,
#                 status="approved",
#                 is_disbursed=True,
#                 amount_to_be_paid__gt=0
#             )

#         except AdvanceLoan.DoesNotExist:
#             return JsonResponse({'status': 'Loan not found'})

#         # Retrieve all guarantors associated with the advLoan
#         guarantors = advLoan.get_guarantors()

#         # Prepare guarantors' information
#         guarantors_info = []
#         for guarantor in guarantors:
#             guarantor_info = {
#                 'full_name': guarantor.full_name,
#                 'member_number': guarantor.member_number,
#                 'id_number': guarantor.id_number,
#                 'phone_number': guarantor.phone_number,
#                 'signature_status': guarantor.get_signature_status_display(),
#                 'loan_type_guaranteed': guarantor.loan_type_guaranteed,
#                 'guaranteed_repaid': guarantor.guaranteed_repaid
#             }
#             guarantors_info.append(guarantor_info)

#         print(guarantors_info)    

#         # Return response with guarantors' information
#         response_data = {
#             'status': 'success',
#             'message': 'Full repayment request submitted',
#         }
#         return JsonResponse(response_data)

#     return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

  



# MONTHLY SHARE ADJUSTMENT VIEWS START


# SHARE ADJUSTMENT PIN CHECK
@login_required
def checkPinForShareAdjustment(request):
    user = request.user

    if request.method == 'POST':
        try:
            member_number_toAdjustShares = request.POST.get('memberNumbersa')
            shareAmountToAdjust = request.POST.get('adjustContributions_amount')
         
            # Retrieve the user for share Amount To Adjust
            shareAmountToAdjust_user = CustomUser.objects.get(member_number=member_number_toAdjustShares)
            user_current_share_contributions = user.member.share_amount.share_amount 

            pin = request.POST.get('pin')

            # Check if the entered PIN matches the user's password
            if user.check_password(pin):
                # Construct the confirmation message with recipient's username and share amount
                confirmation_message = f'Are you sure you want to change your monthly share contributions from {user_current_share_contributions} to {shareAmountToAdjust} ?'

                return JsonResponse({'correct': True, 'confirmation_message': confirmation_message})
            else:
                return JsonResponse({'error': False, 'incorrect_pin': 'Incorrect PIN'})

        except ObjectDoesNotExist:
            return JsonResponse({'error': False, 'error': 'Recipient user does not exist'})

    else:
        return JsonResponse({'status': 'error'})
    

# HADDNLE SHARE ADJUSTMENT SUBMISSION
def Submit_Share_Adjustment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)['adjustedShareAmountForm']
            member_number = data['memberNumbersa']

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

            # Retrieve the existing AdjustedShareContributions record for the member
            adjusted_share = AdjustedShareContributions.objects.filter(member=member).first()

            # user current share contributions
            user = request.user
            user_current_share_contributions = user.member.share_amount.share_amount 

            if adjusted_share:
                # Update the existing record
                adjusted_share.share_amount = adjusted_share.share_amount
                adjusted_share.new_amount = data['adjustContributions_amount']
                adjusted_share.is_approved = False
                adjusted_share.status = 'pending'
                adjusted_share.save()
            else:
                # If no record exists, create a new one
                adjusted_share = AdjustedShareContributions.objects.create(
                    member=member,
                    share_amount=member.shares_contribution,
                    new_amount=data['adjustContributions_amount'],
                    is_approved=False,
                    status='pending'
                )

            # Create a transaction record for the share adjustment
            with transaction.atomic():
                Transaction.objects.create(
                    member=member,
                    activity_type='share adjustment',
                    description=f'Share contribution adjustment request of {data["adjustContributions_amount"]}',
                    debit=0,  
                    credit=data['adjustContributions_amount'],  
                )

            return JsonResponse({'status': 'success', 'old_amount': user_current_share_contributions, 'new_amount': adjusted_share.new_amount})
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)



# def Submit_Share_Adjustment(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)['adjustedShareAmountForm']
#             member_number = data['memberNumbersa']
           
#             # Retrieve the CustomUser instance based on the provided member number
#             try:
#                 custom_user = CustomUser.objects.get(member_number=member_number)
              
#             except CustomUser.DoesNotExist:
#                 return JsonResponse({'error': f'User with member number {member_number} not found'}, status=404)

#             # Retrieve the associated Member instance
#             try:
#                 member = Member.objects.get(user=custom_user)
              
#             except Member.DoesNotExist:
#                 return JsonResponse({'error': f'Member not found for user with member number {member_number}'}, status=404)

#             # Retrieve the existing AdjustedShareContributions record for the member
#             adjusted_share = AdjustedShareContributions.objects.filter(member=member).first()

#             if adjusted_share:
#                 # Update the existing record
#                 adjusted_share.share_amount = adjusted_share.share_amount
#                 adjusted_share.new_amount = data['adjustContributions']
#                 adjusted_share.is_approved = False 
#                 adjusted_share.status = 'pending'
#                 adjusted_share.save()
#             else:
#                 # If no record exists, create a new one
#                 adjusted_share = AdjustedShareContributions.objects.create(
#                     member=member,
#                     share_amount=member.shares_contribution,
#                     new_amount=data['adjustContributions'],
#                     is_approved=False, 
#                     status='pending'
#                 )

#             return JsonResponse({'status': 'success'})
#         except json.JSONDecodeError as e:
#             return JsonResponse({'error': 'Invalid JSON format'}, status=400)

#     return JsonResponse({'error': 'Invalid request method'}, status=405)



# @csrf_exempt
# def Submit_Share_Adjustment(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)['adjustedShareAmountForm']
#             print(data)
#             member_number = data['memberNumbersa']
#             print(member_number)
#             # Retrieve the CustomUser instance based on the provided member number
#             try:
#                 custom_user = CustomUser.objects.get(member_number=member_number)
#                 print(custom_user)
#             except CustomUser.DoesNotExist:
#                 return JsonResponse({'error': f'User with member number {member_number} not found'}, status=404)

#             # Retrieve the associated Member instance
#             try:
#                 member = Member.objects.get(user=custom_user)
#                 print(member)
#             except Member.DoesNotExist:
#                 return JsonResponse({'error': f'Member not found for user with member number {member_number}'}, status=404)

#             # Update the existing record if it exists
#             adjusted_share, created = AdjustedShareContributions.objects.get_or_create(
#                 member=member,
#                 defaults={
#                     'share_amount': member.shares_contribution,  
#                     'new_amount': data['adjustContributions'],
#                     'is_approved': False,
#                     'status': 'pending'
#                 }
#             )

#             print('datasaved')
           
#             return JsonResponse({'status': 'success'})
#         except json.JSONDecodeError as e:
#             return JsonResponse({'error': 'Invalid JSON format'}, status=400)

#     return JsonResponse({'error': 'Invalid request method'}, status=405)







# SHARE TRANSFER PIN CHECK
@login_required
def checkPinForShareTransfer(request):
    user = request.user

    if request.method == 'POST':
        try:
            recipient_member_number = request.POST.get('membernumberst')
            shareAmountToTransfer = request.POST.get('shareAmountToTransfer')

            # Check if the entered PIN matches the user's password
            pin = request.POST.get('pin')
            if not user.check_password(pin):
                return JsonResponse({'correct': False, 'error': 'Incorrect PIN. Please enter the correct PIN and try again.'})

            # Retrieve the recipient user based on the member number
            try:
                recipient_user = CustomUser.objects.get(member_number=recipient_member_number)
            except ObjectDoesNotExist:
                return JsonResponse({'correct': False, 'error': 'The recipient user does not exist. Please check the member number and try again.'})

            # Check if recipient is the same as the requesting user
            if recipient_user == user:
                return JsonResponse({'correct': False, 'error': 'PVW Cannot complete the transfer because both parties are of the same member number.'})

            # Construct the confirmation message with recipient's username and share amount
            confirmation_message = f'Are you sure you want to Transfer {shareAmountToTransfer} shares to {recipient_user.username} ?'

            return JsonResponse({'correct': True, 'sameUser': False, 'confirmation_message': confirmation_message})

        except Exception as e:
            # Handle other exceptions if necessary
            return JsonResponse({'correct': False, 'error': str(e)})

    else:
        return JsonResponse({'status': 'error'})







def transfer_shares(request):
    user = request.user
    shareBalance = Member.objects.get(user=user)
    sender_shareBalance = shareBalance.shares_contribution

    if request.method == 'POST':
        sender_member_number = user.member_number
        recipient_member_number = request.POST.get('membernumberst')
        shareAmountToTransfer = decimal.Decimal(request.POST.get('shareAmountToTransfer'))  
        reason_for_shareTransfer = request.POST.get('transferReason', '')

        try:
            sender_user = CustomUser.objects.get(member_number=sender_member_number)
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'Invalid Sender'})

        try:
            recipient_user = CustomUser.objects.get(member_number=recipient_member_number)
        except CustomUser.DoesNotExist:
            print("Invalid Receiver")
            return JsonResponse({'error': 'Invalid Receiver'})

        if sender_member_number == recipient_member_number or sender_user == recipient_user:
            return JsonResponse({'error': 'Failed. Cannot complete this operation. Both parties of the transaction are the same identity. For more information contact the administrator.'})

        with transaction.atomic():
            if sender_shareBalance >= shareAmountToTransfer:
                recipient_member = Member.objects.get(user=recipient_user)
                recipient_shareBalance = recipient_member.shares_contribution

                sender_shareBalance -= shareAmountToTransfer
                recipient_shareBalance += shareAmountToTransfer

                shareBalance.shares_contribution = sender_shareBalance
                recipient_member.shares_contribution = recipient_shareBalance

                shareBalance.save()
                recipient_member.save()

                return JsonResponse({'success': 'Transfer was successful!'})
            else:
                return JsonResponse({'error': 'Insufficient Share balance'})

    return JsonResponse({'error': 'Invalid request'})



# GET USER DEPENDANTS/NOMINEE DATA FOR BENEVOLENT CLAIM
def get_deceased_information_details(request):
    try:
        with transaction.atomic():
            deceased_information_list = Nominee.objects.filter(member=request.user.member, is_picked=False).all()
        
        if not deceased_information_list.exists():
            return JsonResponse({'error': 'Nominee Information not found'}, status=404)

        deceased_information_details = {
            'deceasedInformationData': [],
        }

        for deceased_information in deceased_information_list:
            deceased_data = {
                'nameofdependant': deceased_information.nameofdependant,
                'dependantrelationship': deceased_information.dependantrelationship,
                'dependantidnumber': deceased_information.dependantidnumber,
                'dependantcontact': deceased_information.dependantcontact,
                'is_deceased': deceased_information.is_deceased,
            }

            deceased_information_details['deceasedInformationData'].append(deceased_data)

        return JsonResponse(deceased_information_details)

    except Nominee.DoesNotExist:
        return JsonResponse({'error': 'Nominee Information not found'}, status=404)
    except Exception as e:
        # Handle other exceptions and return the same JSON response
        return JsonResponse({'error': 'Nominee Information not found'}, status=404)

    

# UPDATE IS DECEASED FOR BENEVOLENT CLAIM
def update_is_deceased(request, nominee_id):
    nominee = get_object_or_404(Nominee,  dependantidnumber=nominee_id)
    
    if request.method == 'POST':
        is_deceased = request.POST.get('is_deceased')
        # Convert the string value to a boolean
        nominee.is_deceased = is_deceased.lower() == 'true'
        nominee.save()
        return JsonResponse({'status': 'success'})
    else:
        return JsonResponse({'status': 'error'})


# UPDATE IS DECEASED FOR BENEVOLENT CLAIM
def revert_is_deceased(request, nominee_id):
    nominee = get_object_or_404(Nominee,  dependantidnumber=nominee_id)
    
    if request.method == 'POST':
        is_deceased = request.POST.get('is_deceased')
        # Convert the string value to a boolean
        nominee.is_deceased = is_deceased.lower() == 'false'
        nominee.save()
        return JsonResponse({'status': 'success'})
    else:
        return JsonResponse({'status': 'error'})

    

# HANDLE BENEVOLENT CLAIM SUBMISSION REQUEST
@login_required
def benevolent_claim_view(request):
    if request.method == 'POST':
        try:
            # Retrieve data from the request
            data = json.loads(request.body.decode('utf-8'))

            # Retrieve the current user's Member instance
            current_member = request.user.member

            # Save the data to the BenevolentClaim model
            claim = BenevolentClaim(
                member=current_member,
                date_claim_requested=timezone.now(),
                account_name=data['bankDetails']['account_name'],
                account_number=data['bankDetails']['account_number'],
                bank=data['bankDetails']['bank'],
                branch=data['bankDetails']['branch'],
                agreement_checked=data['memberDeclaration']['agreement']
            )
            claim.save()

            # Create Deceased Information instances for Benevolent Claim
            for deceased_data in data['deceasedInformation']['deceasedChecked']:
                # Check if the dependant is a member
                dependant_id_number = deceased_data.get('dependantidnumber')  # Use get to handle missing key
                try:
                    is_member = Member.objects.get(user__member__personal_details__idnumber=dependant_id_number)
                    is_member = True
                except Member.DoesNotExist:
                    is_member = False

                # Determine the awarded amount based on the relationship with the member
                if is_member:
                    awarded_amount = 40000
                else:
                    relationship = deceased_data['dependantrelationship'].lower()
                    awarded_amount = 40000 if 'husband' in relationship or 'wife' in relationship or 'daughter' in relationship or 'son' in relationship else 20000

                deceased_information = DeceasedInformation(
                    benevolent_claim=claim,
                    deceased_name=deceased_data['nameofdependant'],
                    deceased_id_number=dependant_id_number,
                    relationship_with_member=deceased_data['dependantrelationship'],
                    deceased_dob=deceased_data['dateofbirth'],
                    deceased_date_of_death=deceased_data['dateofdeath'],
                    awarded_amount=awarded_amount
                )
                deceased_information.save()

            # Create a transaction record for the member
            Transaction.objects.create(
                member=current_member,
                activity_type='benevolent claim submitted',
                description=f'Benevolent Claim successfully submitted',
                debit=0,
                credit=awarded_amount,
            )   

            return JsonResponse({'success': True})
        except Exception as e:
            # Print the error details for debugging
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)

    return render(request, 'accounts.html')


@login_required
def faq(request):
    current_path = request.path
    page_name = current_path.split('/')[-1]
    page_title_map = {
        'loans': 'My Loans',
    }
    page_title = page_title_map.get(page_name, 'My Loans')
    context = {
        'current_user': request.user, 
        'page_title': page_title,
    }
    return render(request, 'faq.html', context)



  