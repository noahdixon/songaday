import { Artist } from "./Artist"

export interface Album {
    id: string,
    link: string,
    title: string,
    artists?: Artist[]
    year?: string,
    image?: string
}