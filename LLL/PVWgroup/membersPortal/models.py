from django.db import models
from authentication.models import Member
import random
from django.utils import timezone

    
class MailSmsVerificationCode(models.Model):
    sender_member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='sent_verification_codes', default=0)
    receiver_member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='received_verification_codes', default=0)
    code = models.CharField(max_length=6, unique=True)
    code_purpose = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_picked = models.BooleanField(default=False)
    expired = models.BooleanField(default=False)
    expired_at = models.DateTimeField(null=True, blank=True)

    @classmethod
    def generate_unique_code(cls, sender_member, receiver_member, purpose):
        # Get existing unpicked codes for the receiver member with the same purpose
        existing_unpicked_codes = cls.objects.filter(sender_member=sender_member, receiver_member=receiver_member, code_purpose=purpose, is_picked=False)

        # Update existing codes to mark them as expired
        for existing_code in existing_unpicked_codes:
            existing_code.expired = True
            existing_code.expired_at = timezone.now()
            existing_code.save()

        # Generate a 6-digit verification code
        verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

        # Create a new VerificationCode instance
        verification_instance = cls.objects.create(sender_member=sender_member, receiver_member=receiver_member, code=verification_code, code_purpose=purpose)

        return verification_instance 

    @classmethod
    def generate_unique_AdminLoginPassCode(cls, receiver_member, purpose):
        # Get existing unpicked codes for the receiver member with the same purpose
        existing_unpicked_codes = cls.objects.filter(sender_member=receiver_member, receiver_member=receiver_member, code_purpose=purpose, is_picked=False)

        # Update existing codes to mark them as expired
        for existing_code in existing_unpicked_codes:
            existing_code.expired = True
            existing_code.expired_at = timezone.now()
            existing_code.save()

        # Generate a 6-digit verification code
        verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

        # Create a new VerificationCode instance
        adminLoginPassCode = cls.objects.create(sender_member=receiver_member, receiver_member=receiver_member, code=verification_code, code_purpose=purpose)

        return adminLoginPassCode     
    

class MemberReasons(models.Model):
    account_manager = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='account_manager', default=0)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='target_member', default=0)
    action = models.CharField(max_length=100)
    action_reason = models.CharField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.account_manager.user.member_number} - {self.action} on {self.member.user.member_number}'

