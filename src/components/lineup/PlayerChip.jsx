import { useDraggable } from '@dnd-kit/core'
import Avatar from '../common/Avatar'

export default function PlayerChip({ player, disabled, selected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${player.id}`,
    data: { type: 'player', playerId: player.id },
    disabled,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelect?.(player.id)}
      className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs border cursor-grab active:cursor-grabbing select-none touch-none min-h-14 ${
        selected
          ? 'border-pitch-400 bg-pitch-900/70 ring-2 ring-pitch-500/30'
          : isDragging
            ? 'opacity-60 border-pitch-400 bg-pitch-800'
            : 'bg-graphite-800 border-graphite-600 hover:border-pitch-500'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      aria-label={`Selecionar ${player.name}`}
    >
      <Avatar name={player.name} photoUrl={player.photo_url} size="xs" />
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{player.name}</div>
        <div className="text-gray-400 flex items-center gap-1 flex-wrap">
          <span>{player.primary_position}</span>
          <span className="px-1 rounded bg-pitch-900 text-pitch-300 font-semibold">{player.technical_rating}</span>
          {player.is_registered && <span className="text-pitch-400">• inscrito</span>}
        </div>
      </div>
      {selected && <span className="text-pitch-300 text-[10px] font-semibold">SELEC.</span>}
    </button>
  )
}
