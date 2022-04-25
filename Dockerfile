FROM node:14-alpine AS client

ENV NODE_ENV production

WORKDIR /front

COPY /client/package.json /front/
COPY /client/package-lock.json /front/

RUN npm ci

COPY /client /front/
RUN npm run build


# stage 2
FROM python:3.6 AS backend
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ARG SECRET_KEY
ARG WEIGHTS_KEY
ARG DATABASE_URL

ENV SECRET_KEY $SECRET_KEY
ENV WEIGHTS_KEY $WEIGHTS_KEY
ENV DATABASE_URL $DATABASE_URL

WORKDIR /app/backend
COPY /backend/requirements.txt /app/backend/
RUN pip install -r requirements.txt
RUN pip install gunicorn
COPY /backend /app/backend/

COPY --from=client /front/build /app/client/build

RUN python manage.py makemigrations
RUN python manage.py migrate

EXPOSE 8000
CMD gunicorn --bind :8000 --workers 2 Django_nutrition.wsgi
