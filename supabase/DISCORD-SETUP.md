# PFRL Discord login — setup checklist

The current GitHub Pages Garage uses GitHub Issues for community submissions. This is NOT authenticated driver-owned editing. Do not describe it as a secure account system until the migration is complete.

1. Create a Supabase project and run `supabase/pfrl-schema.sql` in its SQL Editor.
2. In Supabase Authentication > URL Configuration, set Site URL to `https://markwatson23.github.io/pfrl-stats/` and add `https://markwatson23.github.io/pfrl-stats/**` as an allowed redirect.
3. In Discord Developer Portal create an OAuth2 application. Add the Supabase callback URL shown under Supabase Authentication > Providers > Discord to Discord's Redirects.
4. Copy Discord client ID and client secret into Supabase's Discord provider settings. Never put the Discord secret in this repository.
5. Provide only the Supabase project URL and public publishable/anon key for the GitHub Pages frontend. Never expose the service_role key.
6. Test as Watson: sign in with Discord; save a profile (driver name, platform, input, default visibility); create private and public setups; verify anonymous users can read only public setups; verify a second signed-in user cannot edit or delete Watson's records.
7. Migrate public Garage publishing from unauthenticated GitHub Issues to Supabase owner-only writes. Remove the old GitHub Issue submission pathway before claiming editing requires Discord login.

Security: RLS is enabled in the schema. The profile table is private to its owner; only explicitly public setups can be read by other users. Any other future data tables (laps, race plans) need equivalent ownership policies.
