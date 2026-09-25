-- Failure reporting + realtime status updates for jobs.

-- 1. A job can now end in 'failed', and carries the reason.
alter table public.jobs drop constraint jobs_status_check;

alter table public.jobs
  add constraint jobs_status_check
  check (status in ('pending', 'downloading', 'transcribe', 'done', 'failed'));

alter table public.jobs add column error_message text;

-- 2. Push status changes to the browser instead of making it poll.
-- RLS still applies to realtime, so a client only receives its own rows.
alter publication supabase_realtime add table public.jobs;
