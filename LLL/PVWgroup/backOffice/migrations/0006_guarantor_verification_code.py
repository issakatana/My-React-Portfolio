# Generated by Django 5.0 on 2024-01-19 06:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backOffice', '0005_alter_reducingtable_status_alter_welfareloan_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='guarantor',
            name='verification_code',
            field=models.CharField(blank=True, max_length=6, null=True, unique=True),
        ),
    ]