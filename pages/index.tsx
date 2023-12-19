import type { InferGetStaticPropsType, GetStaticProps } from "next";
import Image from "next/image";
import dynamic from "next/dynamic";
import React, { SetStateAction, useEffect, useState } from "react";
import {
  GenericResponse,
  ListPokemonReponse,
  PokemonLite,
} from "./api/pokemon";
import { GetPokemonResponse } from "./api/pokemon/[name]";
import { typedRequest } from "../helper";

interface IHomeProps {
  pokemonList: PokemonLite[];
}
export default function Home({ pokemonList }: IHomeProps) {
  const [selectedName, setSelectedName] = useState("");
  return (
    <>
      <SideBar
        pokemonList={pokemonList}
        selected={selectedName}
        setSelected={setSelectedName}
      />
      <PokemonView selectedName={selectedName} />
    </>
  );
}

export const getStaticProps = (async () => {
  const fetchPromise = fetch("http://localhost:3000/api/pokemon");

  const res = await typedRequest<GenericResponse<ListPokemonReponse>>(
    fetchPromise
  );
  const {
    data: { results: pokemonList },
  } = res;
  return { props: { pokemonList } };
}) satisfies GetStaticProps<{
  pokemonList: PokemonLite[];
}>;

interface ISideBarProps extends IHomeProps {
  selected: string;
  setSelected: React.Dispatch<SetStateAction<String>>;
}
const SideBar = ({ pokemonList, selected, setSelected }: ISideBarProps) => {
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
      {pokemonList.map((p) => {
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
    setLoading(true);
    getPokemonByName(selectedName)
      .then(setPokemonData)
      .then(() => setLoading(false));
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
                src={`/sprites/${pokemonData.id}.svg`}
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
