export const formatDate = (date: Date | string | number) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

export const formatTime = (date: Date | string | number) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Time";
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (date: Date | string | number) => {
    return `${formatDate(date)} ${formatTime(date)}`;
};
