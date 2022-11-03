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
}

export interface IEditPet {
  name?: string;
  neutered?: boolean;
  vaccinated?: boolean;
  docile?: boolean;
}
