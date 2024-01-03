from django.db import models
from authentication.models import CustomUser, Member, PersonalDetails, ContactDetails, Nominee, NextOfKin
from django.utils import timezone
from django.contrib.auth.models import User
import uuid
from decimal import Decimal
from datetime import timedelta
from calendar import monthrange
from datetime import date
import logging



class Benovelent(models.Model):
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='benovelent')
    benov_amount = models.DecimalField(max_digits=10, default=250, decimal_places=2)
    is_approved = models.BooleanField(default=True)
    date_approved = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    posting_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Benovelent Contribution for Member {self.member.user.member_number}"



class BenevolentClaim(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='benevolent_claim')
    date_claim_requested = models.DateField(null=True, blank=True)
    is_approved = models.BooleanField(default=False)  
    date_approved = models.DateField(null=True, blank=True)
    date_rejected = models.DateField(null=True, blank=True)
    account_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=30)
    bank = models.CharField(max_length=255)
    branch = models.CharField(max_length=255)
    agreement_checked = models.BooleanField()
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )

    def __str__(self):
        return f"{self.full_name} - {self.deceased_name}"


class DeceasedInformation(models.Model):
    benevolent_claim = models.ForeignKey(BenevolentClaim, on_delete=models.CASCADE, related_name='deceased_information', null=True, blank=True)
    deceased_name = models.CharField(max_length=255)
    deceased_id_number = models.CharField(max_length=20)
    relationship_with_member = models.CharField(max_length=255)
    deceased_dob = models.DateField()
    deceased_date_of_death = models.DateField()
    is_claim_approved = models.BooleanField(default=False)
    awarded_amount = models.DecimalField(max_digits=10, default=0, decimal_places=2)  

    def __str__(self):
        return f"Deceased Information for {self.benevolent_claim} - {self.get_is_claim_approved_display()}"


logger = logging.getLogger(__name__)
class AdjustedShareContributions(models.Model):
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='share_amount')
    share_amount = models.DecimalField(max_digits=10, default=150, decimal_places=2)
    new_amount = models.DecimalField(max_digits=10, default=150, decimal_places=2)
    request_date = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=True)
    date_approved = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    posting_date = models.DateTimeField(default=timezone.now) 

    def update_share_amount_with_new_amount(self):
        """
        Update share_amount with new_amount and set is_approved to True if it was False.
        """
        try:
            if not self.is_approved:
                self.is_approved = True
            # self.member.update_shares_contribution(self.new_amount)
            self.share_amount = self.new_amount
            self.save()
        except Exception as e:
            logger.error(f'An error occurred in update_share_amount_with_new_amount: {str(e)}')

    def __str__(self):
        return f"ShareAmount for Member {self.member.user.member_number}"


class WelfareLoan(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='welfare_loans')
    loan_id = models.CharField(max_length=15, unique=True)
    date_requested = models.DateField()
    borrowed_amount = models.DecimalField(max_digits=15, decimal_places=2)
    loan_purpose = models.CharField(max_length=255, null=True, blank=True)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=4, default=0.05) 
    total_loan_interest = models.DecimalField(max_digits=15, decimal_places=4, default=0.05) 
    installment = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    duration_months = models.IntegerField()
    is_disbursed = models.BooleanField(default=False)
    posting_date = models.DateField(null=True, blank=True)
    loan_maturity_date = models.DateField(null=True, blank=True)
    loan_amount_to_be_paid = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    is_repaid = models.BooleanField(default=False)
    date_repaid = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )

    class Meta:
        db_table = 'backOffice_WelfareLoan'

    def generate_reducing_table(self):
        reducing_table = []
        monthly_installment = self.borrowed_amount / Decimal(self.duration_months)
        outstanding_loan_principal = self.borrowed_amount
        current_date = self.posting_date

        for month in range(1, self.duration_months + 1):
            interest = outstanding_loan_principal * self.interest_rate
            amount_due = monthly_installment + interest
            outstanding_loan_principal -= monthly_installment
            last_day_of_month = monthrange(current_date.year, current_date.month)[1]
            installment_maturity_date = date(current_date.year, current_date.month, last_day_of_month)
       
            entry = ReducingTable(
                welfare_loan=self,
                interest=interest,
                amount_due=amount_due,
                installment=monthly_installment,
                outstanding_loan_principal=outstanding_loan_principal,
                month=month,
                months_remaining=self.duration_months - month,
                installment_maturity_date=installment_maturity_date,
            )
            reducing_table.append(entry)
            current_date = current_date + timedelta(days=last_day_of_month)

        self.loan_maturity_date = reducing_table[-1].installment_maturity_date
        self.loan_amount_to_be_paid = sum(entry.amount_due for entry in reducing_table)
        self.total_loan_interest = sum(entry.interest for entry in reducing_table)
        self.save()

        for entry in reducing_table:
            entry.save()
        return reducing_table

    def save(self, *args, **kwargs):
        """
        Save method for WelfareLoan model.
        """
        if not self.loan_id:
            unique_code = uuid.uuid4().hex[:8].upper()
            self.loan_id = f"Pvw-WL-{unique_code}" 
        super().save(*args, **kwargs)

    def approve_loan_disbursed(self):
        """
        Method to approve loan disbursement.
        """
        if not self.is_disbursed:
            self.is_disbursed = True
            self.posting_date = timezone.now()
            self.save()    
    
    def __str__(self):
        return f"Welfare Loan - {self.loan_id}"


