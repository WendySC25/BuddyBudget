#Dockerfile from Backend
FROM python:3.8-slim

RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    gcc \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --upgrade pip

WORKDIR /app

COPY ./requirements.txt .
RUN pip3 install -r requirements.txt
COPY ./wait-for-it.sh /wait-for-it.sh


COPY . .

CMD python3 manage.py makemigrations && \
python3 manage.py migrate --no-input && \
python3 manage.py runserver 0.0.0.0:8000
