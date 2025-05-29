import OpenAI from 'openai';
import { appointmentServiceType } from '../../enums/appointmentServiceType.enum';
import Appointment, {IAppointment} from '../appointment/appointment.model';
import Calendar, {ICalendar} from '../calendari/calendar.model';
import User, {IUsuari} from '../users/user.model';
import { isValidObjectId } from 'mongoose';
import { CalendarService } from '../calendari/calendar.services';
import { ILocation } from 'models/location/location.model';
import { LocationService } from '../location/location.services';
import { locationServiceType } from 'enums/locationServiceType.enum';

function getServiceTypeValues(): string[] {
  return Object.values(appointmentServiceType);
}

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const calendarService = new CalendarService();
const locationService = new LocationService();
export class IAService {
    async getDayAndrequestsFromUserPetition(userText: string, userId: string): Promise<[Date, string[]][]> {
        if (!isValidObjectId(userId)) {
            throw new Error('Invalid user ID');
        }
        const usuari: IUsuari | null = await User.findById(userId);
        if (!usuari) throw new Error('User not found');
        const serviceTypes = getServiceTypeValues();
        const today = new Date();
        const systemMessage = `
            You are an assistant that extracts data requests for a calendar based on a user request.
            Your task is to analyze the user's text and return a JSON array of items in the following format:
            [ [date_string, [list_of_services]] ]
            Rules you must follow;:
            - The date must be in ISO format (yyyy-mm-dd).
            - The list_of_services values must only include values from the following list: ${JSON.stringify(serviceTypes)}
            - If there are multiple dates and services, include all of them in separate entries.
            - If you cannot find any valid service or date, return an empty array.
            Respond ONLY with the raw JSON array, and nothing else.
            You might find the services are requested a bit differently, you must recognize them and return the one from the list that is the most approximated.
            For example, if the user asks for a "haircut", you should return "haircut" from the list of services.
            If the user tells you he wants to get the hair done, you should also return "haircut".
            Lastly, take into consideration the fact that today is ${JSON.stringify(today)}
            `.trim();
        try {
            const response = await client.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: userText },
                ],
            });
            const content = response.choices[0].message.content?.trim();
            if (!content) throw new Error("There has been an error treating the petiton, please try again in some other format");
            const cleaned = content.replace(/```(?:json)?/gi, '').trim();
            const parsed = JSON.parse(cleaned) as [Date, string[]][];
            return parsed;
        } catch (error) {
            console.error('Error in IAService:', error);
            throw new Error('Failed to process the request');
        }
    }
    async getOptimizedSchedule(requests: [Date, string[]][], userId: string): Promise<IAppointment[]> {
        if (!isValidObjectId(userId)) {
            throw new Error('Invalid user ID');
        }
        const usuari: IUsuari | null = await User.findById(userId);
        if (!usuari) throw new Error('User not found');
        const calendar: ICalendar[] |null = await calendarService.getCalendarsOfUser(userId);
        if (!calendar || calendar.length === 0) {
            throw new Error('No calendars found for the user');
        }
        const totalAppointments: IAppointment[] = [];
        const totallocationThatCanBeUsed: ILocation[] = [];
        for (const req of requests) {
            for (const cal of calendar) {
                if(!isValidObjectId(cal._id) || cal._id === undefined) throw new Error('Invalid calendar ID');
                else{
                    const appointments: IAppointment[] = await calendarService.getAppointmentsForADay(req[0], cal._id.toString());
                    if (appointments && appointments?.length) {
                    totalAppointments.push(...appointments);
                    }
                }
            }
            for (const service of req[1]) {
                if (!getServiceTypeValues().includes(service)) {
                    throw new Error(`Invalid service type: ${service}`);
                }
                const locationsAvailable: ILocation[] = await locationService.getAllLocationsByServiceType(service as locationServiceType);
                if (locationsAvailable.length > 0) {
                    totallocationThatCanBeUsed.push(...locationsAvailable);
                }
            }
        }
        if (totallocationThatCanBeUsed.length === 0) {
            throw new Error('No locations available for the requested services');
        }
        const finalLocations = Array.from(
            new Map(
                totallocationThatCanBeUsed.map(loc => [loc._id.toString(), loc])
            ).values()
        );
        const systemMessage = `
            You are an assistant that optimizes the schedule for a user based on their requests.
            Your task is to analyze the petition sent by the user, which incudes a set of dates and the services
            required for that date. The format will be as follows:
            [[date1, [service1, service2]], [date2, [service3, service4]]...] The service1 and 2 are requested for 
            date1 and service3 and 4 for date2.
            You will have to analyze the appointments already scheduled for the user in the calendar, and
            the locations available for the services requested. You will have to return a JSON array of objects of
            the new appointments that can be scheduled for the user toghether with the ones already booked.
            The format of the response MUST be an array of appointments, where an appointment is as follows:
            interface IAppointment {
                _id?: ObjectId;
                calendarId?: ObjectId;
                inTime: Date;
                outTime: Date;
                title: string;
                description?: string;
                location?: mongoose.Types.ObjectId;
                serviceType: appointmentServiceType;
                appointmentState?: appointmentState;
                colour?: string;
                customAddress?: string;
                customUbicacion?: GeoJSONPoint
            }

            You must fill as many of the fields as you can, with the information provided.
            The appointmentState must be standby for the new appointments.
            For the inTime and outTime, you must use the date provided in the request as the day, and the hour and minute
            you think is the best for the appointment, as well as the duration of the appointment.
            These dates must be in ISO format (yyyy-mm-ddTHH:mm:ss.sssZ).
            The request the user has are sent in the content of the petition.
            The appointments already scheduled for the user are: ${JSON.stringify(totalAppointments)}.
            The locations available for the services requested are: ${JSON.stringify(finalLocations)}.
            Remember, the output must be a JSON array of appointments, and nothing else.
            The order of the output must be in chronological order. Lastly, you must fill the description value with a short text.
            In the CalendarId section, use on of the calendarId you got from the user request.
            The colour, use a bright red.
            `.trim();
        try {
            const response = await client.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: JSON.stringify(requests) },
                ],
            });
            const content = response.choices[0].message.content?.trim();
            if (!content) throw new Error('Failed to process the request, ChatGPT did not answer');;
            const cleaned = content.replace(/```(?:json)?/gi, '').trim();
            const parsed = JSON.parse(cleaned) as IAppointment[];
            return parsed;
        } catch (error) {
            console.error('Error in IAService:', error);
            throw new Error('Failed to process the request');
        }
    }
}