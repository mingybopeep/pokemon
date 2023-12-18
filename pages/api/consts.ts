export const apiPaths = Object.freeze({
  pokemon: {
    getAll: () => "api/v2/pokemon",
    get: (name: string) => `api/v2/pokemon/${name}`,
  },
});
