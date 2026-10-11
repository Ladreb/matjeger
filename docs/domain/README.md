# Domain

What Matjeger does, by domain. Each domain maps to a folder in `src/features/<domain>`. Technology and conventions live in `docs/technology`.

| Domain | Status | Description |
| --- | --- | --- |
| [Users and roles](users-and-roles.md) | Login and role guard done | Google login, three roles |
| [Location](location.md) | Built (on test database) | The user's postal code |
| [Products](products.md) | Admin create and edit done | Curated catalogue of groceries |
| [Pricing](pricing.md) | Schema only | Price reports per chain and postal code |
| [Shopping list](shopping-list.md) | Built (on test database) | Cheapest chain for a list near the user |

## Glossary

- **Chain**: a Norwegian grocery chain, the `Store` enum (Rema 1000, Kiwi, Spar, Meny, Coop Extra, Coop Obs, Coop Prix, Bunnpris, Oda).
- **Price report**: one user's observation of a product price at a chain, in a postal code, at a point in time.
- **Øre**: prices are integers in øre (1 kr = 100 øre).
- **Stale**: a price report older than 30 days.
