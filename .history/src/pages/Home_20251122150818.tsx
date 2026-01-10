import { useEffect, useState } from "react";
import { getPatientData } from "../services/patientStorage";
import { motion } from "framer-motion";

export default function Home() {
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    const data = getPatientData();
    setPatient(data);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-100 to-blue-300 text-center p-6">
      {/* Animated floating circles */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-40"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-10 right-10 w-40 h-40 bg-blue-300 rounded-full opacity-30"
        animate={{ y: [0, 25, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <motion.h1
        className="text-3xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        ¡Hola {patient?.nombre || "usuario"}! 👋
      </motion.h1>

      <motion.p
        className="text-gray-700 mt-4 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Bienvenido a GlucoBot. Estoy aquí para ayudarte a controlar tu diabetes.
      </motion.p>

      {/* Footer */}
      <motion.footer
        className="absolute bottom-4 text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        © {new Date().getFullYear()} Leucode.ia — Todos los derechos reservados
      </motion.footer>
    </div>
  );
}