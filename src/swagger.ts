
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CRUD API',
            version: '1.0.0',
            description: 'API documentation for the CRUD application',
        },
        servers: [
            {
                url: 'http://localhost:8080',
            },
        ],
        components: {
            schemas: {
                Chat: {
                    type: 'object',
                    required: ['from', 'to', 'message', 'recieved'],
                    properties: {
                        from: {
                            type: 'string',
                        },
                        to: {
                            type: 'string',
                        },
                        message: {
                            type: 'string',
                        },
                        recieved: {
                            type: 'string',
                        },
                    },
                },
                User: {
                    type: 'object',
                    required: ['name', 'age', 'mail','password'],
                    properties: {
                        name: {
                            type: 'string',
                        },
                        age: {
                            type: 'number',
                        },
                        mail: {
                            type: 'string',
                        },
                        password: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    },
    //apis: ['./models/chats/chat.routes.ts', './models/users/user.routes.ts'], // Archivos donde están definidos los endpoints
    apis: ['./src/**/*.ts']
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application): void {
    console.log('Setting up Swagger');
    app.use('/Swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
