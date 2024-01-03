from django import template
import uuid

register = template.Library()

@register.filter
def generate_uuid(value):
    return str(uuid.uuid4())

# from django import template
# import base64

# register = template.Library()

# @register.filter
# def b64encode(value):
#     return base64.urlsafe_b64encode(value.encode()).decode()
