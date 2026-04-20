export interface Job {
	id?: number;
	title: string;
	description: string;
}

export interface News {
	id?: number;
	title: string;
	description: string;
	urgent?: boolean;
}

export interface Contact {
	title: string;
	subject?: string;
	priority?: boolean;
}