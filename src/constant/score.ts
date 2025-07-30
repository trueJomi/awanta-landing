export const creditScoreRanges = {
  excelent: {
    min: 90,
    max: 100,
    text: "Excelente",
    color: "#16a34a", // green-500
    descripcion:
      "Tienes un excelente historial crediticio, lo que te permite acceder a las mejores condiciones de crédito.",
  },
  good: {
    min: 70,
    max: 89,
    text: "Bueno",
    color: "#3b82f6", // blue-500
    descripcion:
      "Tienes un buen historial crediticio, lo que te permite acceder a condiciones de crédito favorables.",
  },
  mid: {
    min: 45,
    max: 69,
    text: "Regular",
    color: "#fbbf24", // yellow-500
    descripcion:
      "Tu historial crediticio es regular, lo que puede limitar tus opciones de crédito.",
  },
  bad: {
    min: 20,
    max: 44,
    text: "Malo",
    color: "#ef4444", // red-500
    descripcion:
      "Tu historial crediticio es malo, lo que dificulta el acceso a crédito.",
  },
  out: {
    min: 0,
    max: 19,
    text: "Muy Malo",
    color: "#6b7280", // gray-500
    descripcion:
      "Tu historial crediticio es muy malo, lo que te impide acceder a crédito.",
  },
};

export type CreditScoreKeys = keyof typeof creditScoreRanges;

export const creditScoreList = Object.entries(creditScoreRanges).map(
  ([key, value]) => ({
    key,
    ...value,
  })
);
