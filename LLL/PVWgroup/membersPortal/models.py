from django.db import models
from authentication.models import CustomUser, Member, PersonalDetails, ContactDetails, Nominee, NextOfKin

# Create your models here.
# class LoanDetails(models.Model):
#     member = models.OneToOneField('Member', on_delete=models.CASCADE, related_name='loan_details')
#     loan_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     advance_loan = models.BooleanField(default=False)
#     normal_loan = models.BooleanField(default=False)
#     repayment_period = models.CharField(max_length=50, default="0")
#     monthly_installment = models.CharField(max_length=50, default="0")
#     loan_purpose = models.CharField(max_length=255)
#     declaration = models.BooleanField(default=False)

#     def __str__(self):
#         return f"LoanDetails for Member: {self.member}"

# class Guarantor(models.Model):
#     loan_details = models.ForeignKey('LoanDetails', on_delete=models.CASCADE, related_name='guarantors')
#     guarantor_name = models.CharField(max_length=255)
#     id_number = models.CharField(max_length=20)
#     telephone = models.CharField(max_length=20)
#     signature = models.CharField(max_length=50, default="Pending Acceptance")
    
#     def __str__(self):
#         return f"Guarantor {self.guarantor_name} for LoanDetails: {self.loan_details}"