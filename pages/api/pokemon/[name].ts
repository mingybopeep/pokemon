// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { GenericResponse, GetPokemonResponse } from "../consts";

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

    const client = new PrismaClient();

    const data = await client.pokemon.findFirst({
      where: {
        name: name as string,
      },
      include: {
        StatOnPokemon: {
          include: {
            stat: true,
          },
        },
        TypeOnPokemon: {
          include: {
            type: true,
          },
        },
      },
    });

    const mapped: GetPokemonResponse = {
      name: data.name,
      id: data.id,
      stats: data.StatOnPokemon.map((sop) => ({
        base_stat: sop.base,
        effort: sop.effort,
        stat: {
          name: sop.stat.name,
          url: "",
        },
      })),
      types: data.TypeOnPokemon.map((top) => ({
        slot: top.slot,
        type: {
          name: top.type.name,
          url: "",
        },
      })),
    };
    return res.send({ data: mapped });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      errors: [
        {
          message: "INTERNAL_SERVER_ERROR",
        },
      ],
    });
  }
}
