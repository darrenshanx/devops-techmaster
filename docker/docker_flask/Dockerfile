FROM python:3.9-slim-buster
ENV FLASK_APP = /app/hello_flask.py
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["./app_run.sh"]