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

                                # # Fetch or create the Payroll instance associated with the member
                                # payroll_instance, created = Payroll.objects.get_or_create(member=member)

                                # # Update payroll model and loan_wf from reducing table
                                # payroll_instance.update_loan_wf_from_reducing_table(welfare_loan_instance)

                                # print(f"Reducing Table Entry picked for Welfare Loan {welfare_loan_instance.loan_id}")

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


def approve_pvwMonthlyUpdate_Contributions(request):
   
    try:
        with transaction.atomic():
            # Exclude staff and superusers and filter only approved members
            members_data = Member.objects.filter(
                user__is_staff=False,
                user__is_superuser=False,
                user__is_approved=True,
                user__status='Approved'
            )

            if request.method == 'POST':
                if request.user.is_staff and request.user.status == "Approved":
                    member_details_list = []
                    total_share_amount = 0
                    total_benevolent_amount = 0
                    total_loan_interest = 0
                    total_advanceLoan_interest = 0
                    total_welfareLoan_interest = 0

                    for member in members_data:
                        # Update contributions for the member
                        member.update_benovelent_contribution(member.benovelent.benov_amount)
                        member.update_shares_contribution(member.share_amount.share_amount)
                        member.update_welfare()                           

                        # Create transaction records for benovelent and shares contributions
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


                        # PROCESS ADVANCE LOANS

                        # Fetch AdvanceLoans where is_repaid is False and amount_to_be_paid is greater than zero
                        advance_loans_due = AdvanceLoan.objects.filter(
                            member=member,
                            is_repaid=False,
                            status="approved",
                            is_disbursed=True,
                            amount_to_be_paid__gt=0
                        )

                        # Check if the member has any advance loan
                        if advance_loans_due.exists():
                            # Calculate total amount_to_be_paid for all loans in advance_loans_due
                            total_amount_to_be_paid = sum(loan.amount_to_be_paid for loan in advance_loans_due)

                            # Calculate 'Outstanding Balance(After Repayment)' by subtracting the sum of salary_advance_loan and salary_advance_loan_interest
                            outstanding_balance_after_repayment = (member.salary_advance_loan + member.salary_advance_loan_interest) - total_amount_to_be_paid

                            # Append member details to the list
                            member_details_list.append({
                                'full_name': member.personal_details.get_full_name(),
                                'total_amount_to_be_paid': total_amount_to_be_paid,
                                'outstanding_balance_after_repayment': outstanding_balance_after_repayment,
                            })

                            # Update salary_advance_loan and salary_advance_loan_interest with outstanding_balance_after_repayment
                            member.salary_advance_loan = outstanding_balance_after_repayment if outstanding_balance_after_repayment > 0 else 0
                            member.salary_advance_loan_interest = 0 

                            # Save the member instance to persist the changes
                            member.save()

                            # Update is_repaid to True for each loan in advance_loans_due
                            for loan in advance_loans_due:
                                loan.approve_loan_repaid()
                                loan.status = "Cleared"
                                loan.save()

                                # Create transaction records for loan interest 
                                Transaction.objects.create(
                                    member=member,
                                    activity_type='loan_interest',
                                    description=f"Loan Interest Payment - {loan.loan_id}",
                                    debit=loan.interest,
                                    credit=0,
                                )

                                # Accumulate loan.interest value
                                total_advanceLoan_interest += loan.interest

                                # Create transaction records for loan principal
                                Transaction.objects.create(
                                    member=member,
                                    activity_type='loan_principal',
                                    description=f"Loan Principal Payment - {loan.loan_id}",
                                    debit=loan.borrowed_amount,
                                    credit=0,
                                )

                                payroll_instance, created = Payroll.objects.get_or_create(member=member)
                                payroll_instance.update_salary_advance_loan()
                        else:
                            payroll, created = Payroll.objects.get_or_create(member=member)
                            payroll.advance = Decimal(str(0))
                            payroll.save()         

                        # PROCESS WELFARE LOANS
                        welfare_loan_repayments = []

                        # Fetch Welfare Loans where is_repaid is False and amount_to_be_paid is greater than zero        
                        welfare_loan_instances = WelfareLoan.objects.filter(
                            member=member,
                            is_disbursed=True,
                            status="approved",
                            is_repaid=False,
                            loan_amount_to_be_paid__gt=0
                        )

                        for welfare_loan_instance in welfare_loan_instances:
                            reducing_table_entries = welfare_loan_instance.reducing_table.filter(
                                is_picked=False,
                                date_picked=None
                            ).order_by('month')[:1]

                            if reducing_table_entries.exists():
                                reducing_entry = reducing_table_entries[0]
                                welfare_loan_repayments.append({
                                    'loan_id': welfare_loan_instance.loan_id,
                                    'loan_amount_borrowed': welfare_loan_instance.borrowed_amount,
                                    'installment': float(reducing_entry.installment),
                                    'interest': float(reducing_entry.interest),
                                    'amount_due': float(reducing_entry.amount_due),
                                    'installment_due_date': reducing_entry.installment_maturity_date,
                                    'outstanding_loan_principal': reducing_entry.outstanding_loan_principal,
                                    'months_remaining': reducing_entry.months_remaining
                                })

                                # Create transaction records for loan interest
                                Transaction.objects.create(
                                    member=member,
                                    activity_type='loan_interest',
                                    description=f"Welfare Loan Interest Payment - {welfare_loan_instance.loan_id}",
                                    debit=float(reducing_entry.interest),
                                    credit=0,
                                )

                                # Accumulate the interest
                                total_welfareLoan_interest += float(reducing_entry.interest)

                                # Create transaction records for loan principal
                                Transaction.objects.create(
                                    member=member,
                                    activity_type='loan_principal',
                                    description=f"Welfare Loan Principal Payment - {welfare_loan_instance.loan_id}",
                                    debit=float(reducing_entry.amount_due - reducing_entry.interest),
                                    credit=0,
                                )

                                # update reducing table
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


                        # Create or update Payroll record
                        payroll, created = Payroll.objects.get_or_create(member=member)
                        payroll.full_name = member.personal_details.get_full_name()
                        payroll.welfare = member.share_amount.share_amount
                        payroll.benovelent = member.benovelent.benov_amount
                        payroll.save()       

                    # Retrieve or create an instance of WelfareStatistics
                    welfare_statistics, created = WelfareStatistics.objects.get_or_create(pk=1)

                    # Update welfare_statistics balances
                    welfare_statistics.welfare_shares_balance += total_share_amount
                    welfare_statistics.welfare_benevolent_balance += total_benevolent_amount

                    # Calculate total loan interest for all members
                    total_loan_interest = Decimal(str(total_advanceLoan_interest)) + Decimal(str(total_welfareLoan_interest))

                    welfare_statistics.welfare_loanInterest_balance += Decimal(str(total_loan_interest))

                    # Call the update_welfare_balances method
                    welfare_statistics.update_welfare_balances(
                        welfare_statistics.welfare_shares_balance,
                        welfare_statistics.welfare_benevolent_balance,
                        welfare_statistics.welfare_loanInterest_balance
                    )

                   

                    return JsonResponse({
                        'success': f'Successfully approved Welfare Loan.',
                        'total_share_amount': format(total_share_amount, ','),
                        'total_benevolent_amount': format(total_benevolent_amount, ','),
                        'new_total_share_amount_balance': format(welfare_statistics.welfare_shares_balance, ','),
                        'new_total_benevolent_amount_balance': format(welfare_statistics.welfare_benevolent_balance, ','),
                        'members_details': member_details_list,
                    })
                else:
                    return JsonResponse({'error': 'Update not found or is already updated'}, status=400)
            else:
                return JsonResponse({'error': 'Method not allowed'}, status=405)

    except Member.DoesNotExist:
        return JsonResponse({'error': 'Member not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)




                