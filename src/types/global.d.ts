declare interface VocalPart {
  text: string;
  part?: string; // Allow any string for flexibility with JSON data
}

declare interface Song {
  number: number;
  title: string;
  verse: string[];
  chorus: string;
  author?: string;
  // Optional property for songs with multiple vocal parts
  chorusParts?: VocalPart[];
}

declare interface HttpResponse<T> extends Response {
  parsedBody?: T;
}

declare interface PosT {
  prevPos: { x: number; y: number };
  currPos: { x: number; y: number };
}

declare interface IDBFactory extends IDBFactory {
  databases: () => Promise<{ name: string }[]>;
}

declare type DBSchema = import('idb/with-async-ittr').DBSchema;

declare interface SongsTDB extends DBSchema {
  song: {
    key: string;
    value: Song;
    indexes: {
      number: string;
      title: string;
    };
  };
}
