import { decodeCookies } from "./parsingCookies";

export default function cekRoles(roleName) {
    const role = decodeCookies("role")
    return role.some(role => role.nama_role === roleName);
}
