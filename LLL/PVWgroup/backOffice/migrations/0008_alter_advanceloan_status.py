# Generated by Django 5.0 on 2024-01-28 06:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backOffice', '0007_alter_welfareloan_borrowed_amount_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='advanceloan',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('pendingPayment', 'pendingPayment'), ('cleared', 'Cleared')], default='pending', max_length=30),
        ),
    ]