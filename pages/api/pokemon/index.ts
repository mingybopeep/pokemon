// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next";
import { apiPaths } from "../consts";
import { typedRequest } from "../../../helper";
import { PrismaClient } from "@prisma/client";

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

    const client = new PrismaClient();
    const data = await client.pokemon.findMany({
      select: {
        name: true,
      },
    });

    return res.send({
      data: {
        count: 0,
        next: "",
        previous: "",
        results: data.map((p) => ({ ...p, url: "" })),
      },
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
