import { Type as PrismaType, Stat as PrismaStat } from "@prisma/client";

export type ResponseError = {
  pointer?: string;
  message: string;
};

export type GenericResponse<T> = {
  data?: T;
  errors?: ResponseError[];
};

export type PokemonLite = {
  name: string;
  url: string;
};

export type GetPokemonResponse = {
  name: string;
  id: number;
  stats: Stat[];
  types: Type[];
};

export type Type = {
  slot: number;
  type: {
    name: string;
    url: string;
  };
};

export type Stat = {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
};

export type ListPokemonReponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonLite[];
};

export type GetTypesResponse = {
  stats: PrismaStat[];
  types: PrismaType[];
};
