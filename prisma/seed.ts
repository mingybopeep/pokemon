import { PrismaClient } from "@prisma/client";
import { GetPokemonResponse } from "../pages/api/pokemon/[name]";

const client = new PrismaClient();
const seed = async () => {
  // fetch all 151 pokemon
  const allPokemon: GetPokemonResponse[] = [];
  let count = 1;
  while (count < 152) {
    count++;
    const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + count);
    const pokemon = (await res.json()) as GetPokemonResponse;

    allPokemon.push(pokemon);
  }

  // create types
  const typeMap = new Map<string, number>();
  const uniqueTypes = [
    ...new Set(allPokemon.map((p) => p.types.map((t) => t.type.name)).flat()),
  ];
  for (const name of uniqueTypes) {
    const createdType = await client.type.create({
      data: {
        name,
      },
      select: {
        id: true,
      },
    });
    typeMap.set(name, createdType.id);
  }

  // create stats
  const statMap = new Map<string, number>();
  const uniqueStats = [
    ...new Set(allPokemon.map((p) => p.stats.map((t) => t.stat.name)).flat()),
  ];
  for (const name of uniqueStats) {
    const createdType = await client.stat.create({
      data: {
        name,
      },
      select: {
        id: true,
      },
    });
    statMap.set(name, createdType.id);
  }

  // add pokemon
  for (const p of allPokemon) {
    const created = await client.pokemon.create({
      data: {
        name: p.name,
      },
      select: {
        id: true,
      },
    });

    for (const t of p.types) {
      await client.typeOnPokemon.create({
        data: {
          pokemonId: created.id,
          typeId: typeMap.get(t.type.name),
          slot: t.slot,
        },
      });
    }

    for (const s of p.stats) {
      await client.statOnPokemon.create({
        data: {
          pokemonId: created.id,
          statId: statMap.get(s.stat.name),
          base: s.base_stat,
          effort: s.effort,
        },
      });
    }
  }
};

seed().then(() => console.log("done"));
