# from django.test import TestCase

# # Create your tests here.
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



