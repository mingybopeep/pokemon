// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next";
import { apiPaths } from "../consts";
import { typedRequest } from "../../../helper";

type ResponseError = {
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

export type ListPokemonReponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonLite[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenericResponse<ListPokemonReponse>>
) {
  try {
    if (req.method !== "GET") {
      return res.status(405);
    }

    const url = new URL(process.env.POKEMON_API_BASE);
    url.pathname = apiPaths.pokemon.getAll();
    url.searchParams.set("limit", "151");
    url.searchParams.set("offset", "0");
    const request = fetch(url.toString());
    const data = await typedRequest<ListPokemonReponse>(request);
    return res.send({
      data,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      errors: [
        {
          message: "INTERNAL_SERVER_ERROR",
        },
      ],
    });
  }
}
