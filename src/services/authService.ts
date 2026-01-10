export interface User {
    id: string;
    username: string; // Será el RUT
    password?: string; // Solo para guardar, no retornar al front si es posible evitarlo
    name: string;
    role: "patient" | "caretaker" | "admin";
}

const STORAGE_KEY = "glucobot_users_db";
const SESSION_KEY = "glucobot_current_user";

// Inicializar admin por defecto si no existe
const initAdmin = () => {
    const users = getUsers();
    if (!users.find(u => u.username === "admin")) {
        users.push({
            id: "admin-id",
            username: "admin",
            password: "admin123",
            name: "Administrador Principal",
            role: "admin"
        });
        saveUsers(users);
    }
};

const getUsers = (): User[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const register = async (user: User): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular red
    const users = getUsers();

    if (users.find(u => u.username === user.username)) {
        return false; // Usuario ya existe (RUT duplicado)
    }

    users.push(user);
    saveUsers(users);
    return true;
};

export const login = async (username: string, password?: string): Promise<User | null> => {
    initAdmin(); // Asegurar que admin existe
    await new Promise(resolve => setTimeout(resolve, 800)); // Simular red

    const users = getUsers();
    const user = users.find(u => u.username === username);

    // Validación simplificada: Si no llega password (caso legacy o admin switch), entra directo.
    // PERO en sistema real, siempre debería llegar password.
    // Para compatibilidad con el código anterior, si password es undefined, fallamos a menos que sea un mock específico o lo manejamos.

    // CASO REAL:
    if (user && user.password === password) {
        const { password: _, ...userSafe } = user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(userSafe));
        // @ts-ignore
        return userSafe;
    }

    return null;
};

export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
    const user = localStorage.getItem(SESSION_KEY);
    return user ? JSON.parse(user) : null;
};
