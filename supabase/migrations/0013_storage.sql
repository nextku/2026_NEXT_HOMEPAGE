-- 글에 넣는 이미지 보관함
--
-- 본문에 사진을 넣으려면 어딘가에 파일이 있어야 한다. Supabase Storage 에
-- 담고, 주소만 문서에 넣는다.
--
-- 읽기는 공개다. 주소를 아는 사람은 볼 수 있다. 학회원 전용으로 막으려면
-- 서명 주소를 매번 새로 발급해야 하는데, 그러면 글 하나 열 때마다 사진 수만큼
-- 요청이 늘고 캐시도 안 된다. 주소는 임의 문자열이라 추측할 수 없고, 애초에
-- 학회 안에서 공유하는 사진이므로 이 정도가 맞다.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  10485760, -- 10MB. 휴대폰 사진 한 장이 보통 3~5MB 다.
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 올리기는 승인된 학회원만. 파일은 자기 폴더에만 둔다 — 남의 사진을 덮어쓰지
-- 못하게 하려면 경로를 사람마다 갈라두는 편이 정책보다 확실하다.
drop policy if exists "members upload post images" on storage.objects;
create policy "members upload post images"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and public.is_approved()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "authors replace own images" on storage.objects;
create policy "authors replace own images"
  on storage.objects for update
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "authors delete own images" on storage.objects;
create policy "authors delete own images"
  on storage.objects for delete
  using (
    bucket_id = 'post-images'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "anyone reads post images" on storage.objects;
create policy "anyone reads post images"
  on storage.objects for select
  using (bucket_id = 'post-images');
