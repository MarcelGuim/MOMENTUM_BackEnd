import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { appointmentServiceType } from './enums/appointmentServiceType.enum';
import { appointmentState } from './enums/appointmentState.enum';

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
                    required: ['user1','typeOfUser1', 'user2','typeOfUser2', 'message', '_id?'],
                    properties: {
                        user1: {
                            type: 'string',
                        },
                        typeOfUser1: {
                            type: 'String',
                        },
                        user2: {
                            type: 'string',
                        },
                        typeOfUser2: {
                            type: 'String',
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
                  required: ['inTime', 'outTime', 'title', 'serviceType', 'isDeleted'],
                  properties: {
                      inTime: {
                          type: 'string',
                          format: 'date-time',
                          description: 'Start time of the appointment',
                          example: '2025-05-01T10:00:00Z'
                      },
                      outTime: {
                          type: 'string',
                          format: 'date-time',
                          description: 'End time of the appointment',
                          example: '2025-05-01T11:00:00Z'
                      },
                      title: {
                          type: 'string',
                          description: 'Title of the appointment',
                          example: 'Physical Therapy Session'
                      },
                      description: {
                          type: 'string',
                          description: 'Detailed description of the appointment',
                          example: 'Initial consultation with Dr. Smith'
                      },
                      location: {
                          type: 'string',
                          description: 'Reference to Location document',
                          example: '6620162b9b1c1c6a0d5f739e'
                      },
                      serviceType: {
                          type: 'string',
                          enum: Object.values(appointmentServiceType),
                          description: 'Type of service being provided',
                          example: appointmentServiceType.PERSONAL
                      },
                      appointmentState: {
                          type: 'string',
                          enum: Object.values(appointmentState),
                          description: 'Current state of the appointment',
                          example: appointmentState.REQUESTED
                      },
                      colour: {
                          type: 'string',
                          description: 'Color code for calendar display',
                          example: '#228be6'
                      },
                      customAddress: {
                          type: 'string',
                          description: 'Human-readable address when not using a Location reference',
                          example: '123 Main St, Apt 4B, New York'
                      },
                      customUbicacion: {
                          type: 'object',
                          description: 'GeoJSON Point coordinates when not using a Location reference',
                          properties: {
                              type: {
                                  type: 'string',
                                  enum: ['Point'],
                                  example: 'Point'
                              },
                              coordinates: {
                                  type: 'array',
                                  items: {
                                      type: 'number',
                                      format: 'float'
                                  },
                                  minItems: 2,
                                  maxItems: 2,
                                  example: [2.1744, 41.4036]
                              }
                          }
                      },
                      isDeleted: {
                          type: 'boolean',
                          default: false,
                          readOnly: true,
                          description: 'Soft delete flag'
                      }
                  }
                },
                Business: {
                    type: 'object',
                    required: ['name', 'location'],
                    properties: {
                      name: {
                        type: 'string',
                        example: 'Anytime fitness',
                      },
                      location: {
                          type: 'array',
                          items: {
                              type: 'string',
                              description: 'IDs dels locations associats al negoci',
                          },
                          example: ['661f5c0f7d4f1e3f8e8b4567', '661f5c0f7d4f1e3f8e8b4568'],
                      },
                      isDeleted: {
                          type: 'boolean',
                          default: false,
                          readOnly: true,
                          description: 'Indica si el negoci está marcat com eliminat',
                      },
                  },
              },
              Location: {
                  type: 'object',
                  required: ['nombre', 'address', 'phone', 'rating', 'ubicacion', 'serviceType', 'schedule'],
                  properties: {
                      _id: { type: 'string', example: '6620162b9b1c1c6a0d5f739e' },
                      nombre: { type: 'string', example: 'Saló de Bellesa El Mirall' },
                      address: { type: 'string', example: 'Carrer dels Pins, 42, Girona' },
                      phone: { type: 'string', example: '+34 612 345 678' },
                      rating: { type: 'number', example: 4.7 },
                      ubicacion: {
                          type: 'object',
                          required: ['type', 'coordinates'],
                          properties: {
                              type: {
                                  type: 'string',
                                  enum: ['Point'],
                                  example: 'Point',
                              },
                              coordinates: {
                                  type: 'array',
                                  minItems: 2,
                                  maxItems: 2,
                                  items: { type: 'number' },
                                  example: [2.1744, 41.4036],
                              },
                          },
                      },
                      serviceType: {
                          type: 'array',
                          items: {
                              type: 'string',
                              description: 'Un dels valors definits a locationServiceType (ex: "massage", "tattoo", "gym workout", etc.)',
                          },
                          example: ['massage', 'gym workout'],
                      },
                      schedule: {
                          type: 'array',
                          items: {
                              type: 'object',
                              required: ['day', 'open', 'close'],
                              properties: {
                                  day: {
                                      type: 'string',
                                      description: 'Un dels dies de la setmana: monday, tuesday, etc.',
                                      example: 'monday',
                                  },
                                  open: { type: 'string', example: '09:00' },
                                  close: { type: 'string', example: '20:00' },
                              },
                          },
                      },
                      isDeleted: {
                          type: 'boolean',
                          default: false,
                          readOnly: true,
                          description: 'Indica si la ubicació està marcada com eliminada',
                      },
                  },
              },
              AppointmentRequest: {
                  type: 'object',
                  required: ['inTime', 'outTime', 'title', 'serviceType'],
                  properties: {
                      inTime: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-05-01T10:00:00Z',
                      },
                      outTime: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-05-01T11:00:00Z',
                      },
                      title: {
                          type: 'string',
                          example: 'Sessió de fisioteràpia',
                      },
                      description: {
                          type: 'string',
                          example: "Fisioteràpia per l'esquena",
                      },
                      location: {
                          type: 'string',
                          description: 'ID d’una ubicació (ObjectId de Mongo)',
                      },
                      serviceType: {
                          type: 'string',
                          enum: [
                              'personal', 'haircut', 'hair coloring', 'hair treatment', 'beard trim', 'facial cleansing',
                              'makeup', 'manicure', 'pedicure', 'eyebrows and lashes', 'waxing', 'relaxing massage',
                              'medical appointment', 'physiotherapy', 'therapy session', 'dentist appointment', 'nutritionist',
                              'gym workout', 'yoga class', 'pilates class', 'boxing class', 'swimming session', 'personal training',
                              'restaurant reservation', 'takeaway order', 'catering service', 'private dinner', 'wine tasting',
                              'tattoo', 'piercing', 'language class', 'music lesson', 'dance class', 'coaching session'
                          ],
                          example: 'physiotherapy'
                      },
                      appointmentState: {
                          type: 'string',
                          enum: ['requested', 'accepted', 'rejected'],
                          default: 'requested',
                      },
                      colour: {
                          type: 'string',
                          example: '#FF5733',
                      },
                  },
              },
          },
      },
      security: [{ bearerAuth: [] }]
  },
  apis: process.env.NODE_ENV == "production" ? ['./dist/**/*.js'] : ['./src/**/*.ts'],
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