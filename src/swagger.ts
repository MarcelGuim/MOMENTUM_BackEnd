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
                        },
                    },
                },
                Calendar: {
                    type: 'object',
                    required: ['owner', 'name', 'appointments', 'invitees'],
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
                        },
                    },
                },
                Appointment: {
                    type: 'object',
                    required: ['inTime', 'outTime', 'place', 'title'], // Actualizado para coincidir con el modelo
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
                            description: 'Indica si la cita está marcada como eliminada',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/**/*.ts'], // Busca en todos los archivos TypeScript en la carpeta src
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application): void {
    console.log('Setting up Swagger');
    app.use('/Swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}