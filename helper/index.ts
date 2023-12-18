export const typedRequest = async <T,>(cb: Promise<Response>): Promise<T> => {
    const res = await cb;
    const json = await res.json();
    console.log(json);
    return json as T;
  };
  