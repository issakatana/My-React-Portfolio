# Generated by Django 5.0 on 2024-01-11 12:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backOffice', '0002_alter_welfarestatistics_welfare_activemembers_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='advanceloan',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('cleared', 'Cleared')], default='pending', max_length=10),
        ),
        migrations.AlterField(
            model_name='guarantor',
            name='signature_status',
            field=models.CharField(choices=[('Pending', 'Pending Acceptance'), ('Accepted', 'Accepted'), ('Rejected', 'Rejected'), ('cleared', 'Cleared')], default='Pending', max_length=20),
        ),
    ]