export interface Appointment {
    id: string;
    doctor: string;
    fecha: string; // YYYY-MM-DD
    hora: string; // HH:MM
    motivo: string;
}

const STORAGE_KEY = "glucobot_appointments";

export const getAppointments = (): Appointment[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
        const list: Appointment[] = JSON.parse(data);
        // Ordenar por fecha y hora ascendente
        return list.sort((a, b) => {
            const dateA = new Date(`${a.fecha}T${a.hora || "00:00"}`);
            const dateB = new Date(`${b.fecha}T${b.hora || "00:00"}`);
            return dateA.getTime() - dateB.getTime();
        });
    } catch (e) {
        console.error("Error parsing appointments", e);
        return [];
    }
};

export const saveAppointment = (appointment: Omit<Appointment, "id">) => {
    const list = getAppointments();
    const newApp: Appointment = {
        ...appointment,
        id: Date.now().toString(),
    };
    list.push(newApp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const deleteAppointment = (id: string) => {
    const list = getAppointments().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const getNextAppointment = (): Appointment | null => {
    const list = getAppointments();
    const now = new Date();

    // Buscar la primera cita que sea futura (o hoy pero más tarde)
    // Simplificación: tomamos la primera de la lista ordenada que sea >= hoy
    // Como ya están ordenadas, basta encontrar la primera cuya fecha no haya pasado.

    const future = list.find(a => {
        const date = new Date(`${a.fecha}T${a.hora || "23:59"}`);
        return date >= now;
    });

    return future || null;
};
