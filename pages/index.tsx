import type { GetStaticProps } from "next";
import Image from "next/image";
import React, { SetStateAction, useEffect, useState } from "react";
import { Type, Stat } from "@prisma/client";
import {
  GenericResponse,
  ListPokemonReponse,
  PokemonLite,
  GetPokemonResponse,
  GetTypesResponse,
} from "./api/consts";
import { typedRequest } from "../helper";

interface IHomeProps {
  pokemonList: PokemonLite[];
  types: Type[];
  stats: Stat[];
}

export type SearchFilters = {
  name: string;
  stats: {
    [key: number]: {
      min: number;
      max: number;
    };
  };
  types: {
    id: number;
  }[];
};
export default function Home({ pokemonList, stats, types }: IHomeProps) {
  const [selectedName, setSelectedName] = useState("");

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    name: "",
    stats: [],
    types: [],
  });
  const [searchResults, setSearchResults] = useState<PokemonLite[]>();
  const [searchState, setSearchState] = useState<"loading" | "error" | null>(
    null
  );

  const onSearch = () => {
    setSearchState("loading");

    const url = new URL("http://localhost:3000/api/pokemon/");

    const fetchPromise = fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchFilters),
    });

    typedRequest<GenericResponse<ListPokemonReponse>>(fetchPromise)
      .then((data) => {
        if (!data.data.results.map((p) => p.name).includes(selectedName)) {
          setSelectedName("");
        }

        setSearchResults(data.data.results);
        setSearchState(null);
      })
      .catch(() => setSearchState("error"));
  };

  const data = searchResults || pokemonList;

  return (
    <>
      <SideBar
        stats={stats}
        types={types}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        pokemonList={data}
        selected={selectedName}
        setSelected={setSelectedName}
        onSearch={onSearch}
        searchState={searchState}
      />
      <PokemonView selectedName={selectedName} />
    </>
  );
}

export const getStaticProps = (async () => {
  // pokemon
  const url = new URL("http://localhost:3000/api/pokemon/");
  const fetchPromise = fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const res = await typedRequest<GenericResponse<ListPokemonReponse>>(
    fetchPromise
  );

  const {
    data: { results: pokemonList },
  } = res;

  // types data
  const typesPromise = fetch("http://localhost:3000/api/types");
  const typesRes = await typedRequest<GenericResponse<GetTypesResponse>>(
    typesPromise
  );
  const {
    data: { types, stats },
  } = typesRes;

  return { props: { pokemonList, types, stats } };
}) satisfies GetStaticProps<{
  pokemonList: PokemonLite[];
  types: Type[];
  stats: Stat[];
}>;

interface ISideBarProps extends IHomeProps {
  selected: string;
  setSelected: React.Dispatch<SetStateAction<String>>;
  searchFilters: SearchFilters;
  setSearchFilters: React.Dispatch<SetStateAction<SearchFilters>>;
  onSearch: () => void;
  searchState: "loading" | "error" | "null";
  stats: Stat[];
  types: Type[];
}
const SideBar = ({
  pokemonList,
  selected,
  setSelected,
  searchFilters,
  setSearchFilters,
  onSearch,
  searchState,
  stats,
  types,
}: ISideBarProps) => {
  const toggleType = (typeId: number) => {
    if (searchFilters.types.map((t) => t.id).includes(typeId)) {
      return setSearchFilters({
        ...searchFilters,
        types: searchFilters.types.filter((t) => t.id),
      });
    }
    setSearchFilters({
      ...searchFilters,
      types: [...searchFilters.types, { id: typeId }],
    });
  };

  const setStat = (statId: number, key: "min" | "max", value: number) => {
    const copied = { ...searchFilters.stats };
    if (copied[statId]) {
      copied[statId][key] = value;
    } else {
      copied[statId] = {
        min: 0,
        max: 100,
        [key]: value,
      };
    }

    setSearchFilters({
      ...searchFilters,
      stats: copied,
    });
  };

  const clearStatFIlter = (statId: number) => {
    setSearchFilters({
      ...searchFilters,
      stats: {
        ...searchFilters.stats,
        [statId]: undefined,
      },
    });
  };

  return (
    <div
      style={{
        width: 300,
        height: "100vh",
        overflowY: "scroll",
        position: "absolute",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "whitesmoke",
        boxShadow: `2.8px 2.8px 2.2px rgba(0, 0, 0, 0.02),
        6.7px 6.7px 5.3px rgba(0, 0, 0, 0.028),
        12.5px 12.5px 10px rgba(0, 0, 0, 0.035),
        22.3px 22.3px 17.9px rgba(0, 0, 0, 0.042),
        41.8px 41.8px 33.4px rgba(0, 0, 0, 0.05),
        100px 100px 80px rgba(0, 0, 0, 0.07)s`,
      }}
    >
      <div
        style={{
          padding: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <input
          style={{
            padding: 8,
            display: "flex",
            flex: 1,
          }}
          placeholder="Search for a pokemon..."
          value={searchFilters.name}
          onChange={(e) =>
            setSearchFilters({ ...searchFilters, name: e.target.value })
          }
        />
        {/* stats */}
        {stats?.map((s) => {
          return (
            <div
              key={s.id}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 10,
              }}
            >
              <span>
                <b>{s.name}</b>
              </span>
              <label>max base: {searchFilters.stats[s.id]?.max || 0}</label>
              <input
                min="0"
                max="100"
                value={searchFilters.stats[s.id]?.max || 0}
                type="range"
                onChange={(e) => setStat(s.id, "max", +e.target.value)}
              />
              <label>min base: {searchFilters.stats[s.id]?.min || 0}</label>
              <input
                min="0"
                max="100"
                value={searchFilters.stats[s.id]?.min || 0}
                type="range"
                onChange={(e) => setStat(s.id, "min", +e.target.value)}
              />
              <button
                style={{
                  border: "none",
                  background: "red",
                  color: "white",
                  borderRadius: 5,
                  padding: 5,
                  width: 50,
                  fontSize: 10,
                  marginTop: 10,
                  cursor: "pointer",
                }}
                onClick={() => clearStatFIlter(s.id)}
              >
                reset
              </button>
            </div>
          );
        })}

        <button
          disabled={searchState === "loading"}
          style={{
            marginTop: "5px",
            padding: 10,
            border: "none",
            borderRadius: 5,
            background: "rgb(255,200,0)",
            color: "white",
            cursor: "pointer",
          }}
          onClick={onSearch}
        >
          {searchState === "loading" ? "LOADING..." : "SEARCH"}
        </button>
      </div>
      {pokemonList?.map((p) => {
        return (
          <div
            style={{
              padding: 5,
              width: "100%",
              borderBottom: "1px solid white",
              background: selected === p.name ? "rgba(210,210,255)" : "none",
              fontWeight: selected === p.name ? "bold" : "normal",
              borderRadius: 5,
              cursor: "pointer",
            }}
            key={p.name}
            onClick={() => setSelected(p.name)}
          >
            {p.name}
          </div>
        );
      })}
    </div>
  );
};

