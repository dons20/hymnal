declare interface Song {
	number: number;
	title: string;
	verse: string[];
	chorus: string;
	author: string;
}

declare interface HttpResponse<T> extends Response {
	parsedBody?: T;
}

declare interface PosT {
	prevPos: { x: number; y: number };
	currPos: { x: number; y: number };
}
