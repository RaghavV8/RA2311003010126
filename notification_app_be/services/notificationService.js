import axios from "axios";

export const getNotifications = async () => {
  const res = await axios.get(
    `${process.env.BASE_URL}/notifications`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    }
  );

  return res.data.notifications || res.data;
};