from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import logout
from django.utils import timezone
import logging
import json
import random
from django.http import JsonResponse
from django.contrib import messages
from .models import CustomUser, Member, PersonalDetails, ContactDetails, Nominee, NextOfKin
from backOffice.models import Transaction, AdjustedShareContributions, Benovelent
from django.contrib.auth.decorators import user_passes_test
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth import views as auth_views
from .forms import CustomPasswordResetForm
from django.contrib.auth.models import User


# AUTHENTICATION VIEWS
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth import get_user_model  # Import get_user_model
from django.contrib import messages
from django.core.mail import send_mail
from django.shortcuts import render, redirect

User = get_user_model()  

def custom_password_reset(request):
    if request.method == 'POST':
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            # Get the email from the form
            email = form.cleaned_data['email']

            # Retrieve the user based on the provided email
            user = User.objects.get(email=email)
            print(user)
            print(user.email)
            print(user.username)

            # Send password reset mail notification

            # message = f"Dear {user.username},\n\nYour PVWG Web Portal account password has been reset. Your login id and new password are:\n\nLogin Id:- A012209614J\n\nPassword:- XNBNFRm6" 
            # message += "Use these credentials, to log into PVWG Web Portal to complete the password reset process..\n\n"
            # message += "Best regards,\nParkside Villa Welfare GROUP Support Team"
            # send_mail(
            #     'Password Reset for PVW Web Portal account',
            #     message,
            #     'pvwgtestmail@hamiscodecraft.co.ke',
            #     [email],
            #     fail_silently=False,
            # )
            # print("mail sent")
              # Send mail notification with pdf document
            message = f"Hi {user.username},\n\nThank you for signing up and creating an account with Parkside Villa Welfare GROUP!\n\nTo proceed, kindly complete the required declaration in the attached PDF document. Once done, bring the filled PDF to the registrar\'s office for approval. Thank you!'\n\nYou can log in to your account using the following link:\n\nhttps://hamiscodecraft.co.ke/user-login once your account is approved" 
            message += "Thank you for using our services.\n\n"
            message += "Best regards,\nParkside Villa Welfare GROUP Support Team"
            send_mail(
            'Introducing Parkside Villa Welfare GROUP WebApp - Your Path to Financial Growth!',
            message,
            'pvwgtestmail@hamiscodecraft.co.ke',
            [user.email],
            fail_silently=False,
            )

            # Process the form and send the reset email
            messages.success(request, 'Password reset email sent successfully.')
            return redirect('custom_password_reset')
    else:
        form = PasswordResetForm()

    return render(request, 'password_reset.html', {'form': form})



def custom_password_reset_confirm(request, uidb64, token):
    # Your implementation for handling the password reset confirmation
    # ...
    
    return render(request, 'custom_password_reset_confirm.html', {'form': None})


def signup(request):
    return render(request, 'signup.html')


def get_counties(request):
    with open('data/kenya_data.json', 'r') as json_file:
        data = json.load(json_file)
    return JsonResponse({'data': data})


def generate_member_number():
    while True:
        current_year = timezone.now().year
        last_member = CustomUser.objects.order_by('-id').first()
        last_number = 0
        if last_member:
            last_number_str = last_member.member_number.split('/')[1]
            last_number = int(last_number_str)
        new_member_number = f'PVW/{(last_number + 1):05d}/{current_year}'
        if last_number == 0:
            new_member_number = f'PVW/{1:05d}/{current_year}'
        if not CustomUser.objects.filter(member_number=new_member_number).exists():
            return new_member_number


@require_GET
def check_id_number_availability(request, id_number):
    try:
        existing_personal_details = PersonalDetails.objects.get(idnumber=id_number)
        is_taken = True
    except PersonalDetails.DoesNotExist:
        is_taken = False
    return JsonResponse({'isTaken': is_taken})


@require_GET
def check_phone_number_availability(request, phone_number):
    try:
        existing_contact_details = ContactDetails.objects.get(phoneno=phone_number)
        is_taken = True
    except ContactDetails.DoesNotExist:
        is_taken = False
    return JsonResponse({'isTaken': is_taken})


@require_GET
def check_email_availability(request, email):
    try:
        existing_contact_details = ContactDetails.objects.get(email=email)
        is_taken = True
    except ContactDetails.DoesNotExist:
        is_taken = False
    return JsonResponse({'isTaken': is_taken})


