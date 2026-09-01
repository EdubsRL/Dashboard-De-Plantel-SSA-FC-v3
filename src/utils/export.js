import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'

export function exportPlayersPDF(players, title = 'Plantel') {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(title, 14, 18)
  doc.setFontSize(10)
  doc.text(`Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 26)
  autoTable(doc, {
    startY: 32,
    head: [['Nome', 'Nasc.', 'Posição', 'Pé', 'Aval.', 'Situação', 'Inscrição', 'Indicado por']],
    body: (players || []).map((p) => [
      p.name, p.birth_date, p.primary_position, p.dominant_foot,
      p.technical_rating, p.status, p.is_registered ? 'Inscrito' : 'Não inscrito',
      p.indicated_by || '-',
    ]),
    styles: { fontSize: 7 },
  })
  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`)
}

export function exportLineupPDF(lineup, slots, playersMap) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(`Escalação: ${lineup.name}`, 14, 18)
  doc.setFontSize(11)
  doc.text(`Formação: ${lineup.formation}`, 14, 26)

  const field = (slots || []).filter((s) => !s.is_bench)
  const reserves = (slots || []).filter((s) => s.slot_key?.startsWith('RESERVE_'))
  const bench = (slots || []).filter((s) => s.is_bench && !s.slot_key?.startsWith('RESERVE_'))

  autoTable(doc, {
    startY: 34,
    head: [['Slot', 'Jogador', 'Posição', 'Situação']],
    body: field.map((s) => {
      const p = s.player || playersMap[s.player_id]
      return [s.slot_key, p?.name || '-', p?.primary_position || '-', p?.status || '-']
    }),
  })

  if (reserves.length) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Reserva da posição', 'Jogador', 'Posição']],
      body: reserves.map((s) => {
        const p = s.player || playersMap[s.player_id]
        return [s.slot_key.replace('RESERVE_', ''), p?.name || '-', p?.primary_position || '-']
      }),
    })
  }

  if (bench.length) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Banco', 'Jogador']],
      body: bench.map((s) => {
        const p = s.player || playersMap[s.player_id]
        return [s.slot_key, p?.name || '-']
      }),
    })
  }
  doc.save(`escalacao_${lineup.name.replace(/\s+/g, '_').toLowerCase()}.pdf`)
}

export function exportPlayersExcel(players, filename = 'plantel.xlsx') {
  const rows = (players || []).map((p) => ({
    Nome: p.name,
    'Data de nascimento': p.birth_date,
    'Posição principal': p.primary_position,
    'Pé dominante': p.dominant_foot,
    Avaliação: p.technical_rating,
    Situação: p.status,
    Inscrito: p.is_registered ? 'Sim' : 'Não',
    'Posições secundárias': (p.secondary_positions || []).join(', '),
    'Indicado por': p.indicated_by || '',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Plantel')
  XLSX.writeFile(wb, filename)
}

export function downloadPlayerTemplate() {
  const rows = [{
    Nome: 'Exemplo',
    'Data de nascimento': '2012-01-15',
    'Posição principal': 'Meia',
    'Pé dominante': 'Direito',
    Avaliação: 'C',
    Situação: 'No clube',
    Inscrito: 'Sim',
    'Posições secundárias': 'Volante',
    'Indicado por': '',
  }]
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Plantel')
  XLSX.writeFile(wb, 'modelo_importacao_plantel.xlsx')
}
