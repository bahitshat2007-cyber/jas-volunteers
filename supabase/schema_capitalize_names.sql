-- SQL script to enforce automatic capitalizatiton of first and last names in the `profiles` table.
-- Applies INITCAP which works seamlessly for both Cyrillic and Latin alphabets, supporting hyphenated names too.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.capitalize_profile_names()
RETURNS TRIGGER AS $$
BEGIN
    -- Apply INITCAP to automatically capitalize the first letter and lowercase the rest of the words/names.
    IF NEW.first_name IS NOT NULL THEN
        NEW.first_name = INITCAP(NEW.first_name);
    END IF;
    
    IF NEW.last_name IS NOT NULL THEN
        NEW.last_name = INITCAP(NEW.last_name);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing DB trigger if it exists
DROP TRIGGER IF EXISTS trg_capitalize_profile_names ON public.profiles;

-- 3. Bind trigger to `profiles` table on INSERT and UPDATE
CREATE TRIGGER trg_capitalize_profile_names
BEFORE INSERT OR UPDATE OF first_name, last_name ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.capitalize_profile_names();

-- 4. Retroactively apply to existing profiles
UPDATE public.profiles
SET 
  first_name = INITCAP(first_name),
  last_name = INITCAP(last_name);
