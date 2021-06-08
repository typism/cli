import axios from 'axios';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

let token: string;

async function request({
  url,
  data = {},
  params = {},
  method = 'GET',
}: {
  url: string;
  data?: any;
  params?: any;
  method: Method;
}) {
  return axios({
    method,
    url,
    data,
    params,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }).then(async (res) => {
    return res.data;
  });
}

const apiURL = () => {
  if (process.env.DEBUG) {
    return 'http://localhost:5001';
  }
  return 'https://api.typism.dev';
};

export async function modelsUpdate(data: any, url: string = apiURL()) {
  return request({
    method: 'POST',
    url: `${url}/models`,
    data,
  }).catch((error) => {
    if (error.response) {
      // Request made and server responded
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
      return error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
  });
}
