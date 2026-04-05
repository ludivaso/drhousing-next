-- Add zone column for reliable location filtering
-- Run this in Supabase SQL editor for project vtmesmtcnazoqaputoqs

ALTER TABLE properties ADD COLUMN IF NOT EXISTS zone TEXT;
CREATE INDEX IF NOT EXISTS idx_properties_zone ON properties(zone);

-- Populate zone from location_name using keyword mapping
UPDATE properties SET zone = CASE
  WHEN location_name ILIKE '%escaz%'                                                    THEN 'Escazú'
  WHEN location_name ILIKE '%guachipel%'                                                THEN 'Escazú'
  WHEN location_name ILIKE '%jaboncillo%'                                               THEN 'Escazú'
  WHEN location_name ILIKE '%trejos montealegre%'                                       THEN 'Escazú'
  WHEN location_name ILIKE '%los laureles%' AND location_name ILIKE '%rafael%'          THEN 'Escazú'
  WHEN location_name ILIKE '%san antonio%' AND location_name ILIKE '%san jose%'         THEN 'Escazú'
  WHEN location_name ILIKE '%lindora%'                                                  THEN 'Santa Ana'
  WHEN location_name ILIKE '%pozos%'                                                    THEN 'Santa Ana'
  WHEN location_name ILIKE '%santa ana%'                                                THEN 'Santa Ana'
  WHEN location_name ILIKE '%piedades%'                                                 THEN 'Santa Ana'
  WHEN location_name ILIKE '%rio oro%'                                                  THEN 'Santa Ana'
  WHEN location_name ILIKE '%brasil de mora%'                                           THEN 'Santa Ana'
  WHEN location_name ILIKE '%valle del sol%'                                            THEN 'Santa Ana'
  WHEN location_name ILIKE '%hacienda del sol%'                                         THEN 'Santa Ana'
  WHEN location_name ILIKE '%la guacima%'                                               THEN 'La Guácima'
  WHEN location_name ILIKE '%guácima%'                                                  THEN 'La Guácima'
  WHEN location_name ILIKE '%hacienda los reyes%'                                       THEN 'La Guácima'
  WHEN location_name ILIKE '%posadas del rio%'                                          THEN 'La Guácima'
  WHEN location_name ILIKE '%ciudad colon%'                                             THEN 'Ciudad Colón'
  WHEN location_name ILIKE '%ciudad colón%'                                             THEN 'Ciudad Colón'
  WHEN location_name ILIKE '%rohrmoser%'                                                THEN 'Rohrmoser'
  WHEN location_name ILIKE '%sabana%'                                                   THEN 'La Sabana'
  WHEN location_name ILIKE '%pavas%'                                                    THEN 'Pavas'
  WHEN location_name ILIKE '%san rafael%' AND location_name ILIKE '%alajuela%'          THEN 'San Rafael de Alajuela'
  WHEN location_name ILIKE '%playa flamingo%'                                           THEN 'Guanacaste'
  WHEN location_name ILIKE '%playa potrero%'                                            THEN 'Guanacaste'
  WHEN location_name ILIKE '%guanacaste%'                                               THEN 'Guanacaste'
  WHEN location_name ILIKE '%pitahaya%'                                                 THEN 'Pacífico Sur'
  WHEN location_name ILIKE '%bahía ballena%'                                            THEN 'Pacífico Sur'
  ELSE 'Otras zonas'
END
WHERE zone IS NULL;

-- Verify distribution
SELECT zone, COUNT(*) as count
FROM properties
WHERE hidden = false
GROUP BY zone
ORDER BY count DESC;
