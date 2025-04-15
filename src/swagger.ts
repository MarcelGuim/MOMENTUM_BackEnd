import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import dotenv from 'dotenv';

dotenv.config();

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
                url: process.env.APP_BASE_URL || 'http://localhost:8080',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            },
            schemas: {
                Chat: {
                    type: 'object',
                    required: ['user1', 'user2', 'message', '_id?'],
                    properties: {
                        user1: {
                            type: 'string',
                        },
                        user2: {
                            type: 'string',
                        },
                        message: {
                            type: '[string,string,boolean,date]',
                        },
                        _id: {
                            type: 'string',
                        },
                    },
                },
                User: {
                    type: 'object',
                    required: ['name', 'age', 'mail', 'password'],
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
                        isDeleted: {
                            type: 'boolean',
                            default: false,
                            readOnly: true, // Mark as read-only
                        },
                    },
                },
                Calendar: {
                    type: 'object',
                    required: ['owner', 'name', 'appointments', 'invitees'], // Removed `isDeleted` from required
                    properties: {
                        owner: {
                            type: 'string',
                            description: 'ID del usuario asociado',
                        },
                        name: {
                            type: 'string',
                            description: 'Displayed name of the calendar',
                        },
                        appointments: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'IDs de las citas',
                        },
                        invitees: {
                            type: 'array',
                            items: {
                                type: 'string',
                                description: 'IDs dels usuaris amb accés al calendari'
                            }
                        },
                        isDeleted: {
                            type: 'boolean',
                            default: false,
                            readOnly: true, // Mark as read-only
                        },
                    },
                },
                Appointment: {
                    type: 'object',
                    required: ['inTime', 'outTime', 'place', 'title'], // Removed `isDeleted` from required
                    properties: {
                        inTime: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha y hora de inicio',
                        },
                        outTime: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha y hora de fin',
                        },
                        place: {
                            type: 'string',
                            description: 'Lugar de la cita',
                        },
                        title: {
                            type: 'string',
                            description: 'Título de la cita',
                        },
                        isDeleted: {
                            type: 'boolean',
                            default: false,
                            readOnly: true, // Mark as read-only
                            description: 'Indica si la cita está marcada como eliminada',
                        },
                    },
                },
            },
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/**/*.ts'], // Busca en todos los archivos TypeScript en la carpeta src
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application): void {
    console.log('Setting up Swagger');

    const swaggerOptions = {
        swaggerOptions: {
            requestInterceptor: (req: any, res: Response) => {  // Explicitly define the types of req and res
                req.credentials = 'include'; // Attach credentials (for example, cookies) to the request if needed
                return req;
            }
        }
    };
    app.use('/Swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}