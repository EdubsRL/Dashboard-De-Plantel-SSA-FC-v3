-- MIGRAÇÃO 005 — campos do atleta opcionais na criação
-- Nome e data de nascimento continuam sendo os únicos campos exigidos pela interface.
-- Os demais campos recebem valores padrão quando não informados, preservando o schema existente.

alter table public.players
  alter column primary_position set default 'Meia',
  alter column dominant_foot set default 'Direito',
  alter column technical_rating set default 'C',
  alter column status set default 'No clube',
  alter column is_registered set default false,
  alter column secondary_positions set default '{}',
  alter column indicated_by set default '',
  alter column documents set default '[]'::jsonb;
