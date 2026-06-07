const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkillTree API',
      version: '1.0.0',
      description: 'API для веб-приложения SkillTree — управления и визуализации прогресса в освоении IT-навыков',
      contact: {
        name: 'Капшукова Дарья Руслановна',
        email: 'kapshykova9@mail.ru',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Локальный сервер разработки',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./index.js'], 
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };