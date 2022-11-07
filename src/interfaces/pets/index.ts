import { User } from "../../entities/user.entity";

export interface IPetRequest {
  name: string;
  type: "dog" | "cat";
  age: string;
  neutered: boolean;
  vaccinated: boolean;
  docile: boolean;
}

export interface IPet extends IPetRequest {
  id: string;
  user?: User;
}

export interface IEditPet {
  name?: string;
  neutered?: boolean;
  vaccinated?: boolean;
  docile?: boolean;
}

export interface IPetAdminResponse extends IPet {
  owner: User;
}
