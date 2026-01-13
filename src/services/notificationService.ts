import { LocalNotifications } from '@capacitor/local-notifications';

export class NotificationService {
    static async requestPermissions(): Promise<boolean> {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
    }

    static async scheduleMedicineReminder(medicine: { id: string, nombre: string, horario: string }) {
        // Parse horario string "HH:mm" to Date items
        // This is a simplification. Real implementation needs to handle multiple times if comma separated.
        // And assumes daily recurrence.

        const times = medicine.horario.split(',').map(t => t.trim());
        const notifications: any[] = [];

        times.forEach((time, index) => {
            const [hours, minutes] = time.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return;

            const date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes);
            date.setSeconds(0);

            // If time has passed today, schedule for tomorrow (though `every: 'day'` handles recurrence)
            // LocalNotifications schedule 'at' behaves as specific date if no 'every' 
            // OR 'on' property for recurrence

            // Unique ID generation: hash medicine ID + index
            // Simple approach: use numeric part of ID if available or random
            const notifId = Math.floor(Math.random() * 1000000) + index;

            notifications.push({
                title: 'Hora de tu medicamento 💊',
                body: `Es hora de tomar: ${medicine.nombre}`,
                id: notifId,
                schedule: {
                    on: { hour: hours, minute: minutes },
                    allowWhileIdle: true // Android: allow in doze mode
                },
                actionTypeId: '',
                extra: {
                    medicineId: medicine.id
                }
            });
        });

        if (notifications.length > 0) {
            await LocalNotifications.schedule({ notifications });
        }
    }
}
