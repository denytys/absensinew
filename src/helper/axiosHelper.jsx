import axios from "axios"
import { decodeCookies } from "./parsingCookies"

const token = decodeCookies("token")
export function protectGet(endpoint) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: import.meta.env.VITE_ABSEN_BE + endpoint,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }
    return axios.request(config)
}
export function protectPostPut(method, endpoint, data) {
    let config = {
        method: method,
        maxBodyLength: Infinity,
        url: import.meta.env.VITE_ABSEN_BE + endpoint,
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        data: data
    }
    return axios.request(config)
}

export function protectDelete(endpoint, data) {
    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: import.meta.env.VITE_ABSEN_BE + endpoint,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data
    }
    return axios.request(config)
}