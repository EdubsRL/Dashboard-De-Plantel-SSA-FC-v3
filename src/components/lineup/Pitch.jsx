import { useDroppable } from '@dnd-kit/core'
import { FORMATIONS, SLOT_COMPATIBLE_POSITIONS } from '../../constants/positions'
import Avatar from '../common/Avatar'
import { AlertTriangle, UserRoundPlus, X } from 'lucide-react'

function isOutOfPosition(slot, player) {
  if (!player) return false
  const compatible = SLOT_COMPATIBLE_POSITIONS[slot.label]
  if (!compatible) return false
  const positions = [player.primary_position, ...(player.secondary_positions || [])]
  return !positions.some((p) => compatible.includes(p))
}

function Slot({ slot, player, reserve, onRemove, onRemoveReserve, onSlotClick, onReserveClick, selectedPlayerId }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slot.key}`,
    data: { type: 'slot', slotKey: slot.key },
  })
  const outOfPosition = isOutOfPosition(slot, player)
  const selected = Boolean(selectedPlayerId)

  return (
    <div ref={setNodeRef}
      className={`absolute -translate-x-1/2 -translate-y-1/2 w-[88px] sm:w-[104px] text-center transition ${isOver ? 'scale-105' : ''}`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
      onClick={() => selected && onSlotClick?.(slot.key)}
    >
      <div className={`relative rounded-lg border px-1 py-1.5 text-[9px] sm:text-[10px] min-h-[68px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
        isOver ? 'ring-2 ring-pitch-400' : player ? (outOfPosition ? 'bg-amber-900/70 border-amber-500' : 'bg-pitch-700/95 border-pitch-400') : 'bg-black/45 border-dashed border-white/30'
      }`}>
        {outOfPosition && <AlertTriangle size={11} className="absolute -top-1.5 -right-1.5 text-amber-400 bg-graphite-950 rounded-full p-0.5" />}
        <span className="text-[8px] text-white/70 uppercase">{slot.label}</span>
        {player ? (
          <>
            <Avatar name={player.name} photoUrl={player.photo_url} size="xs" className="my-0.5" />
            <span className="font-semibold leading-tight line-clamp-2">{player.name.split(' ').slice(-2).join(' ')}</span>
            <button type="button" className="text-[9px] text-red-300 hover:text-red-200" onClick={(e) => { e.stopPropagation(); onRemove(slot.key) }}>
              remover
            </button>
          </>
        ) : (
          <><UserRoundPlus size={13} className="text-white/50" /><span className="text-white/40">toque para colocar</span></>
        )}
        <button
          type="button"
          className={`mt-0.5 px-1.5 py-0.5 rounded text-[8px] border ${reserve ? 'border-amber-500/70 text-amber-300 bg-amber-950/50' : 'border-white/15 text-white/45'}`}
          onClick={(e) => { e.stopPropagation(); onReserveClick?.(slot.key) }}
          title="Definir reserva desta posição"
        >
          {reserve ? `Reserva: ${reserve.name.split(' ').slice(-1)[0]}` : '＋ reserva'}
        </button>
        {reserve && (
          <button type="button" className="absolute top-0.5 right-0.5 text-white/50 hover:text-red-300" onClick={(e) => { e.stopPropagation(); onRemoveReserve(slot.key) }}>
            <X size={10} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Pitch({ formation, assignments, reserves, playersById, onRemove, onRemoveReserve, onSlotClick, onReserveClick, selectedPlayerId }) {
  const slots = FORMATIONS[formation] || FORMATIONS['4-3-3']
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[2/3] rounded-xl overflow-hidden border-2 border-pitch-700 shadow-2xl select-none touch-none">
      <div className="absolute inset-0 bg-gradient-to-b from-pitch-800 to-pitch-900">
        <div className="absolute inset-2 border-2 border-white/25 rounded-sm">
          <div className="absolute left-0 right-0 top-1/2 h-0 border-t-2 border-white/25" />
          <div className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 border-2 border-white/25 rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55%] h-[16%] border-2 border-white/25 border-b-0" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[28%] h-[7%] border-2 border-white/25 border-b-0" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-[16%] border-2 border-white/25 border-t-0" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[28%] h-[7%] border-2 border-white/25 border-t-0" />
        </div>
      </div>
      {slots.map((slot) => (
        <Slot key={slot.key} slot={slot}
          player={assignments[slot.key] ? playersById[assignments[slot.key]] : null}
          reserve={reserves?.[slot.key] ? playersById[reserves[slot.key]] : null}
          onRemove={onRemove} onRemoveReserve={onRemoveReserve}
          onSlotClick={onSlotClick} onReserveClick={onReserveClick}
          selectedPlayerId={selectedPlayerId}
        />
      ))}
    </div>
  )
}
