-- Jas Volunteers: Функции для управления участниками команды
-- Выполни этот код в Supabase SQL Editor.

-- 1. Выгнать из команды
CREATE OR REPLACE FUNCTION public.kick_team_member(target_user_id UUID)
RETURNS void AS $$
DECLARE
    caller_role TEXT;
    caller_team_id UUID;
    target_team_id UUID;
BEGIN
    -- Получаем данные того, кто вызывает функцию
    SELECT role, team_id INTO caller_role, caller_team_id 
    FROM public.profiles 
    WHERE id = auth.uid();

    -- Получаем данные цели
    SELECT team_id INTO target_team_id 
    FROM public.profiles 
    WHERE id = target_user_id;

    -- Проверка: выгонять может координатор или зам, если цель в той же команде
    IF (caller_team_id IS NOT NULL) AND (caller_team_id = target_team_id) AND 
       (caller_role = 'coordinator' OR caller_role = 'sub_coordinator') THEN
        
        -- Убираем из команды и сбрасываем роль на волонтера
        UPDATE public.profiles 
        SET team_id = NULL, role = 'volunteer' 
        WHERE id = target_user_id;
        
    ELSE
        RAISE EXCEPTION 'Недостаточно прав или пользователь не в вашей команде';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Смена роли (Волонтер <-> Зам.координатора)
CREATE OR REPLACE FUNCTION public.update_member_role(target_user_id UUID, new_role TEXT)
RETURNS void AS $$
DECLARE
    caller_role TEXT;
    caller_team_id UUID;
    target_team_id UUID;
BEGIN
    SELECT role, team_id INTO caller_role, caller_team_id 
    FROM public.profiles 
    WHERE id = auth.uid();

    SELECT team_id INTO target_team_id 
    FROM public.profiles 
    WHERE id = target_user_id;

    -- Только координатор может менять роли внутри своей команды
    IF caller_role = 'coordinator' AND caller_team_id = target_team_id THEN
        
        -- Ограничение: нельзя поставить роль координатора через эту функцию (для этого есть transfer)
        IF new_role = 'coordinator' THEN
            RAISE EXCEPTION 'Для передачи лидерства используйте специальную функцию';
        END IF;

        UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
        
    ELSE
        RAISE EXCEPTION 'Только координатор может изменять роли участников';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Передача лидерства (Один координатор в команде)
CREATE OR REPLACE FUNCTION public.transfer_team_leadership(new_leader_id UUID)
RETURNS void AS $$
DECLARE
    current_coord_id UUID := auth.uid();
    current_team_id UUID;
BEGIN
    -- Проверяем, что вызывающий - координатор
    SELECT team_id INTO current_team_id 
    FROM public.profiles 
    WHERE id = current_coord_id AND role = 'coordinator';

    IF current_team_id IS NULL THEN
        RAISE EXCEPTION 'Вы не являетесь координатором этой команды';
    END IF;

    -- Проверяем, что новый лидер в той же команде
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = new_leader_id AND team_id = current_team_id
    ) THEN
        RAISE EXCEPTION 'Новый лидер должен быть участником вашей команды';
    END IF;

    -- 1. Текущий координатор становится замом
    UPDATE public.profiles 
    SET role = 'sub_coordinator' 
    WHERE id = current_coord_id;

    -- 2. Новый человек становится координатором
    UPDATE public.profiles 
    SET role = 'coordinator' 
    WHERE id = new_leader_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Выйти из команды
CREATE OR REPLACE FUNCTION public.leave_team()
RETURNS void AS $$
DECLARE
    current_user_role TEXT;
    current_team_id UUID;
BEGIN
    SELECT role, team_id INTO current_user_role, current_team_id 
    FROM public.profiles 
    WHERE id = auth.uid();

    IF current_team_id IS NULL THEN
        RAISE EXCEPTION 'Вы не состоите в команде';
    END IF;

    IF current_user_role = 'coordinator' THEN
        RAISE EXCEPTION 'Координатор не может покинуть команду. Передайте лидерство другому участнику.';
    END IF;

    -- Сбрасываем роль на волонтера ТОЛЬКО если это не админ/разраб
    UPDATE public.profiles 
    SET team_id = NULL, 
        role = CASE 
            WHEN role IN ('admin', 'developer') THEN role 
            ELSE 'volunteer' 
        END
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Вступить в команду
CREATE OR REPLACE FUNCTION public.join_team(new_team_id UUID)
RETURNS void AS $$
DECLARE
    current_user_role TEXT;
    current_team_id UUID;
BEGIN
    SELECT role, team_id INTO current_user_role, current_team_id 
    FROM public.profiles 
    WHERE id = auth.uid();

    -- Проверка на координатора (нельзя бросить команду будучи лидером)
    IF current_user_role = 'coordinator' AND current_team_id IS NOT NULL THEN
        RAISE EXCEPTION 'Вы координатор своей команды. Передайте лидерство прежде чем вступать в новую.';
    END IF;

    -- Проверка существования команды
    IF NOT EXISTS (SELECT 1 FROM public.teams WHERE id = new_team_id AND status = 'approved') THEN
        RAISE EXCEPTION 'Команда не найдена или не одобрена';
    END IF;

    -- Обновляем команду, сохраняя спец.роли
    UPDATE public.profiles 
    SET team_id = new_team_id,
        role = CASE 
            WHEN role IN ('admin', 'developer') THEN role 
            ELSE 'volunteer' 
        END
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
