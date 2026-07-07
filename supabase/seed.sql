insert into public.users (
  id,
  name,
  matcha_blurb,
  coffee_blurb,
  tags,
  seen,
  liked_events
) values (
  1,
  'Benchmark User',
  'I enjoy creative campus events, art, community projects, and relaxed social activities.',
  'I am interested in product, software, entrepreneurship, and career-building workshops.',
  '["design", "technology", "community"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb
) on conflict (id) do update set
  name = excluded.name,
  matcha_blurb = excluded.matcha_blurb,
  coffee_blurb = excluded.coffee_blurb,
  tags = excluded.tags,
  seen = excluded.seen,
  liked_events = excluded.liked_events;

with dims as (
  select jsonb_agg(0.01 order by n) as embedding
  from generate_series(1, 384) as n
)
insert into public.events (
  id,
  title,
  description,
  tags,
  matcha_mode,
  embeddings,
  image_link
)
select *
from (
  values
    (
      1,
      'Campus Pottery Night',
      'A beginner-friendly pottery session with students who enjoy making things by hand.',
      '["art", "community", "creative"]'::jsonb,
      true,
      jsonb_build_object('matcha', (select embedding from dims)),
      null
    ),
    (
      2,
      'Community Garden Morning',
      'Help plant herbs and meet other students interested in sustainability.',
      '["sustainability", "outdoors", "community"]'::jsonb,
      true,
      jsonb_build_object('matcha', (select embedding from dims)),
      null
    ),
    (
      3,
      'Indie Film Discussion',
      'Watch short films and talk about storytelling, music, and visual design.',
      '["film", "music", "design"]'::jsonb,
      true,
      jsonb_build_object('matcha', (select embedding from dims)),
      null
    ),
    (
      4,
      'Startup Sprint Workshop',
      'Practice scoping a product idea, validating users, and presenting a concise pitch.',
      '["startup", "product", "technology"]'::jsonb,
      false,
      jsonb_build_object('coffee', (select embedding from dims)),
      null
    ),
    (
      5,
      'Resume and Portfolio Lab',
      'Bring your resume or portfolio for peer review and structured feedback.',
      '["career", "design", "portfolio"]'::jsonb,
      false,
      jsonb_build_object('coffee', (select embedding from dims)),
      null
    ),
    (
      6,
      'Intro to Applied AI',
      'A practical session on building small AI features for student projects.',
      '["ai", "software", "technology"]'::jsonb,
      false,
      jsonb_build_object('coffee', (select embedding from dims)),
      null
    )
) as seed_events(id, title, description, tags, matcha_mode, embeddings, image_link)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  tags = excluded.tags,
  matcha_mode = excluded.matcha_mode,
  embeddings = excluded.embeddings,
  image_link = excluded.image_link;

select setval(pg_get_serial_sequence('public.users', 'id'), 1, true);
select setval(pg_get_serial_sequence('public.events', 'id'), 6, true);