logger = logging.getLogger(__name__)
def save_form_data(request):
    if request.method == 'POST':
        try:
            form_data = json.loads(request.body)['formData']
            member_number = generate_member_number()
            # Extract 'username' and 'email'
            username = form_data['personalDetails'].get('username', '')
            email = form_data['contactDetails'].get('email', '')
            # Create CustomUser instance
            custom_user = CustomUser.objects.create(username=username, email=email, member_number=member_number)
            custom_user.set_password(form_data['personalDetails']['password'])
            custom_user.save()
            # Create Member instance
            member = Member.objects.create(user=custom_user)
            # Create PersonalDetails instance
            personal_details_data = form_data['personalDetails']
            personal_details = PersonalDetails.objects.create(
                member=member,
                surname=personal_details_data['surname'],
                fname=personal_details_data['fname'],
                onames=personal_details_data['onames'],
                username=personal_details_data.get('username', ''),
                gender=personal_details_data['gender'],
                idnumber=personal_details_data['idnumber'],
                dob=personal_details_data['dob'],
                position=personal_details_data['position']
            )
            # Create ContactDetails instance
            contact_details_data = form_data['contactDetails']
            contact_details = ContactDetails.objects.create(
                member=member,
                phoneno=contact_details_data['phoneno'],
                email=email,
                county=contact_details_data['countySelect'],
                subcounty=contact_details_data['subcountySelect'],
                ward=contact_details_data['wardSelect'],
                sublocation=contact_details_data['sublocation'],
                residence=contact_details_data['residence']
            )
            # Create Nominee instances
            nominees_data = form_data['nominees']
            for nominee_data in nominees_data:
                Nominee.objects.create(
                    member=member,
                    nameofdependant=nominee_data['nameofdependant'],
                    dependantrelationship=nominee_data['dependantrelationship'],
                    dependantidnumber=nominee_data['dependantidnumber'],
                    dependantcontact=nominee_data['dependantcontact']
                )
            # Create NextOfKin instances
            next_of_kin_data = form_data['nextofkin']
            for next_of_kin_data in next_of_kin_data:
                NextOfKin.objects.create(
                    member=member,
                    nameofnextofkin=next_of_kin_data['nameofnextofkin'],
                    nextofkinrelationship=next_of_kin_data['nextofkinrelationship'],
                    nextofkinidnumber=next_of_kin_data['nextofkinidnumber'],
                    nextofkincontact=next_of_kin_data['nextofkincontact']
                )

            # Create AdjustedShareContributions instance
            adjusted_share_contributions = AdjustedShareContributions.objects.create(
                member=member,
                share_amount=150,  
                new_amount=0,
                request_date=timezone.now(),
                is_approved=True,
                status='pending',
                posting_date=timezone.now()
            )
           
            # Create Benovelent instance
            benovelent = Benovelent(
                member=member,
                benov_amount=250,
                is_approved=True,
                status='approved',
                posting_date=timezone.now()
            )
            benovelent.save()

            account_created_successfully = True    
           
            if account_created_successfully:
                messages.success(request, 'Your account has been successfully created. To proceed, kindly complete the required declaration in the PDF document sent to your email. Please note that the PDF is automatically downloaded for your convenience. Once done, bring the filled PDF to the registrar\'s office for approval. Thank you!')
                logger.info('Account created successfully')

                # Send mail notification with pdf document
                message = f"Hi {custom_user.username},\n\nThank you for signing up and creating an account with Parkside Villa Welfare GROUP!\n\nTo proceed, kindly complete the required declaration in the attached PDF document. Once done, bring the filled PDF to the registrar\'s office for approval. Thank you!'\n\nYou can log in to your account using the following link:\n\nhttps://hamiscodecraft.co.ke/user-login once your account is approved" 
                message += "Thank you for using our services.\n\n"
                message += "Best regards,\nParkside Villa Welfare GROUP Support Team"
                send_mail(
                'Introducing Parkside Villa Welfare GROUP WebApp - Your Path to Financial Growth!',
                message,
                'pvwgtestmail@hamiscodecraft.co.ke',
                [custom_user.email],
                fail_silently=False,
                )
            
                return JsonResponse({
                    'status': 'success',
                    'redirect_url': '/user-login',
                })
            else:
                logger.error('Account creation failed')
                return JsonResponse({'status': 'error', 'message': 'Account creation failed'})   
        except json.JSONDecodeError as e:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)
        except Exception as e:
            print(str(e)) 
            return JsonResponse({'status': 'error', 'message': 'Internal Server Error'}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
    


# USER LOGIN VIEW
from django.contrib import messages

# USER LOGIN VIEW
def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        try:
            # Get the user based on the provided username
            user = CustomUser.objects.get(username=username)

            # Check if the user is approved
            if not user.is_approved:
                messages.error(request, 'Your account is not approved. Please wait for approval.')
                return render(request, 'login.html', {'invalid_login': False, 'pending_approval': True, 'blocked_account': False})

            # Check if the user is blocked
            if user.status == 'Blocked':
                messages.error(request, 'Your account is Blocked. Please contact the administrator for unblocking.')
                return render(request, 'login.html', {'invalid_login': False, 'pending_approval': False, 'blocked_account': True})

            # Authenticate the user
            user = authenticate(request, username=username, password=password)
            if user is not None:
                auth_login(request, user)
                return redirect('dashboard')
            else:
                messages.error(request, 'Invalid login credentials.')
                return render(request, 'login.html', {'invalid_login': True, 'pending_approval': False, 'blocked_account': False})

        except CustomUser.DoesNotExist:
            messages.error(request, 'Invalid login credentials.')
            return render(request, 'login.html', {'invalid_login': True, 'pending_approval': False, 'blocked_account': False})

    else:
        return render(request, 'login.html', {'invalid_login': False, 'pending_approval': False, 'blocked_account': False})








# USER AND ADMIN LOGOUT VIEW
def user_logout(request):
    logout(request)
    return redirect('home')    



# ADMIN LOGIN VIEW
def admin_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.is_superuser:
                auth_login(request, user)
                return redirect('admindashboard')
            else:
                return render(request, 'admin_login.html', {'not_superuser': True})
        else:
            return render(request, 'admin_login.html', {'invalid_login': True})
        
    else:
        return render(request, 'admin_login.html', {'invalid_login': False})


 
def contact(request):
    return render(request, 'contact.html')


def home(request):
    return render(request, 'home.html')

# @user_passes_test(lambda u: u.is_superuser)