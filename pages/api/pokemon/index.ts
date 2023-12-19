// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { GenericResponse, ListPokemonReponse } from "../consts";

export default async function handler(
  req: NextApiRequest, //type this
  res: NextApiResponse<GenericResponse<ListPokemonReponse>>
) {
  try {
    if (req.method !== "POST") {
      return res.status(405);
    }

    // todo: validate

    const { name, stats } = req.body;

    const statsArray = Object.keys(stats || {}).map((key) => ({
      statId: +key,
      base: {
        gt: stats[key].min,
        lt: stats[key].max,
      },
    }));

    const client = new PrismaClient();
    const data = (
      await client.statOnPokemon.findMany({
        distinct: ["pokemonId"],
        include: {
          pokemon: true,
        },
        where: {
          ...(statsArray.length > 0 && {
            AND: statsArray,
          }),
        },
      })
    ).filter((r) => !name || r.pokemon.name.includes(name));

    return res.send({
      data: {
        count: 0,
        next: "",
        previous: "",
        results: data.map((p) => ({ name: p.pokemon.name, url: "" })),
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      errors: [
        {
          message: "INTERNAL_SERVER_ERROR",
        },
      ],
    });
  }
}
