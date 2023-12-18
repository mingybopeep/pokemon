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

export type GetPokemonResponse = {
  name: string;
  id: number;
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  };
  type: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenericResponse<GetPokemonResponse>>
) {
  try {
    if (req.method !== "GET") {
      return res.status(405);
    }

    const { name } = req.query;
    if (!name) {
      return res.status(422).send({
        errors: [
          {
            message: "MISSING_PARAM",
            pointer: '"name"',
          },
        ],
      });
    }

    const url = new URL(process.env.POKEMON_API_BASE);
    url.pathname = apiPaths.pokemon.get(name as unknown as string);
    const request = fetch(url.toString());
    const data = await typedRequest<GetPokemonResponse>(request);
    // todo: handle api errors
    const mapped: GetPokemonResponse = {
      name: data.name,
      id: data.id,
      stats: data.stats,
      type: data.type,
    };
    return res.send({ data: mapped });
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
