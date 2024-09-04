import { Artist } from "./Artist"

export interface Song {
    id: string,
    title: string,
    link: string,
    artists: Artist[]
    album: string
    albumLink: string
    year: string,
    popularity: number,
    explicit: boolean
    image: string
}