import { IEditPet, IPetRequest } from "../../interfaces/pets/index";
import { IReservationRequest } from "../../interfaces/reservations";
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
  stars: 5,
  reservation_id: "",
};

export const mockedReviewInvalidStarZero: IReviewRequest = {
  review_text: "Adorei a equipe, super simpática e ótimo atendimento!",
  stars: 0,
  reservation_id: "",
};

export const mockedReviewInvalidStarsSix: IReviewRequest = {
  review_text: "Adorei a equipe, super simpática e ótimo atendimento!",
  stars: 6,
  reservation_id: "",
};

export const mockedReviewInvalidStarsWithout: Object = {
  review_text: "Adorei a equipe, super simpática e ótimo atendimento!",
};

export const mockedReviewInvalidTextWithout: Object = {
  stars: 6,
};

export const mockedCat: IPetRequest = {
  name: "Mimoso",
  type: "cat",
  age: "1 ano",
  neutered: false,
  vaccinated: false,
  docile: true,
};

export const mockedDog: IPetRequest = {
  name: "Doguinho",
  type: "dog",
  age: "4 meses",
  neutered: true,
  vaccinated: true,
  docile: true,
};

export const mockedEditPet: IEditPet = {
  name: "Novo nome do bicho",
  neutered: true,
  vaccinated: true,
};

export const mockedReservation: IReservationRequest = {
  checkin: "2022-08-20",
  checkout: "2022-08-23",
  pet_rooms: [
    {
      pet_id: "1234",
      room_type_id: "",
    },
  ],
  services: [
    {
      service_id: "",
      amount: 2,
    },
  ],
};

export const mockedReservationInvalidDate: IReservationRequest = {
  checkin: "",
  checkout: "2022-08-23",
  pet_rooms: [
    {
      pet_id: "1234",
      room_type_id: "",
    },
  ],
  services: [
    {
      service_id: "",
      amount: 2,
    },
  ],
};

export const mockedReservationDog: IReservationRequest = {
  checkin: "2022-08-20",
  checkout: "2022-08-23",
  pet_rooms: [
    {
      pet_id: "",
      room_type_id: "",
    },
  ],
  services: [
    {
      service_id: "",
      amount: 2,
    },
  ],
};

export const mockedReservationCat: IReservationRequest = {
  checkin: "2022-08-21",
  checkout: "2022-08-23",
  pet_rooms: [
    {
      pet_id: "",
      room_type_id: "",
    },
  ],
  services: [
    {
      service_id: "",
      amount: 2,
    },
  ],
};
export const mockedReservationDatePassed: IReservationRequest = {
  checkin: "2019-08-20",
  checkout: "2019-08-23",
  pet_rooms: [
    {
      pet_id: "",
      room_type_id: "",
    },
  ],
  services: [
    {
      service_id: "",
      amount: 2,
    },
  ],
};
