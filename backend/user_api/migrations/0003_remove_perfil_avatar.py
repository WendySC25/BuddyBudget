# Generated by Django 4.1.5 on 2024-11-06 04:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user_api', '0002_perfil'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='perfil',
            name='avatar',
        ),
    ]