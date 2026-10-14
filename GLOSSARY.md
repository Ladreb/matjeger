# Matjeger

Norwegian grocery price comparison. Users report prices per store chain and postal code, and the app shows where a shopping list is cheapest.

## Language

### Stores

**Store chain**:
A Norwegian grocery chain, for example Rema 1000 or Kiwi. Oda is a store chain with no physical stores. Prices belong to a store chain at a postal code.
_Avoid_: Chain, brand, butikk

**Store**:
One physical shop of a store chain, with its own address. Not tracked yet.
_Avoid_: Shop, branch, outlet

### Prices

**Price report**:
One user's observation of a product's price at a store chain, in a postal code, at a point in time.
_Avoid_: Price entry, submission

**Price**:
The latest visible price report for a product at a store chain in the user's postal code.
_Avoid_: Current price, local price

**Area price**:
A price taken from the postal code area when the user's own postal code has no price for that store chain. Shown in the UI as "Pris fra 01xx".
_Avoid_: Nearby price

**Postal code area**:
The first two digits of a postal code, for example 01xx.
_Avoid_: Region, nearby

**Verification**:
A distinct user whose latest visible price report in the last 30 days has the same store chain, postal code and price as the shown price. Counted, not a status: there is no "verified price" yet.
_Avoid_: Confirmation, vote

**Stale**:
A price report older than 30 days. It is shown with a warning, never hidden.

**Hidden report**:
A price report an admin has hidden. It is kept, but never used as a price.
_Avoid_: Deleted report

**Øre**:
The unit prices are held in. 1 kr = 100 øre.

### Catalogue

**Product**:
A grocery in the catalogue, curated by admins and identified by a barcode or a PLU code.
_Avoid_: Item, vare

**Unknown barcode**:
A scanned barcode that no product has.

**Catalogue editor**:
A user who may create and edit products and hide price reports: a `PRODUCT_ADMIN` or an `ADMIN`.

### Shopping

**List item**:
A product on a user's shopping list, with a quantity and a tick.
_Avoid_: Item

**Plan**:
The store chains to visit for a shopping list, the items bought at each, and the total.
_Avoid_: Trip, route

**Stop**:
One store chain visited in a plan. A plan has at most two.

### People

**Reporter**:
The user who made a price report.
