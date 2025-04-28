
export interface PlaceQueryResult {
    name: string,
    id: string,
    longitude: string,
    latitude: string,
    address: string,
    rating: number,
}

export interface RouteQuertResult {
    durationSeconds: string // ends with the letter 's'
    durationReadable: string
}