class ReducingTable(models.Model):
    welfare_loan = models.ForeignKey(WelfareLoan, on_delete=models.CASCADE, related_name='reducing_table')
    month = models.IntegerField()
    interest = models.DecimalField(max_digits=10, decimal_places=4)
    amount_due = models.DecimalField(max_digits=10, decimal_places=4)
    installment = models.DecimalField(max_digits=10, decimal_places=4)
    outstanding_loan_principal = models.DecimalField(max_digits=10, decimal_places=4)
    months_remaining = models.IntegerField()
    is_picked = models.BooleanField(default=False)
    date_picked = models.DateField(null=True, blank=True)
    installment_maturity_date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=[
            ('paid', 'Paid'),
            ('notpaid', 'Not Paid'),
            ('granted', 'Granted'),
            ('rejected', 'Rejected'),
        ],
        default='notpaid'
    )

    def __str__(self):
        return f"Reducing Table - {self.welfare_loan.loan_id} - Month {self.duration_months - self.months_remaining + 1}"


class AdvanceLoan(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='advance_loans')
    loan_id = models.CharField(max_length=15, unique=True)
    date_requested = models.DateField()
    borrowed_amount = models.DecimalField(max_digits=10, decimal_places=2)
    loan_purpose = models.CharField(max_length=255, null=True, blank=True)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.05)  
    interest = models.DecimalField(max_digits=10, decimal_places=4)
    is_disbursed = models.BooleanField(default=False)
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    posting_date = models.DateField(null=True, blank=True)
    maturity_date = models.DateField()
    amount_to_be_paid = models.DecimalField(max_digits=10, decimal_places=2)
    is_repaid = models.BooleanField(default=False)
    date_repaid = models.DateField(null=True, blank=True)

    def calculate_amount_to_be_paid(self):
        """
        Calculate the total amount to be paid, including principal and interest.
        """
        self.amount_to_be_paid = self.borrowed_amount + self.interest

    def save(self, *args, **kwargs):
        """
        Save method for AdvanceLoan model.
        """
        if not self.loan_id:
            unique_code = uuid.uuid4().hex[:8].upper()
            self.loan_id = f"Pvw-Ad-{unique_code}"
        self.interest = self.borrowed_amount * self.interest_rate
        self.calculate_amount_to_be_paid()
        last_day_of_month = timezone.datetime(self.date_requested.year, self.date_requested.month, 1) + timezone.timedelta(days=32)
        self.maturity_date = last_day_of_month.replace(day=1) - timezone.timedelta(days=1)
        super().save(*args, **kwargs)

    def approve_loan_disbursed(self):
        """
        Method to approve loan disbursement.
        """
        if not self.is_disbursed:
            self.is_disbursed = True
            self.posting_date = timezone.now()
            self.save()

    def approve_loan_repaid(self):
        """
        Method to approve loan repayment.
        """
        if not self.is_repaid:
            self.is_repaid = True
            self.date_repaid = timezone.now()
            self.save()

    def get_member_info(self):
            """
            Get the name and loan ID of the member who requested the loan.
            """
            member_info = {
                'full_name': self.member.personal_details.get_full_name(),
                'loan_id': self.loan_id,
            }
            return member_info

    def __str__(self):
        """
        String representation of AdvanceLoan object.
        """
        return f"Advance Loan - {self.loan_id}"


class Guarantor(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending Acceptance'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]

    LOAN_TYPE_CHOICES = [
        ('Advance', 'Advance Loan'),
        ('Normal', 'Normal Loan'),
    ]

    advance_loan = models.ForeignKey(AdvanceLoan, on_delete=models.CASCADE, related_name='advance_guarantors', null=True, blank=True)
    welfare_loan = models.ForeignKey(WelfareLoan, on_delete=models.CASCADE, related_name='welfare_guarantors', null=True, blank=True)
    full_name = models.CharField(max_length=255)
    member_number = models.CharField(max_length=255, default="0000") 
    id_number = models.CharField(max_length=20)  
    phone_number = models.CharField(max_length=15)
    signature_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    loan_type_guaranteed = models.CharField(max_length=10, choices=LOAN_TYPE_CHOICES, default='none')
    guaranteed_repaid = models.BooleanField(default=False)
   
    def __str__(self):
        return f"Guarantor for {self.advance_loan or self.welfare_loan} - {self.get_signature_status_display()}"


class Transaction(models.Model):
    ACTIVITY_CHOICES = [
        ('benovelent', 'Benovelent Contribution'),
        ('shares', 'Shares Contribution'),
        ('normal_loan', 'Normal Loan'),
        ('salary_advance_loan', 'Salary Advance Loan'),
    ]
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='transactions')
    posting_date = models.DateTimeField(default=timezone.now)
    activity_type = models.CharField(max_length=100, choices=ACTIVITY_CHOICES)
    description = models.CharField(max_length=255)
    debit = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    credit = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    balance = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    balanceU = models.DecimalField(max_digits=10, default=0, decimal_places=2)

    def save(self, *args, **kwargs):
        # Calculate balance including all activities
        self.balance = self.member.benovelent_contribution + self.member.shares_contribution + \
                       self.member.normal_loan + self.member.salary_advance_loan 
        
        # Calculate balance excluding 'benovelent'
        self.balanceU = self.member.shares_contribution + \
                        self.member.normal_loan + self.member.salary_advance_loan 
         
        # Subtract advance_loan_interest if the activity_type is 'advance loan interest'
        if self.activity_type == 'advance loan interest':
            self.balanceU -= self.debit
            # Update shares_contribution in the Member model
            self.member.update_shares_contribution(-self.debit)

        super().save(*args, **kwargs)

     
