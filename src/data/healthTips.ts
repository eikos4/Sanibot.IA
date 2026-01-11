export const healthTips = [
    // DIABETES (General & Alimentación)
    "Recuerda que la fibra es tu amiga. Ayuda a regular la absorción de azúcar.",
    "El agua es la mejor bebida. Evita los jugos azucarados que elevan tu glucosa rápido.",
    "Come frutas enteras en lugar de jugos. La cáscara tiene fibra valiosa.",
    "Revisa tus pies diariamente. Un pequeño corte puede complicarse si no lo atiendes.",
    "El ejercicio baja la glucosa de forma natural. 30 minutos de caminata ayudan mucho.",
    "No saltes el desayuno. Ayuda a mantener tu metabolismo estable todo el día.",
    "Si sientes mareos o sudor frío, podrías tener hipoglucemia. Ten un dulce a la mano.",
    "El estrés sube la glucosa. Practica respiración profunda o meditación.",
    "Duerme al menos 7 horas. El mal sueño afecta la resistencia a la insulina.",
    "Reduce el consumo de sal. Tu corazón y riñones te lo agradecerán.",
    "Prefiere carbohidratos complejos como avena, quinoa y arroz integral.",
    "La canela puede ayudar levemente a mejorar la sensibilidad a la insulina.",
    "Evita el alcohol con el estómago vacío, puede causar bajones de azúcar peligrosos.",
    "Mantén un peso saludable. Perder un 5% de peso mejora mucho tu control.",
    "Lleva un registro de tus niveles. Lo que no se mide, no se puede mejorar.",
    "Visita al oftalmólogo una vez al año. La diabetes puede afectar tu vista.",
    "Usa calcetines cómodos y sin costuras para proteger tus pies.",
    "Si te sientes triste o abrumado, habla con alguien. La salud mental es clave.",
    "Aprende a leer etiquetas. 'Sin azúcar añadida' no siempre significa 'sin carbohidratos'.",
    "La hidratación constante ayuda a tus riñones a filtrar el exceso de glucosa.",

    // HIPERTENSIÓN & CORAZÓN
    "La sal es el enemigo silencioso. Evita añadirla a las comidas ya preparadas.",
    "Muévete más. Subir escaleras cuenta como ejercicio cardiovascular.",
    "El potasio (plátano, espinaca) ayuda a contrarrestar el sodio en tu cuerpo.",
    "Evita alimentos enlatados, suelen tener muchísimo sodio conservante.",
    "El café puede subir la presión temporalmente. Modera tu consumo.",
    "Si fumas, déjalo ya. Cada cigarrillo daña tus arterias inmediatamente.",
    "El chocolate negro (70% cacao) en moderación puede ser bueno para el corazón.",
    "Ríete más. La risa relaja los vasos sanguíneos y mejora el flujo.",
    "Controla tu colesterol. Las grasas saturadas tapan las arterias.",
    "Mide tu presión a la misma hora para tener datos comparables.",
    "Si tomas medicación, nunca la suspendas sin hablar con tu médico.",
    "El ronquido fuerte (apnea) puede subir tu presión arterial. Revísalo.",

    // MOTIVACIÓN & HÁBITOS
    "Cada día es una nueva oportunidad para cuidarte mejor.",
    "No busques la perfección, busca la constancia.",
    "Un mal día de glucosa no es un fracaso, es solo un dato para corregir.",
    "Tu salud vale el esfuerzo. Eres importante para tu familia.",
    "Celebra tus pequeñas victorias, como haber caminado hoy.",
    "Aprende a decir 'no' a la comida que sabes que te hace daño.",
    "Cocinar en casa te da el control total de los ingredientes.",
    "Bebe un vaso de agua antes de cada comida para sentir saciedad.",
    "Mastica despacio. Tu cerebro tarda 20 minutos en saber que estás lleno.",
    "Sustituye el postre por una fruta o un yogur natural.",
    "Camina después de comer, ayuda mucho a bajar el pico de glucosa.",
    "Ten siempre a la mano tus medicamentos o insulina cuando salgas.",
    "Infórmate. Un paciente educado vive más y mejor.",
    "No te compares con otros. Tu cuerpo y tu proceso son únicos.",
    "La diabetes no es una sentencia, es un estilo de vida que requiere cuidado.",
    "Tu glucómetro es tu GPS, no tu juez. Úsalo para navegar.",
    "Rodéate de personas que apoyen tus hábitos saludables.",
    "Confía en tu equipo médico, pero tú eres el capitán de tu barco.",
    "Recuerda: Eres más fuerte que tu diagnóstico. ¡Tú puedes!"
];

export const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * healthTips.length);
    return healthTips[randomIndex];
};
