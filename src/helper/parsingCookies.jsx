export function encodeCookies(name, data) {
    sessionStorage.setItem(name, btoa("YzJGc2RFbHVhVEl4TXc" + btoa(JSON.stringify(data)) + "bXJpZHdhblRhbmduYTIwMDlwdWphaWkwOTA5=="));
}
export function decodeCookies(name) {
    const sesi = sessionStorage.getItem(name)
    let user
    if (sesi) {
        const userDecode1 = atob(sesi)
        const useDecode2 = userDecode1.replace("YzJGc2RFbHVhVEl4TXc", "").replace("bXJpZHdhblRhbmduYTIwMDlwdWphaWkwOTA5==", "");
        user = JSON.parse(atob(useDecode2))
    } else {
        user = false
    }
    // const user = JSON.parse(localStorage.getItem("user"))
    return user;
}