#  member = Member.objects.filter(
#                 user__member__personal_details__idnumber=idnumber
#             ).filter(
#                 Q(user__member__advance_loans__is_disbursed=True, user__member__advance_loans__is_repaid=False) |
#                 Q(user__member__welfare_loans__is_disbursed=True, user__member__welfare_loans__is_repaid=False)
#             ).first()

#             print(member)

#             if member:
#                 return JsonResponse({'error': 'User already has a disbursed loan. Cannot submit a new loan.'}, status=400)