const getPokemonByName = async (name: string) => {
  const fetchPromise = fetch(`http://localhost:3000/api/pokemon/${name}`);

  const res = await typedRequest<GenericResponse<GetPokemonResponse>>(
    fetchPromise
  );
  return res.data;
};

interface IPokemonView {
  selectedName: string;
}
const PokemonView = ({ selectedName }: IPokemonView) => {
  const [loading, setLoading] = useState(false);
  const [pokemonData, setPokemonData] = useState<GetPokemonResponse>();
  const [imagePath, setImagePath] = useState();

  useEffect(() => {
    if (selectedName) {
      setLoading(true);
      getPokemonByName(selectedName).then((data) => {
        setLoading(false);
        setPokemonData(data);
      });
    }
  }, [selectedName]);

  return (
    <div
      style={{
        width: "calc( 100vw  - 300px)",
        padding: 20,
        height: "100vh",
        position: "absolute",
        left: 300,
        top: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "whitesmoke",
          padding: 30,
          borderRadius: 10,
          position: "relative",
        }}
      >
        {loading ? (
          <h1>Loading</h1>
        ) : (
          (!!selectedName && pokemonData && (
            <>
              <Image
                src={`/sprites/${pokemonData.id + 1}.svg`}
                alt={"pokemon"}
                width="200"
                height="200"
                style={{
                  margin: "10px auto",
                  transform: "scale(1.6)",
                  position: "relative",
                  bottom: "100px",
                }}
              />
              <h1
                style={{
                  fontStyle: "italic",
                }}
              >
                {pokemonData.name}
              </h1>

              <div
                style={{
                  width: "100%",
                  margin: "10px auto",
                }}
              >
                <h3>Stats</h3>
                <div>
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "center",
                      padding: 5,
                      margin: 5,
                      fontWeight: "bold",
                    }}
                  >
                    <span style={{ flex: 1, textAlign: "left" }}></span>
                    <span style={{ flex: 1, textAlign: "left" }}>Base</span>
                    <span style={{ flex: 1, textAlign: "left" }}>Effort</span>
                  </div>
                  {pokemonData.stats?.map((stat) => {
                    return (
                      <div
                        key={stat.stat.url}
                        style={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "center",
                          padding: 5,
                          margin: 5,
                        }}
                      >
                        <span style={{ flex: 1, textAlign: "left" }}>
                          {stat.stat.name.toUpperCase()}
                        </span>
                        <span style={{ flex: 1, textAlign: "left" }}>
                          {stat.base_stat}
                        </span>
                        <span style={{ flex: 1, textAlign: "left" }}>
                          {stat.effort}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )) || <h1>Please select a pokemon</h1>
        )}
      </div>
    </div>
  );
};
