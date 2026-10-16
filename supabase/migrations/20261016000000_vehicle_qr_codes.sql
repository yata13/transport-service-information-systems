-- ====================================================================
-- Every registered vehicle/driver gets a QR code value.
-- Format: "DID|PLATE|PERMIT" — the mobile app's scanner reads the DID
-- from the first segment. Safe to run more than once.
-- ====================================================================

-- 1. Backfill vehicles that were registered without a QR value
UPDATE public.bajaj_vehicles
SET qr_code_value = digital_id || '|' || plate_number || '|' || permit_number
WHERE qr_code_value IS NULL OR trim(qr_code_value) = '';

-- 2. Fill it automatically for any future insert that leaves it empty
CREATE OR REPLACE FUNCTION public.set_vehicle_qr_code_value()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.qr_code_value IS NULL OR trim(NEW.qr_code_value) = '' THEN
        NEW.qr_code_value := NEW.digital_id || '|' || NEW.plate_number || '|' || NEW.permit_number;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bajaj_vehicles_set_qr ON public.bajaj_vehicles;
CREATE TRIGGER bajaj_vehicles_set_qr
BEFORE INSERT OR UPDATE ON public.bajaj_vehicles
FOR EACH ROW EXECUTE FUNCTION public.set_vehicle_qr_code_value();
