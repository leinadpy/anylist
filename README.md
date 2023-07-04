<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Development - Instructions

1. Clone the project.
2. Copy the ```env.template``` and rename it to ```.env```.
3. Execute the following command:
```
yarn install
```
4. Run the image (Docker desktop)
```
docker-compose up -d
```
5. Run the backend server of NestJS:
```
yarn start:dev
```
6. Go to the site:
```
localhost:3000/graphql
```
7. Execute the __"mutation"__ executeSeed, to fill the database with the information