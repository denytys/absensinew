import axios from "axios"
import { decodeCookies } from "./parsingCookies"

const token = decodeCookies("token")
export function protectGet(endpoint, tokens = false) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: import.meta.env.VITE_ABSEN_BE + endpoint,
        headers: {
            'Authorization': `Bearer ${tokens ? tokens : token}`,
            'Content-Type': 'application/json',
        }
    }
    return axios.request(config)
}
export function protectPostPut(method, endpoint, data, restype = null, tokenForm = null) {
    let tokenpake = token
    if(tokenForm) {
        tokenpake = tokenForm
    }
    let config = {
        method: method,
        maxBodyLength: Infinity,
        url: import.meta.env.VITE_ABSEN_BE + endpoint,
        headers: {
            'Authorization': `Bearer ${tokenpake}`,
            'Content-Type': 'application/json',
        },
        data: data
    }
    if (restype) {
        config['responseType'] = restype
    }
    if (import.meta.env.MODE === "development") {
        console.log("config", JSON.stringify(config))
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

export function freePost(endpoint, data) {
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: import.meta.env.VITE_ABSEN_BE + endpoint,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data
    }
    return axios.request(config)
}