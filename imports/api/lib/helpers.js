
export const dateFormat = minutes=>{
    let lessMinutes = minutes;
    const month = lessMinutes > 60 * 24 * 30 ? Math.floor(lessMinutes / (60 * 24 * 30)) : null;
    if(month) lessMinutes = lessMinutes - (month * 60 * 24 * 30);
    const days = lessMinutes > 60 * 24 ? Math.floor(lessMinutes / (60 * 24)) : null;
    if(days) lessMinutes = lessMinutes - (days * 60 * 24);
    const hours = lessMinutes > 60 ? Math.floor(lessMinutes / 60) : null;
    if(hours) lessMinutes = lessMinutes - (hours * 60);
    let time = '';
    if(lessMinutes) time += `${lessMinutes}m `;
    if(hours) time += `${hours}h `;
    if(days) time += `${days}d `;
    if(month) time += `${month}m`;

    return time;
};