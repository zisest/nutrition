# Nutrition helper


[![site](https://img.shields.io/badge/website-up-brightgreen)](https://nutrition.zisest.ru/)

Приложение создано как часть выпускной квалификационной работы бакалавра. СПбГУ 2020.

## О проекте
[![](https://zisest.ru/files/nutrition-helper.gif)](https://nutrition.zisest.ru/)

Данное приложение предоставляет возможность рассчитать энергетические затраты человека по его физиологическим характеристикам, а также генерировать индивидуализированные планы питания, учитывающие пользовательские предпочтения.

## Демо
Развернутое веб-приложение доступно по ссылке: [nutrition.zisest.ru](https://nutrition.zisest.ru).

## Использованные технологии
- Python
	- NumPy, Pandas, Keras
	- PuLP
	- Django
- PostgreSQL
- React

## Локальная развертка
Для запуска Django-сервера необходимо:
1. Склонировать репозиторий
2. Переименовать файл `Django_nutrition/settings_local.py` в `settings.py`
3. Установить необходимые пакеты: `pip install -r requirements.txt`
4. Задать следующие переменные среды:
```
SECRET_KEY=[секретный ключ Django приложения]
DATABASE_URL=[ссылка для подключения к PostgreSQL БД]
DEBUG=[значения on/off]
DJANGO_SETTINGS_MODULE=Django_nutrition.settings
```
5. Применить миграции к базе данных: `pyhton manage.py migrate`
6. Создать суперпользователя: `pyhton manage.py createsuperuser`
7. Запустить сервер: `python manage.py runserver 5000`

Приложение доступно на порте 5000, для клиентской части приложения используются файлы из директории `client/build`. Для запуска dev-сервера React следует:
1. Установить необходимые пакеты: `cd client` > `npm install`
2. Запустить сервер: `npm run start`

Dev-сервер по умолчанию доступен на порте 3000.
