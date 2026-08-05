# Klaviyo template-oversigt (Pantsat.dk tilbudsmails)

Podio-integrationen skal pege på de **nye** kode-templates, som kan redigeres via Klaviyo's API.
De gamle drag-and-drop-templates er omdøbt til "[GAMMEL - brug ny] ..." og kan arkiveres, når skiftet er testet.

| Kategori | Gammelt templateId (Podio) | Nyt templateId |
|---|---|---|
| Elektronik | R4HgWp | S7BkuL |
| Ur | TyMtqT | W5Ap6b |
| Guld og Sølv | UyVMBX | XQDpV4 |
| Smykker | RgGSKS | RdjEam |
| Cykel | VbWQeA | WABiFN |
| Tasker | XG32H6 | SnJv4d |
| Køretøj (Bil / Motorcykel) | Se87Qf | UbanyG |
| Andre | XRhxpS | XL29zE |

De nye templates bruger samme variabler som de gamle: `{{ firstname }}`, `{{ item }}`, `{{ offerRange }}`, `{{ valuationRange }}`, `{{ valuationMessage }}`, `{{ monthlyPayment }}`, `{{ latestRepurchaseDate }}`.

Indholdet vedligeholdes i `templates/`-mappen her i repoet og sendes live med:
`node scripts/klaviyo.mjs update <templateId> "<fil>"` (kræver `KLAVIYO_API_KEY` i `.env`).
