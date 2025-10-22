import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authSlice";

// const API_URL = import.meta.env.VITE_APP_BASE_URL + "/api";
const API_URL = "http://localhost:8800/api";

const baseQuery = fetchBaseQuery({ 
  baseUrl: API_URL, 
  prepareHeaders: (headers, {getState}) => {

    const token = getState().auth.token;

    if(token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.warn('Token de sessão expirado ou inválido (401). Realizando logout automático.');
    
    api.dispatch(logout());
     
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  endpoints: (builder) => ({}),
});
