-- 프로필의 기수·직책을 소속 표에 다시 맞춘다
--
-- 0021 은 그때 있던 값을 한 번 옮긴 것이었다. 그 뒤에 승인된 사람은 화면이
-- 아직 프로필의 옛 칸에만 쓰기 때문에 소속 표에 들어가지 않았고, 기수 화면이
-- 이관 시점의 인원만 세고 있었다.
--
-- 화면이 소속 표에 직접 쓰기 전까지는 옛 칸이 원본이다. 그래서 이 파일은 한 번
-- 쓰고 버리는 것이 아니라 언제든 다시 돌릴 수 있게 둔다. 승인 화면을 옮긴 뒤에
-- 필요 없어진다.
--
-- 0021 과 달리 이미 있는 줄도 고친다. 그때는 insert 만 해서, 직책이 바뀐 사람은
-- 예전 자리에 그대로 남았다.

-- 프로필에 등장하는 기수를 모두 만든다.
insert into public.generations (number)
select distinct g
  from (
    select generation as g from public.profiles where generation is not null
    union
    select staff_generation from public.profiles where staff_generation is not null
  ) x
 where g between 1 and 99
on conflict (number) do nothing;

-- 들어온 기수. 그 기수에서 직책을 맡았을 때만 직책을 붙인다.
insert into public.memberships (profile_id, generation_id, position, title_note)
select p.id,
       g.id,
       case
         when p.title is not null and btrim(p.title) <> ''
              and coalesce(p.staff_generation, p.generation) = p.generation
           then public.position_from_title(p.title)
         else 'member'::public.membership_position
       end,
       case
         when p.title is not null and btrim(p.title) <> ''
              and coalesce(p.staff_generation, p.generation) = p.generation
              and p.title not in ('대표', '부대표', '운영진')
           then btrim(p.title)
         else null
       end
  from public.profiles p
  join public.generations g on g.number = p.generation
 where p.generation is not null
on conflict (profile_id, generation_id) do update
  set position   = excluded.position,
      title_note = excluded.title_note;

-- 직책을 맡은 기수가 따로면 그 기수의 소속도 만든다.
insert into public.memberships (profile_id, generation_id, position, title_note)
select p.id,
       g.id,
       public.position_from_title(p.title),
       case when p.title not in ('대표', '부대표', '운영진')
            then btrim(p.title) else null end
  from public.profiles p
  join public.generations g on g.number = p.staff_generation
 where p.staff_generation is not null
   and p.title is not null
   and btrim(p.title) <> ''
   and p.staff_generation is distinct from p.generation
on conflict (profile_id, generation_id) do update
  set position   = excluded.position,
      title_note = excluded.title_note;

/*
   옛 칸에서 사라진 소속은 지운다.

   직책 기수를 15기에서 16기로 고치면 15기 줄이 그대로 남아 두 기수에 걸친
   사람처럼 보인다. 옛 칸이 원본인 동안에는 거기 없는 소속은 없는 것으로 본다.
*/
delete from public.memberships m
 using public.generations g, public.profiles p
 where g.id = m.generation_id
   and p.id = m.profile_id
   and g.number is distinct from p.generation
   and g.number is distinct from p.staff_generation;
