# Апи для сервисов tiande.ru

## Установка

```bash
$ npm install
```

## Настройка

Для настройки нужно создать файл с именем .env которое
содержит подключение к бд и другие настройки. Пример:

```s
PORT=3000

DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=
DATABASE_PASS=
DATABASE_NAME=
```

## Запуск

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Тестирование

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
