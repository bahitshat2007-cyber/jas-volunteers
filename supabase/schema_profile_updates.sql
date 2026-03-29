-- Jas Volunteers: Добавление аватаров и описания (bio)
-- Вставьте этот код в Supabase SQL Editor и нажмите Run.

-- 1. Добавляем колонки в таблицу profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Создаем корзину для хранения аватарок (Storage Bucket)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Политики безопасности для Storage (avatars)
-- Разрешаем чтение всем (public)
CREATE POLICY "Avatar images are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

-- Разрешаем загрузку только авторизованным пользователям
CREATE POLICY "Users can upload their own avatar" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Разрешаем обновление/удаление своих файлов
CREATE POLICY "Users can update their own avatar" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own avatar" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Обновляем комментарий в таблице
COMMENT ON COLUMN public.profiles.bio IS 'Краткое описание/био профиля';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Ссылка на аватарку из бакета avatars';
