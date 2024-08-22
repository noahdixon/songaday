interface Artist {
    name: string,
    link: string
}

export interface Song {
    id: string,
    link: string,
    title: string,
    artists: Artist[]
    album: string
    albumLink: string
    year: string,
    popularity: number,
    explicit: boolean
    image: string
}