import { IPetRequest } from "../../interfaces/pets/index";
import { IReviewRequest } from "../../interfaces/reviews/index";
import { IUserLogin, IUserRequest } from "../../interfaces/users/index";

export const mockedUser: IUserRequest = {
	name: "Nicholas user",
	email: "nicholas@user.com",
	password: "passw23#W",
	is_adm: false,
	cpf: "124.224.194-33",
	profile_img:
		"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe8IQrpci_lb0KcKSoTutxeFX25kDxHk2SfcDguEUp&s",
};

export const mockedAdmin: IUserRequest = {
	name: "Gui administrator",
	email: "gui@admin.com",
	password: "Example!Test@",
	is_adm: true,
	cpf: "123.144.194-33",
	profile_img:
		"https://images.ctfassets.net/hrltx12pl8hq/7yQR5uJhwEkRfjwMFJ7bUK/dc52a0913e8ff8b5c276177890eb0129/offset_comp_772626-opt.jpg?fit=fill&w=800&h=300",
};

export const mockedUserLogin: IUserLogin = {
	email: "nicholas@user.com",
	password: "passw23#W",
};

export const mockedAdminLogin: IUserLogin = {
	email: "gui@admin.com",
	password: "Example!Test@",
};

export const mockedReview: IReviewRequest = {
	review_text: "Adorei a equipe, super simpática e ótimo atendimento!",
	star: "5",
};

export const mockedPet: IPetRequest = {
	name: "Mimoso",
	type: "cat",
	age: "1 ano",
	neutered: true,
	vaccinated: true,
	docile: true,
};
