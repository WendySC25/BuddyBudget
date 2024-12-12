from celery import shared_task
from django.core.mail import EmailMessage
from io import BytesIO

@shared_task
def test_task():
    print('this is a test')


@shared_task
def send_pdf_to_user(user_id):
    from django.contrib.auth import get_user_model
    from .models import Configuration
    from .views import PDFgeneration
    from django.test import RequestFactory

    User = get_user_model()
    user = User.objects.get(user_id=user_id)
    config = Configuration.objects.get(user=user)

    factory = RequestFactory()
    request = factory.get('/')
    request.user = user

    pdf_view = PDFgeneration()
    pdf_response = pdf_view.get(request)

    email = EmailMessage(
        subject=f"{config.send_time.capitalize()} Report",
        body="There is your sheduled report.",
        from_email="buddybudgetmail@gmail.com",
        to=[user.email],
    )
    email.attach("BuddyBudgetReport.pdf", pdf_response.getvalue(), "application/pdf")
    email.send()
