#Dockerfile from Backend
FROM python:3.8-slim

RUN apt-get update && apt-get install -y build-essential

RUN pip3 install --upgrade pip

WORKDIR /app

COPY ./requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .

CMD python3 manage.py makemigrations && \
python3 manage.py migrate --no-input && \
python3 manage.py runserver 0.0.0.0:8000
