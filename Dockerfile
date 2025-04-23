FROM python:3-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY . /app/

RUN pip install -r requirements.txt && \
    groupadd -g 1001 serviceUserGroup && \
    useradd -m -u 1001 -g serviceUserGroup serviceUser

USER serviceUser
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]