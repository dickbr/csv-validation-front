import axios from 'axios'

export const api_campaing = axios.create({
  baseURL: `${process.env.CAMPAING_API_URL as string}`
})