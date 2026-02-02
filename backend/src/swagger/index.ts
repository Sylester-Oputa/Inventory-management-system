import swaggerJSDoc from 'swagger-jsdoc';

export function createSwaggerSpec() {
  const isProduction = process.env.NODE_ENV === 'production';
  const sourcePatterns = isProduction
    ? ['./dist/controllers/*.js', './dist/routes/*.js', './dist/swagger/*.js']
    : ['./src/controllers/*.ts', './src/routes/*.ts', './src/swagger/*.ts'];

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'EliMed Local Backend',
        version: '1.0.0',
        description: 'Offline-first pharmacy POS backend with FEFO stock lots',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
          },
        },
      },
      security: [{ bearerAuth: [] }],
      servers: [{ url: 'http://localhost:4000' }],
    },
    apis: sourcePatterns,
  };

  return swaggerJSDoc(options);
}
