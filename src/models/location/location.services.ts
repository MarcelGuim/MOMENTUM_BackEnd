import { PlaceQueryResult, RouteQuertResult } from "./location.interfaces";



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

export type TravelMode = "DRIVE" | "BICYCLE" | "WALK" | "TRANSIT"

export async function getRouteInfo(lon1: number, lat1: number, lon2: number, lat2: number, travelMode: TravelMode) {
    const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
    const apikey = process.env.GOOGLE_APIKEY;
    if(!apikey) throw new Error('❌ Google API key is not defined');
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            origin: {
                location: {
                    latLng: {
                        latitude: lat1,
                        longitude: lon1,
                    }
                }
            },
            destination: {
                location: {
                    latLng: {
                        latitude: lat2,
                        longitude: lon2,
                    }
                }
            },
            travelMode: travelMode,
            computeAlternativeRoutes: false,
            units: "METRIC",
        }),
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apikey,
            "X-Goog-FieldMask": "routes.duration,routes.duration,routes.localizedValues.duration", 
        }
    });

    const responseObject = await response.json();
    return responseObject.routes.map((r: any) => {
        const route: RouteQuertResult = {
            durationReadable: r.localizedValues.duration.text,
            durationSeconds: r.duration,
        }
        return route;
    });
}