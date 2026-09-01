export const POSITIONS = [
  'Goleiro',
  'Lateral Direito',
  'Zagueiro',
  'Lateral Esquerdo',
  'Volante',
  'Meia',
  'Ponta Direita',
  'Centroavante',
  'Ponta Esquerda',
]

export const POSITION_ORDER = POSITIONS.reduce((acc, pos, i) => {
  acc[pos] = i
  return acc
}, {})

export const FEET = ['Direito', 'Esquerdo', 'Ambos']
export const RATINGS = ['A', 'B', 'C', 'D', 'E', 'F']

// Status operacional do atleta.
export const STATUSES = ['No clube', 'Em avaliação', 'Lesionado']

export const STATUS_COLORS = {
  'No clube': {
    text: 'text-pitch-400',
    badge: 'bg-pitch-900 text-pitch-300 border border-pitch-700/60',
    dot: 'bg-pitch-500',
  },
  'Em avaliação': {
    text: 'text-amber-400',
    badge: 'bg-amber-950/60 text-amber-300 border border-amber-800/60',
    dot: 'bg-amber-500',
  },
  Lesionado: {
    text: 'text-red-400',
    badge: 'bg-red-950/60 text-red-300 border border-red-800/60',
    dot: 'bg-red-500',
  },
}

export const SLOT_COMPATIBLE_POSITIONS = {
  GOL: ['Goleiro'],
  LD: ['Lateral Direito'],
  ZAG: ['Zagueiro'],
  LE: ['Lateral Esquerdo'],
  VOL: ['Volante'],
  MEI: ['Meia'],
  PD: ['Ponta Direita'],
  CA: ['Centroavante'],
  PE: ['Ponta Esquerda'],
  MD: ['Ponta Direita', 'Lateral Direito'],
  ME: ['Ponta Esquerda', 'Lateral Esquerdo'],
  ALA: ['Lateral Direito', 'Lateral Esquerdo', 'Ponta Direita', 'Ponta Esquerda'],
}

export const FORMATIONS = {
  '4-3-3': [
    { key: 'GK', label: 'GOL', x: 50, y: 90 },
    { key: 'RB', label: 'LD', x: 82, y: 72 },
    { key: 'CB1', label: 'ZAG', x: 62, y: 78 },
    { key: 'CB2', label: 'ZAG', x: 38, y: 78 },
    { key: 'LB', label: 'LE', x: 18, y: 72 },
    { key: 'CDM', label: 'VOL', x: 50, y: 58 },
    { key: 'CM1', label: 'MEI', x: 68, y: 45 },
    { key: 'CM2', label: 'MEI', x: 32, y: 45 },
    { key: 'RW', label: 'PD', x: 80, y: 25 },
    { key: 'ST', label: 'CA', x: 50, y: 18 },
    { key: 'LW', label: 'PE', x: 20, y: 25 },
  ],
  '4-4-2': [
    { key: 'GK', label: 'GOL', x: 50, y: 90 },
    { key: 'RB', label: 'LD', x: 82, y: 72 },
    { key: 'CB1', label: 'ZAG', x: 62, y: 78 },
    { key: 'CB2', label: 'ZAG', x: 38, y: 78 },
    { key: 'LB', label: 'LE', x: 18, y: 72 },
    { key: 'RM', label: 'MD', x: 78, y: 48 },
    { key: 'CM1', label: 'MEI', x: 58, y: 52 },
    { key: 'CM2', label: 'MEI', x: 42, y: 52 },
    { key: 'LM', label: 'ME', x: 22, y: 48 },
    { key: 'ST1', label: 'CA', x: 60, y: 20 },
    { key: 'ST2', label: 'CA', x: 40, y: 20 },
  ],
  '3-5-2': [
    { key: 'GK', label: 'GOL', x: 50, y: 90 },
    { key: 'CB1', label: 'ZAG', x: 70, y: 78 },
    { key: 'CB2', label: 'ZAG', x: 50, y: 80 },
    { key: 'CB3', label: 'ZAG', x: 30, y: 78 },
    { key: 'RWB', label: 'ALA', x: 85, y: 50 },
    { key: 'CDM', label: 'VOL', x: 50, y: 58 },
    { key: 'CM1', label: 'MEI', x: 65, y: 42 },
    { key: 'CM2', label: 'MEI', x: 35, y: 42 },
    { key: 'LWB', label: 'ALA', x: 15, y: 50 },
    { key: 'ST1', label: 'CA', x: 60, y: 18 },
    { key: 'ST2', label: 'CA', x: 40, y: 18 },
  ],
  '4-2-3-1': [
    { key: 'GK', label: 'GOL', x: 50, y: 90 },
    { key: 'RB', label: 'LD', x: 82, y: 72 },
    { key: 'CB1', label: 'ZAG', x: 62, y: 78 },
    { key: 'CB2', label: 'ZAG', x: 38, y: 78 },
    { key: 'LB', label: 'LE', x: 18, y: 72 },
    { key: 'CDM1', label: 'VOL', x: 60, y: 58 },
    { key: 'CDM2', label: 'VOL', x: 40, y: 58 },
    { key: 'RAM', label: 'MEI', x: 75, y: 35 },
    { key: 'CAM', label: 'MEI', x: 50, y: 32 },
    { key: 'LAM', label: 'MEI', x: 25, y: 35 },
    { key: 'ST', label: 'CA', x: 50, y: 15 },
  ],
  '3-4-3': [
    { key: 'GK', label: 'GOL', x: 50, y: 90 },
    { key: 'CB1', label: 'ZAG', x: 70, y: 78 },
    { key: 'CB2', label: 'ZAG', x: 50, y: 80 },
    { key: 'CB3', label: 'ZAG', x: 30, y: 78 },
    { key: 'RM', label: 'MD', x: 80, y: 50 },
    { key: 'CM1', label: 'MEI', x: 58, y: 52 },
    { key: 'CM2', label: 'MEI', x: 42, y: 52 },
    { key: 'LM', label: 'ME', x: 20, y: 50 },
    { key: 'RW', label: 'PD', x: 75, y: 22 },
    { key: 'ST', label: 'CA', x: 50, y: 15 },
    { key: 'LW', label: 'PE', x: 25, y: 22 },
  ],
}
