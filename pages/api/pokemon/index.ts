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

    let data = await client.statOnPokemon.groupBy({
      by: ["pokemonId"],
      where: {
        ...(statsArray.length > 0 && {
          OR: statsArray,
        }),
      },
      having: {
        pokemonId: {
          _count: {
            gte: statsArray.length,
          },
        },
      },
    });

    const pokemon = (
      await client.pokemon.findMany({
        where: {
          AND: [
            {
              id: {
                in: data.map((r) => r.pokemonId),
              },
            },
          ],
        },
      })
    ).filter((p) => !name || p.name.includes(name));

    return res.send({
      data: {
        count: 0,
        next: "",
        previous: "",
        results: pokemon.map((p) => ({ name: p.name, url: "" })),
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
