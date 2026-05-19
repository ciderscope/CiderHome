insert into storage.buckets (id, name, public)
values ('cuverie-documents', 'cuverie-documents', false)
on conflict (id) do nothing;

create policy "documents by authenticated users"
on storage.objects for select
using (bucket_id = 'cuverie-documents' and auth.role() = 'authenticated');