class Payroll(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='payroll')
    full_name = models.CharField(max_length=255, default="none")
    gross_pay = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    paye = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    nhif = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    nssf = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    welfare = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    benovelent = models.DecimalField(max_digits=10, default=250, decimal_places=2)
    loan_wf = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    bill = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    advance = models.DecimalField(max_digits=10, default=0, decimal_places=2)
    last_modified = models.DateTimeField(auto_now=True) 

    def update_loan_wf_from_reducing_table(self, welfare_loan_instance):
            # Fetch the last picked reducing table entry for the given WelfareLoan instance
            reducing_table_entry = welfare_loan_instance.reducing_table.filter(
                is_picked=True,
                date_picked__isnull=False
            ).order_by('-date_picked')[:1].first()

            if reducing_table_entry:
                # Update loan_wf in the Payroll model with the picked amount due
                if reducing_table_entry.amount_due and reducing_table_entry.amount_due > 0:
                    self.loan_wf = reducing_table_entry.amount_due
                    self.save()
                else:
                    self.loan_wf = 0
                    self.save()

    def __init__(self, *args, **kwargs):
        super(Payroll, self).__init__(*args, **kwargs)

    def __str__(self):
        return f"{self.employee} - Payroll"
    



class WelfareStatistics(models.Model):
    welfare_shares_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    welfare_benevolent_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    welfare_loanInterest_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    welfare_activeMembers = models.IntegerField(default=0)

    def __str__(self):
        return f"Welfare Statistics - {self.id}"
    
    # PVW UpdateContributions
    def calculate_overall_balances(self, total_share_amount, total_benevolent_amount):
        # Check if WelfareStatistics instance exists
        if self.pk:
            # Include overall balances
            overall_balances = {
                'total_welfare_shares_contribution_before': self.welfare_shares_balance,
                'total_welfare_benovelent_contribution_before': self.welfare_benevolent_balance,
                'total_welfare_interest_before': self.welfare_loanInterest_balance,

                # Calculate after balances as the sum of individual contributions and before balances
                'total_welfare_shares_contribution_after': total_share_amount + self.welfare_shares_balance,
                'total_welfare_benovelent_contribution_after': total_benevolent_amount + self.welfare_benevolent_balance,
                'total_welfare_interest_after': self.welfare_loanInterest_balance,
            }
        else:
            # Set default values if WelfareStatistics instance doesn't exist
            overall_balances = {
                'total_welfare_shares_contribution_before': total_share_amount,
                'total_welfare_benovelent_contribution_before': total_benevolent_amount,
                'total_welfare_interest_before': 0,
                'total_welfare_shares_contribution_after': total_share_amount,
                'total_welfare_benovelent_contribution_after': total_benevolent_amount,
                'total_welfare_interest_after': 0,
            }

        return overall_balances
    

    def update_welfare_balances(self, total_share_amount, total_benevolent_amount):
        """
        Update welfare shares and benevolent balances based on provided amounts.
        """
        self.welfare_shares_balance = total_share_amount
        self.welfare_benevolent_balance = total_benevolent_amount
        self.save()
    

    # Benevolent claim award
    def calculate_overall_balances_benevolent_award(self, total_amount_awarded):
        # Check if WelfareStatistics instance exists
        if self.pk:
            # Include overall balances
            overall_balances_benevolent_award = {
                'total_welfare_benovelent_contribution_before': self.welfare_benevolent_balance,
                'total_welfare_benovelent_contribution_after_benevolent_award': self.welfare_benevolent_balance - total_amount_awarded,
            }
        else:
            # Set default values if WelfareStatistics instance doesn't exist
            overall_balances_benevolent_award = {
                'total_welfare_benovelent_contribution_before': 0,
                'total_welfare_benovelent_contribution_after_benevolent_award': 0 - total_amount_awarded,
            }

        return overall_balances_benevolent_award
    
    
    def update_welfare_balances_benevolent_award(self, total_amount_awarded):
        """
        Update benevolent balances based on benevolent amount awarded.
        """
        self.welfare_benevolent_balance = total_amount_awarded
        self.save()

 