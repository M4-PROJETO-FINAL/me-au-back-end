export interface IRoom {
	pet_id: string;
	room_type_id: string;
}

export interface IRoomType {
	id: string;
	url_image: string;
	title: string;
	description: string;
	tag: string;
	capacity: number;
	included_service: string;
	price: number;
}
