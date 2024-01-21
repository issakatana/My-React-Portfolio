from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from decimal import Decimal



class CustomUserManager(BaseUserManager):
    def create_user(self, email, member_number, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The email field is required')
        user = self.model(email=self.normalize_email(email), member_number=member_number, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username=None, password=None, **extra_fields):
        email = self.normalize_email(email)
        member_number = self.generate_member_number()  # Automatically generate member number
        user = self.model(email=email, member_number=member_number, username=username, **extra_fields)
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.is_approved = True
        user.status = 'Approved'
        user.save(using=self._db)
        return user

    def generate_member_number(self):
        while True:
            current_year = timezone.now().year
            last_member = CustomUser.objects.order_by('-id').first()
            last_number = 0
            if last_member and last_member.member_number:
                last_number_str = last_member.member_number.split('/')[1]
                last_number = int(last_number_str)
            new_member_number = f'PVW/{(last_number + 1):05d}/{current_year}'
            if last_number == 0:
                new_member_number = f'PVW/{1:05d}/{current_year}'
            if not CustomUser.objects.filter(member_number=new_member_number).exists():
                return new_member_number


class CustomUser(AbstractBaseUser, PermissionsMixin):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Blocked', 'Blocked'),
    ]

    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255, default="none", unique=True)  
    member_number = models.CharField(max_length=255, default="0000", unique=True)  
    email = models.EmailField()
    password = models.CharField(max_length=255)
    is_approved = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    last_login = models.DateTimeField(auto_now_add=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.member_number



class Member(models.Model):
    user = models.OneToOneField('authentication.CustomUser', on_delete=models.CASCADE, related_name='member')
    gross_salary = models.DecimalField(max_digits=10, default=60000, decimal_places=2)
    benovelent_contribution = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    shares_contribution = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    normal_loan = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    normal_loan_interest = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    salary_advance_loan = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    salary_advance_loan_interest = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    loan_outstanding = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    welfare = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    last_modified = models.DateTimeField(auto_now=True)

    def deduct_from_normal_loan(self, installment, interest_deducted):
        """
        Deduct amount_due and interest_deducted from normal_loan and normal_loan_interest fields.
        """
        if installment > 0 and interest_deducted > 0:
            if self.normal_loan > 0:
                self.normal_loan -= installment
            else:
                self.normal_loan = 0
                print("Warning: Normal Loan is Zero.")
            if self.normal_loan_interest > 0:
                self.normal_loan_interest -= interest_deducted
            else:
                self.normal_loan_interest = 0
                print("Warning: Normal loan interest is Zero.")
            self.save()
            print(f"Amount Due: {installment} and Interest Deducted: {interest_deducted} deducted successfully.")
        else:
            self.normal_loan = 0
            self.normal_loan_interest = 0
            self.save()
            print("Invalid amount_due or interest_deducted values.")

    def update_benovelent_contribution(self, benovelent_amount):
        self.benovelent_contribution += benovelent_amount
        self.save()

    def update_shares_contribution(self, shares_amount):
        self.shares_contribution += shares_amount
        self.save()

    def update_normal_loan(self, normal_loan_amount):
        self.normal_loan += normal_loan_amount
        self.save()
        
    def update_normal_loan_interest(self, normal_loan_interest):
        self.normal_loan_interest += normal_loan_interest
        self.save()
    
    def update_salary_advance_loan(self, salary_advance_loan_amount):
        self.salary_advance_loan += Decimal(str(salary_advance_loan_amount))
        self.save() 
        
    def update_salary_advance_loan_interest(self, salary_advance_loan_interest):
        self.salary_advance_loan_interest += Decimal(str(salary_advance_loan_interest))
        self.save()       

    def clear_salary_advance_loan(self):
        self.salary_advance_loan = 0
        self.salary_advance_loan_interest = 0
        self.save()      

    def update_outstanding_loan(self):
        self.loan_outstanding = self.normal_loan + self.salary_advance_loan 
        self.save() 
    
    def update_welfare(self):
        self.welfare = self.benovelent_contribution + self.shares_contribution
        self.save()      

    def __str__(self):
        return f"Member {self.user.member_number}"



class PersonalDetails(models.Model):
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='personal_details')
    surname = models.CharField(max_length=255)
    fname = models.CharField(max_length=255)
    onames = models.CharField(max_length=255)
    username = models.CharField(max_length=255, default="none")
    gender = models.CharField(max_length=10)
    idnumber = models.CharField(max_length=20)
    dob = models.DateField()
    position = models.CharField(max_length=255)
    
    def get_full_name(self):
        return f"{self.surname} {self.fname} {self.onames}"

    def __str__(self):
        return f"PersonalDetails for Member: {self.member}"
   


class ContactDetails(models.Model):
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='contact_details')
    phoneno = models.CharField(max_length=20)
    email = models.EmailField()
    county = models.CharField(max_length=255)
    subcounty = models.CharField(max_length=255)
    ward = models.CharField(max_length=255)
    sublocation = models.CharField(max_length=255)
    residence = models.CharField(max_length=255, default="none")

    def __str__(self):
        return f"ContactDetails for Member: {self.member}"



class Nominee(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='nominees')
    nameofdependant = models.CharField(max_length=255)
    dependantrelationship = models.CharField(max_length=255)
    dependantidnumber = models.CharField(max_length=20)
    dependantcontact = models.CharField(max_length=20)
    is_picked = models.BooleanField(default=False)  
    is_deceased = models.BooleanField(default=False)  

    def __str__(self):
        return f"Nominee {self.nameofdependant} for Member: {self.member}"



class NextOfKin(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='next_of_kin')
    nameofnextofkin = models.CharField(max_length=255)
    nextofkinrelationship = models.CharField(max_length=255)
    nextofkinidnumber = models.CharField(max_length=20)
    nextofkincontact = models.CharField(max_length=20)
    
    def __str__(self):
        return f"NextOfKin {self.nameofnextofkin} for Member: {self.member}"