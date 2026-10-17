-- Migración 0005: Añadir nuevos planes de mayor tamaño (4x4, 5x5, 6x6) al enum plan_type
-- Ángelito Protector (4x4, 16 espacios)
-- Galaxia de Amor (5x5, 25 espacios)
-- Vínculo Infinito (6x6, 36 espacios)

ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'angelito_protector';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'galaxia_amor';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'vinculo_infinito';
