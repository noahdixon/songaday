export type Entity = "song" | "album" | "artist";

export function isEntity(value: any): value is Entity {
    const validEntities: Entity[] = ["song", "album", "artist"];
    return validEntities.includes(value);
}