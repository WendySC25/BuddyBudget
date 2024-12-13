#!/usr/bin/env bash

./wait-for-it.sh db:3306 -- echo "Database timer concluded"

if [ "$1" = "celery-beat" ]; then
  ./wait-for-it.sh django:8000 -- echo "Celery-beat waiting for Django timer concluded"
fi

if [ "$1" = "django" ]; then
    python manage.py makemigrations
    python manage.py migrate
    python manage.py test
fi

shift
exec "$@"
