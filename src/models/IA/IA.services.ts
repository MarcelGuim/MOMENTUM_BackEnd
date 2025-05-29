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
    async getDayAndrequestsFromUserPetition(userText: string, userId: string): Promise<[Date, string[]][] | null> {
        if (!isValidObjectId(userId)) {
            throw new Error('Invalid user ID');
        }
        const usuari: IUsuari | null = await User.findById(userId);
        if (!usuari) throw new Error('User not found');
        const serviceTypes = getServiceTypeValues();

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
            if (!content) return null;
            const parsed = JSON.parse(content) as [Date, string[]][];
            return parsed;
        } catch (error) {
            console.error('Error in IAService:', error);
            throw new Error('Failed to process the request');
        }
    }
    async getOptimizedSchedule(requests: [Date, string[]][], userId: string): Promise<IAppointment[] | null> {
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
/*             requests.forEach((req) => {
                calendar.forEach((cal) => { 
                    const appointments: IAppointment[] = await calendarService.getAppointmentsForADay(req[0], cal._id);
                    if (appointments && appointments.length > 0) {totalAppointments.push(...appointments);}
                })
            }); */
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
            console.log(totallocationThatCanBeUsed);
        }
        return totalAppointments;
    }
}