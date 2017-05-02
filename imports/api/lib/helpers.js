
export const dateFormat = (minutes,format = 'm-h-d-M')=>{
    let lessMinutes = minutes;
    const month = lessMinutes > 60 * 24 * 30 ? Math.floor(lessMinutes / (60 * 24 * 30)) : null;
    if(month) lessMinutes = lessMinutes - (month * 60 * 24 * 30);
    const days = lessMinutes > 60 * 24 ? Math.floor(lessMinutes / (60 * 24)) : null;
    if(days) lessMinutes = lessMinutes - (days * 60 * 24);
    const hours = lessMinutes > 60 ? Math.floor(lessMinutes / 60) : null;
    if(hours) lessMinutes = lessMinutes - (hours * 60);
    return format
        .replace('m', ` ${lessMinutes || 'r'}m `)
        .replace('h', ` ${hours || 'r'}h `)
        .replace('d', ` ${days || 'r'}d `)
        .replace('M', ` ${month || 'r'}m`)
        .replace(/-/g, '')
        .replace(/r[mhdM]/g, '')
        .replace('  ', ' ');
};