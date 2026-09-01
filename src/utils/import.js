import * as XLSX from 'xlsx'

const normalize = (value) => String(value ?? '').trim()

export function parsePlayersExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'array', cellDates: false })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        const players = rows.map((row) => ({
          name: normalize(row.Nome),
          birth_date: normalize(row['Data de nascimento']),
          primary_position: normalize(row['Posição principal']) || 'Meia',
          dominant_foot: normalize(row['Pé dominante']) || 'Direito',
          technical_rating: normalize(row.Avaliação) || 'C',
          status: normalize(row.Situação) || 'No clube',
          is_registered: ['sim', 's', 'true', '1', 'yes'].includes(normalize(row.Inscrito).toLowerCase()),
          secondary_positions: normalize(row['Posições secundárias']).split(',').map((x) => x.trim()).filter(Boolean),
          indicated_by: normalize(row['Indicado por']),
          photo_url: '',
          documents: [],
        })).filter((p) => p.name)

        resolve(players)
      } catch (error) {
        reject(new Error('Não foi possível ler a planilha. Use o modelo de importação do sistema.'))
      }
    }
    reader.onerror = () => reject(new Error('Erro ao abrir a planilha.'))
    reader.readAsArrayBuffer(file)
  })
}
