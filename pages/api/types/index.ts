// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { GenericResponse, GetTypesResponse } from "../consts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenericResponse<GetTypesResponse>>
) {
  try {
    if (req.method !== "GET") {
      return res.status(405);
    }

    const client = new PrismaClient();
    const stats = await client.stat.findMany();
    const types = await client.type.findMany();

    return res.send({
      data: {
        stats,
        types,
      },
    });
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
