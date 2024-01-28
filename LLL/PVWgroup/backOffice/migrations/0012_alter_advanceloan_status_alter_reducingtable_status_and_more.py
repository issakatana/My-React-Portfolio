# Generated by Django 5.0 on 2024-01-28 12:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backOffice', '0011_alter_advanceloan_interest'),
    ]

    operations = [
        migrations.AlterField(
            model_name='advanceloan',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('partialPaid', 'partialPaid'), ('pendingPayment', 'pendingPayment'), ('cleared', 'Cleared')], default='pending', max_length=30),
        ),
        migrations.AlterField(
            model_name='reducingtable',
            name='status',
            field=models.CharField(choices=[('paid', 'Paid'), ('notpaid', 'Not Paid'), ('granted', 'Granted'), ('rejected', 'Rejected'), ('partialPaid', 'partialPaid'), ('pendingPayment', 'pendingPayment'), ('cleared', 'Cleared')], default='notpaid', max_length=30),
        ),
        migrations.AlterField(
            model_name='welfareloan',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('partialPaid', 'partialPaid'), ('pendingPayment', 'pendingPayment'), ('cleared', 'Cleared')], default='pending', max_length=30),
        ),
    ]
