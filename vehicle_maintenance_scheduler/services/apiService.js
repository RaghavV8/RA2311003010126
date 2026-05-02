import axios from "axios";

const BASE = process.env.BASE_URL;
const TOKEN = process.env.ACCESS_TOKEN;

export const getDepots = async () => {
  const res = await axios.get(`${BASE}/depots`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  return res.data.depots;
};

export const getVehicles = async () => {
  const res = await axios.get(`${BASE}/vehicles`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  return res.data.vehicles;
};