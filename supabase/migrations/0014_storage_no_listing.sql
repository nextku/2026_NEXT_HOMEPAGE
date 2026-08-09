-- 사진 보관함의 목록 조회를 닫는다
--
-- 0013 에서 이렇게 열어두었다.
--
--   create policy "anyone reads post images"
--     on storage.objects for select
--     using (bucket_id = 'post-images');
--
-- 사진을 보이게 하려고 넣은 것인데, 실제로 그 일을 하는 것은 이 정책이 아니다.
-- 버킷이 public 이라 주소로 여는 것은 정책과 무관하게 된다. 이 정책이 여는 것은
-- 스토리지 API 의 목록 조회다. 즉 주소를 몰라도 올라간 파일을 전부 나열해
-- 받아갈 수 있었다.
--
-- 학회 안에서 나누는 사진이라 주소를 아는 사람이 보는 것까지는 괜찮다고 보았다.
-- 그 판단은 "주소는 임의 문자열이라 추측할 수 없다" 를 전제로 했는데, 목록이
-- 열려 있으면 추측할 필요가 없으므로 전제가 무너진다.
--
-- 지워도 글에 넣은 사진은 그대로 보인다. 우리 코드는 upload 와 getPublicUrl 만
-- 쓰고 목록을 부르는 곳이 없다.

drop policy if exists "anyone reads post images" on storage.objects;

-- 올린 사람 본인과 운영진은 자기 파일을 확인할 수 있어야 한다. 잘못 올린 것을
-- 지우려면 먼저 그것이 있다는 것을 볼 수 있어야 하기 때문이다.
drop policy if exists "authors list own images" on storage.objects;
create policy "authors list own images"
  on storage.objects for select
  using (
    bucket_id = 'post-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
