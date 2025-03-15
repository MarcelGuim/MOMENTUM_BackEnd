import { PlaceQueryResult } from "./location.interfaces";



export async function getPlaces(lonmin: number, latmin: number, lonmax: number, latmax: number, query: string): Promise<PlaceQueryResult[]>{
    const url = "https://places.googleapis.com/v1/places:searchText";
    const apikey = process.env.GOOGLE_APIKEY;
    if(!apikey) throw new Error('❌ Google API key is not defined');
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            textQuery: query,
            locationBias: {
                rectangle: {
                    low: {
                        longitude: lonmin,
                        latitude: latmin,
                    },
                    high: {
                        longitude: lonmax,
                        latitude: latmax,
                    },
                },
            },
            pageSize: 10,
        }),
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apikey,
            "X-Goog-FieldMask": "places", 
        }
    })
    const responseObject = await response.json();
    return responseObject.places.map((p: any) => {
        const place: PlaceQueryResult = {
            id: p.id,
            name: p.displayName.text,
            address: p.formattedAddress,
            longitude: p.location.longitude,
            latitude: p.location.latitude,
            rating: p.rating,
        };

        return place;
    });
}