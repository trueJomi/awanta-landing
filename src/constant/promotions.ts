interface Promotion {
  interes7: number;
  interes15: number;
  umbral: number;
  required: number;
  idx: number;
}

export const promotionsCredit: Record<number, Promotion> = {
  20: {
    interes7: 2.42,
    interes15: 2.62,
    umbral: 25,
    required: 5,
    idx: 0
  },
  30: {
    interes7: 2.72,
    interes15: 3.02,
    umbral: 25,
    required: 7.5,
    idx: 1
  },
  50: {
    interes7: 3.38,
    interes15: 3.88,
    umbral: 25,
    required: 12.5,
    idx: 2
  },
  70: {
    interes7: 4.03,
    interes15: 4.73,
    umbral: 35,
    required: 24.5,
    idx: 3
  },
  80: {
    interes7: 4.27,
    interes15: 5.41,
    umbral: 35,
    required: 28,
    idx: 4
  },
  90: {
    interes7: 4.51,
    interes15: 5.41,
    umbral: 35,
    required: 31.5,
    idx: 5
  },
  100: {
    interes7: 4.75,
    interes15: 5.75,
    umbral: 40,
    required: 40,
    idx: 6
  },
  130: {
    interes7: 6.64,
    interes15: 7.94,
    umbral: 40,
    required: 52,
    idx: 7
  },
  150: {
    interes7: 7.71,
    interes15: 9.21,
    umbral: 40,
    required: 60,
    idx: 8
  },
};


export const PromotionCreditList = Object.entries(promotionsCredit).map(
  ([key, value]) => ({
    nivel: Number(key),
    ...value,
  })
);
