export const getGlucoseHistory = () => {
    const data = localStorage.getItem("glucoseHistory");
    try {
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error parsing glucose history", e);
        return [];
    }
};

export const saveGlucose = (record) => {
    const history = getGlucoseHistory();
    history.push(record);
    localStorage.setItem("glucoseHistory", JSON.stringify(history));
};

export const getLastGlucose = () => {
    const history = getGlucoseHistory();
    return history.length > 0 ? history[history.length - 1] : null;
};

export const getGlucoseReadings = getGlucoseHistory;
