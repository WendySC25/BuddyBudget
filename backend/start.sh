#!/bin/sh

./wait-for-it.sh db:3306 --timeout=15 --strict -- echo "Database is ready."

python3 manage.py migrate

python3 manage.py runserver 0.0.0.0:8000
