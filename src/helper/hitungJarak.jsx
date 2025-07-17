export function hitungJarak(lat1, long1, lat2, long2) {
    let theta = long1 - long2;
    let distance = 60 * 1.1515 * (180 / Math.PI) * Math.acos(
        Math.sin(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(theta * (Math.PI / 180))
    );
    // kilometer
    return distance * 1.609344;
}
