# Conturi de părinte (Supabase)

Până nu sunt făcuți pașii de mai jos, aplicația merge exact ca înainte: fără cont, cu progresul pe dispozitiv.
Butoanele „Creează cont” / „Intră” apar doar după ce build-ul primește cheile.

## 1. Proiectul Supabase (o singură dată, ~10 minute)

1. Intră pe https://supabase.com, „New project”. Regiunea: **Central EU (Frankfurt)**. Planul gratuit ajunge.
2. **SQL Editor** → lipește tot fișierul `supabase/setup.sql` → Run.
3. **Authentication → Sign In / Providers → Email**: pornit. „Confirm email” poate rămâne pornit.
4. **Authentication → Email Templates → Magic Link**: înlocuiește textul ca să trimită un cod, de exemplu:

   ```html
   <h2>Codul tău Tudoo!</h2>
   <p>Scrie acest cod în aplicație: <b style="font-size:28px">{{ .Token }}</b></p>
   <p>Dacă nu ai cerut tu codul, ignoră acest email.</p>
   ```

   Fă la fel și pentru „Confirm signup”.
5. **Authentication → URL Configuration**: Site URL = `https://tudoo.ro/app/` (sau adresa GitHub Pages);
   adaugă aceeași adresă și la „Redirect URLs”.
6. Pentru emailuri reale (nu doar de test), Supabase cere un SMTP propriu peste câteva emailuri pe oră:
   **Project Settings → Authentication → SMTP** (de ex. Resend sau Brevo, au plan gratuit).

## 2. Cheile în GitHub

În repo: **Settings → Secrets and variables → Actions → Variables** → „New repository variable”:

| Nume | Valoare |
| --- | --- |
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Project Settings → API → `anon` / publishable key (e publică, nu e secretă) |
| `SUPABASE_GOOGLE` | `1` doar după pasul 3 (opțional) |

Apoi Actions → „Deploy to GitHub Pages” → Run workflow.

## 3. „Continuă cu Google” (opțional)

Authentication → Providers → Google: are nevoie de un Client ID / Secret din Google Cloud Console
(redirect URI-ul îl arată Supabase pe aceeași pagină). După ce merge, pune variabila `SUPABASE_GOOGLE` = `1`.

## Ce se salvează

Tabelul `families`: un rând per părinte, cu emailul (în Supabase Auth) și JSON-ul cu copiii (prenume, prieten,
stele, haine, setări). Înregistrările vocii nu pleacă de pe dispozitiv. „Șterge contul” din Setări șterge
contul și rândul lui.
