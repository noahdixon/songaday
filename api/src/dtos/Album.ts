interface Artist {
    name: string,
    link: string
}

export interface Album {
    id: string,
    link: string,
    title: string,
    artists: Artist[]
    year: string,
    image: string
}