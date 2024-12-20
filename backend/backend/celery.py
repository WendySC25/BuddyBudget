from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

app.conf.enable_utc = False
app.conf.timezone = 'America/Mexico_City'
app.conf.beat_max_loop_interval = 45
app.conf.beat_scheduler = 'django_celery_beat.schedulers.DatabaseScheduler'

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')