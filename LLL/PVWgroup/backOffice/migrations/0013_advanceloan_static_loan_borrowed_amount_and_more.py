# Generated by Django 5.0 on 2024-01-28 20:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backOffice', '0012_alter_advanceloan_status_alter_reducingtable_status_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='advanceloan',
            name='static_loan_borrowed_amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='welfareloan',
            name='static_loan_borrowed_amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
