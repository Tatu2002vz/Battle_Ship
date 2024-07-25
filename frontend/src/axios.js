import axios from "axios";
// import { store } from "./store/store";



const instance = axios.create({
  baseURL: process.env.REACT_APP_URL_SERVER,
});

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    // const { token } = JSON.parse(localStorage.getItem('persist:shop/user'));
    // if (token !== 'null' && typeof token === "string") {
    //   config.headers = { Authorization: `Bearer ${token.replaceAll(`"`, '')}` };
    //   return config;
    // }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log(error);
    return error?.response?.data;
  }
);
export default instance;
