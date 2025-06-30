drop policy "Public can select for health check" on "public"."profiles";

drop policy "Orders are viewable by owner" on "public"."orders";

drop policy "Orders can be inserted by owner" on "public"."orders";

drop policy "Orders can be updated by owner" on "public"."orders";

drop policy "Positions are viewable by owner" on "public"."positions";

drop policy "Positions can be inserted by owner" on "public"."positions";

drop policy "Positions can be updated by owner" on "public"."positions";

drop policy "Profiles are viewable by owner" on "public"."profiles";

drop policy "Profiles can be inserted by owner" on "public"."profiles";

drop policy "Profiles can be updated by owner" on "public"."profiles";

alter table "public"."accounts" enable row level security;

alter table "public"."assets" add column "user_id" uuid;

alter table "public"."assets" enable row level security;

alter table "public"."kyc_documents" enable row level security;

alter table "public"."market_data" add column "user_id" uuid;

alter table "public"."market_data" enable row level security;

alter table "public"."orders_ext" enable row level security;

alter table "public"."positions_ext" enable row level security;

alter table "public"."users" enable row level security;

CREATE INDEX assets_user_id_idx ON public.assets USING btree (user_id);

CREATE INDEX idx_accounts_user_id ON public.accounts USING btree (user_id);

CREATE INDEX kyc_documents_user_id_idx ON public.kyc_documents USING btree (user_id);

CREATE INDEX market_data_user_id_idx ON public.market_data USING btree (user_id);

CREATE INDEX orders_ext_account_id_idx ON public.orders_ext USING btree (account_id);

CREATE INDEX orders_ext_asset_id_idx ON public.orders_ext USING btree (asset_id);

CREATE INDEX orders_user_id_index ON public.orders USING btree (user_id);

CREATE INDEX positions_ext_account_id_idx ON public.positions_ext USING btree (account_id);

CREATE INDEX positions_user_id_idx ON public.positions USING btree (user_id);

alter table "public"."assets" add constraint "assets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."assets" validate constraint "assets_user_id_fkey";

alter table "public"."market_data" add constraint "market_data_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."market_data" validate constraint "market_data_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
    -- Function logic here
    RETURN NEW;
END;
$function$
;

create policy "select_own_account"
on "public"."accounts"
as permissive
for select
to public
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "select_own_assets"
on "public"."assets"
as permissive
for select
to public
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "select_own_documents"
on "public"."kyc_documents"
as permissive
for select
to public
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "select_own_data"
on "public"."market_data"
as permissive
for select
to public
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Allow delete on positions_ext for owner"
on "public"."positions_ext"
as permissive
for delete
to authenticated
using ((account_id IN ( SELECT accounts.id
   FROM accounts
  WHERE (accounts.user_id = ( SELECT auth.uid() AS uid)))));


create policy "Allow insert on positions_ext for owner"
on "public"."positions_ext"
as permissive
for insert
to authenticated
with check ((account_id IN ( SELECT accounts.id
   FROM accounts
  WHERE (accounts.user_id = ( SELECT auth.uid() AS uid)))));


create policy "Allow select on positions_ext for owner"
on "public"."positions_ext"
as permissive
for select
to authenticated
using ((account_id IN ( SELECT accounts.id
   FROM accounts
  WHERE (accounts.user_id = ( SELECT auth.uid() AS uid)))));


create policy "Allow update on positions_ext for owner"
on "public"."positions_ext"
as permissive
for update
to authenticated
using ((account_id IN ( SELECT accounts.id
   FROM accounts
  WHERE (accounts.user_id = ( SELECT auth.uid() AS uid)))))
with check ((account_id IN ( SELECT accounts.id
   FROM accounts
  WHERE (accounts.user_id = ( SELECT auth.uid() AS uid)))));


create policy "select_own_positions"
on "public"."positions_ext"
as permissive
for select
to public
using ((account_id IN ( SELECT accounts.id
   FROM accounts
  WHERE (accounts.user_id = ( SELECT auth.uid() AS uid)))));


create policy "select_own_user"
on "public"."users"
as permissive
for select
to public
using ((id = ( SELECT auth.uid() AS uid)));


create policy "Orders are viewable by owner"
on "public"."orders"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Orders can be inserted by owner"
on "public"."orders"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Orders can be updated by owner"
on "public"."orders"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Positions are viewable by owner"
on "public"."positions"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Positions can be inserted by owner"
on "public"."positions"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Positions can be updated by owner"
on "public"."positions"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Profiles are viewable by owner"
on "public"."profiles"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Profiles can be inserted by owner"
on "public"."profiles"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Profiles can be updated by owner"
on "public"."profiles"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = id));



