require('dotenv').config({ path: '../.env' });
const axios = require("axios");
const baseUrl = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';
const serviceKey = process.env.SERVICE_KEY;

function makeQueryParams(keyword, type = 'efcyQesitm') {
  return `?serviceKey=${serviceKey}&pageNo=1&numOfRows=3&${type}=${encodeURIComponent(keyword)}&type=json`;
}

async function fetchData(queryParams) {
  const response = await axios.get(baseUrl + queryParams);
  return response.data.body?.items || [];
}

module.exports = { makeQueryParams, fetchData };
