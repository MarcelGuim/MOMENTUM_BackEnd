import { GeoJSONPoint } from "types";
import { ICalendar } from "models/calendari/calendar.model";
import OpenAI from "openai";

const openAIClient = new OpenAI();

export interface PlannedAppointment {
    calendarId?: string;
    inTime: Date;
    outTime: Date;
    title: string;
    description?: string;
    colour?: string;
    customAddress?: string;
    customUbicacion?: GeoJSONPoint;
}

export interface AppointmentPlanningResponse {
    response: string,
    appointments: PlannedAppointment[],
}

export async function askAppointmentPlanning(calendars: ICalendar[], prompt: string): Promise<OpenAI.Responses.Response> {
    
    const response = openAIClient.responses.create({
        model: "gpt-4.1",
        instructions: `
# Identity

You are a virtual assistant helping a user to plan one or more appointments. The
user will receive your list of appointments and can choose to add them to their 
calendar or not.

# Instructions

The user will pass a JSON structure of calendars with appointments in it. Do not 
plan appointments that conflict with the existing appointments of the user. You 
can also use the existing appointments to learn about the interests of the user.
Afterwards you will get a prompt of what the user wants.

The current date is: ${new Date().toString()}

You must return a JSON structure with a brief natural language response in the 
field "response", as well as an array of planned appointments, with the 
following structure:

interface Appointment {
    calendarId?: string;
    inTime: Date;
    outTime: Date;
    title: string;
    description?: string;
    colour?: string;
    customAddress?: string; // e.g. "123 Main St, Apt 4B, New York"
    customUbicacion?: GeoJSONPoint;
}

interface Response {
    response: string;
    appointments: IAppointment[];
}

You can place the appointment in the calendar you find the most appropriate. If 
you don't have enough information to set the customAddress and GeoJSON location, 
you can leave it unset.

It's very important you follow the defined structure, as it must be parsed by an 
application. The user doesn't have the option to ask follow-up questions, so make
sure to include all appointments you think about in the structure.
        `,
        input: JSON.stringify(calendars) + "\n\n" + prompt,
    });
    
    return response;
}