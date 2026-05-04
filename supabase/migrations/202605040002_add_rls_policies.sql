do $$
declare
  tbl text;
  direct_tables text[];
begin
  -- Direct brewery_id-scoped tables discovered from information_schema.
  select array_agg(c.table_name order by c.table_name)
    into direct_tables
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.column_name = 'brewery_id'
    and c.table_name not in ('brewery_profiles', 'users');

  if direct_tables is not null then
    foreach tbl in array direct_tables loop
      execute format('drop policy if exists %I on public.%I', 'tenant_isolation_' || tbl, tbl);
      execute format(
        'create policy %I on public.%I for all to authenticated using (brewery_id = (auth.jwt() ->> ''brewery_id'')::uuid) with check (brewery_id = (auth.jwt() ->> ''brewery_id'')::uuid)',
        'tenant_isolation_' || tbl,
        tbl
      );
    end loop;
  end if;

  -- Special-case: brewery_profiles row is the tenant.
  drop policy if exists tenant_isolation_brewery_profiles on public.brewery_profiles;
  create policy tenant_isolation_brewery_profiles
    on public.brewery_profiles
    for all
    to authenticated
    using (id = (auth.jwt() ->> 'brewery_id')::uuid)
    with check (id = (auth.jwt() ->> 'brewery_id')::uuid);

  -- Special-case: users can see themselves + all users in brewery.
  drop policy if exists users_self_or_same_brewery on public.users;
  create policy users_self_or_same_brewery
    on public.users
    for all
    to authenticated
    using (
      id = auth.uid()
      or brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
    with check (
      id = auth.uid()
      or brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    );

  -- Child tables without brewery_id derive tenant from parent links.
  drop policy if exists tenant_isolation_mash_steps on public.mash_steps;
  create policy tenant_isolation_mash_steps
    on public.mash_steps
    for all
    to authenticated
    using (
      exists (
        select 1
        from public.brew_logs bl
        where bl.id = mash_steps.brew_log_id
          and bl.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    )
    with check (
      exists (
        select 1
        from public.brew_logs bl
        where bl.id = mash_steps.brew_log_id
          and bl.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    );

  drop policy if exists tenant_isolation_boil_additions on public.boil_additions;
  create policy tenant_isolation_boil_additions
    on public.boil_additions
    for all
    to authenticated
    using (
      exists (
        select 1
        from public.brew_logs bl
        where bl.id = boil_additions.brew_log_id
          and bl.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    )
    with check (
      exists (
        select 1
        from public.brew_logs bl
        where bl.id = boil_additions.brew_log_id
          and bl.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    );

  drop policy if exists tenant_isolation_fermentation_checks on public.fermentation_checks;
  create policy tenant_isolation_fermentation_checks
    on public.fermentation_checks
    for all
    to authenticated
    using (
      exists (
        select 1
        from public.brew_logs bl
        where bl.id = fermentation_checks.brew_log_id
          and bl.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    )
    with check (
      exists (
        select 1
        from public.brew_logs bl
        where bl.id = fermentation_checks.brew_log_id
          and bl.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    );

  -- Recipe child tables: tenant scope via parent recipe
  drop policy if exists tenant_isolation_recipe_boil_additions on public.recipe_boil_additions;
  create policy tenant_isolation_recipe_boil_additions
    on public.recipe_boil_additions
    for all
    to authenticated
    using (
      exists (
        select 1
        from public.recipes r
        where r.id = recipe_boil_additions.recipe_id
          and r.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    )
    with check (
      exists (
        select 1
        from public.recipes r
        where r.id = recipe_boil_additions.recipe_id
          and r.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    );

  drop policy if exists tenant_isolation_recipe_ingredients on public.recipe_ingredients;
  create policy tenant_isolation_recipe_ingredients
    on public.recipe_ingredients
    for all
    to authenticated
    using (
      exists (
        select 1
        from public.recipes r
        where r.id = recipe_ingredients.recipe_id
          and r.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    )
    with check (
      exists (
        select 1
        from public.recipes r
        where r.id = recipe_ingredients.recipe_id
          and r.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    );

  drop policy if exists tenant_isolation_recipe_mash_steps on public.recipe_mash_steps;
  create policy tenant_isolation_recipe_mash_steps
    on public.recipe_mash_steps
    for all
    to authenticated
    using (
      exists (
        select 1
        from public.recipes r
        where r.id = recipe_mash_steps.recipe_id
          and r.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    )
    with check (
      exists (
        select 1
        from public.recipes r
        where r.id = recipe_mash_steps.recipe_id
          and r.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
      )
    );

end $$;
