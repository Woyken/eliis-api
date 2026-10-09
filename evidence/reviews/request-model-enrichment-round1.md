# Request-model enrichment independent review — round 1

## Outcome / integration gate

**Not clean: correct the evidence before integration.** Reviewed all **15 current records**, including the appended AuthService mutations and both new social records, against the full local `eliis.hasm`. There are **11 concrete correction groups** below. Unknown forwarded values are accepted; no server validation, roles, response shapes, or cosmetic changes are proposed.

Current JSON inventory: **98 direct `bodyFields` entries; 114 recursively counted field occurrences; 113 distinct paths when deduplicating within each record**. The difference is the duplicate `data.sex` in the employee record. These are metadata occurrence counts, not counts of actual emitted keys: some claimed paths are wrong, dynamic names are not literal properties, and container entries are included. There are also **4 `serviceMutation` blocks containing 12 mutation occurrences**, reviewed in full (1 password + 1 two-factor + 5 social login + 5 social registration).

Snapshot SHA-256 of `evidence/request-model-enrichment.json`: `21c5ed33c8b7972ac70a2085f0b91c946b4a0965f06b11e69ef6afd625b44891`.

Read `AGENTS.md`. Python extracted every constructor ID from the records into small temporary files under `/tmp/opencode/request-enrichment-review/`; additional action, service, export, module-registration, mapper, selector, and platform functions were extracted/read from `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`. All cited constructor/nested-constructor/service-mutation header line numbers match the full disassembly. Method-name matches were only discovery aids: module dependency arrays, environment slots, exported closure IDs, argument registers, and actual Axios calls establish the targets below.

Only this report is authored. No research/specification/code files were edited. **No network, login, private-record, or write requests were made.** This is a failing pre-integration review, **not either of the two required clean final full sweeps**. Those must run against corrected evidence and integrated output; neither may silently reuse this failing snapshot as a clean result.

## Exact action-to-service targets

`M` denotes the Metro module ID established by global `#0` registration and its literal dependency array. Listed operation IDs are the existing research operation IDs, not inferred from UI labels. Services use their default Axios client except password login's explicit `auth` client.

| Enrichment record | Proven chain / body placement | Exact target operation and endpoint |
|---|---|---|
| PasswordLogin | `#13512` requires dependency 26 of M1231 = M1574; exported `#16244` captures the body, thunk `#16245` loads M1574 environment slot 4 = dependency 3 / M1575; AuthService installer `#16306` binds `login` to `#16308`. `#16308 +0x40–0x61` reconstructs the POST data object. | **Login**, `#16308`, POST `/api/auth/login` |
| TwoFactorLogin | `#27140` loads M2340 slot 7, assigned from dependency 6 = M1575 in `#27138 +0xa5–0xb6`; `#16306` installs `#16309`. Mutated parameter 1 is Axios data at `#16309 +0x3f`. | **Login2FA**, `#16309`, POST `/api/auth/login-2fa` |
| SocialLogin | M1574 exports `#16246`, thunk `#16247` loads the same AuthService M1575 instance; `#16306 +0x4b–0x58` installs `#16311`. Data is r5 at `#16311 +0x97`, config is r1. | **SocialLogin**, `#16311`, POST `/api/auth/callback/{provider}/login` |
| SocialRegister | M1574 exports `#16250`, thunk `#16251` loads M1575; `#16306 +0x62–0x6f` installs `#16314`. Data is r5 at `#16314 +0x97`. | **SocialRegister**, `#16314`, POST `/api/auth/callback/{provider}/register` |
| RegistrationForwardedData | `#16254` captures its arbitrary argument; `#16255 +0x19` passes it to M1575's `registerUser`, installed as `#16317` by `#16306 +0x79–0x86`; Axios data is parameter 1 at `#16317 +0x19`. | **RegisterUser**, `#16317`, POST `/api/auth/register` |
| UserProfileUpdate | `#40860` dependency 25 of M4226 = M1574, exported `#16223` → thunk `#16224`, whose M1574 slot 5 is dependency 4 / M1577. `#16342 +0x90–0x9d` installs `#16357`; same constructed object becomes data at `+0x19`. | **UpdateUser**, `#16357`, PUT `/api/common/user/update` |
| UserPasswordUpdate | `#40950` dependency 18 of M4232 = M1574 → same `#16223/#16224/#16357` chain. | **UpdateUser**, `#16357`, PUT `/api/common/user/update` |
| EnableTwoFactorAuth | `#41132` loads M4251 slot 7, set from dependency 6 / M1577 by `#41123 +0xb7–0xc8`; `#16342 +0x176–0x183` installs `#16377`. Body unchanged at service `+0x19`. | **EnableTwoFactorAuth**, `#16377`, POST `/api/common/user/2fa/enable` |
| SendAnnouncement | `#42237` dependency 16 of M4335 = M2223; export `#25321` → thunk `#25322`. Thunk slot 0 is M2224 (`#25309 +0x9e–0xaf`); service installer `#25328 +0x79–0x86` binds `#25338`. FormData is config `.data` at `#25338 +0x3b–0x3e`; header is multipart. | **SendAnnouncement**, `#25338`, POST `/api/kindergartens/{kindergartenId}/announcements` |
| AddShopItemToCart | `#40014` dependency 26 of M4149 = M2293; exported `#26652` → thunk `#26653` calls `addToCart` on slot 0 = dependency 1 / M2294 (`#26601 +0x1b8–0x1c9`). Installer `#26701 +0x2fd–0x30a` binds `#26767`. | **AddToCart**, `#26767`, POST `/api/shop/cart` |
| SubmitShopOrder, non-wishlist | `#40448` dependency 22 of M4183 = M2293; `myCartOrder` export `#26666` → thunk `#26667` calls M2294 `storeUserOrder`; `#26701 +0x359–0x366` installs `#26775`. | **StoreUserOrder**, `#26775`, POST `/api/shop/orders` |
| SubmitShopOrder, wishlist | Same M2293 import; `storeKindergartenOrder` export `#26687` → thunk `#26688` adds selected kindergarten as a separate argument, not body field; `#26701 +0x3e3–0x3f0` installs `#26787`. | **StoreKindergartenOrder**, `#26787`, POST `/api/kindergartens/{kindergartenId}/shop/orders` |
| Both child-profile surfaces | `#44130` dependency 26 of M4522 and `#44687` dependency 29 of M4547 both resolve to M2239; export `#25536` → thunk `#25537`. M2239 slot 2 = dependency 3 / M2241 (`#25509 +0x23c–0x24d`). Installer `#25620 +0xbe–0xcb` binds `#25636`. Parameter 3 becomes PUT data at `#25636 +0x34–0x37`; the fourth action argument is not data. | **UpdateChildProfile**, `#25636`, PUT `/api/kindergartens/{kindergartenId}/children/{childId}` |
| Calendar single day | `#43031` dependency 23 of M4429 = M2279; export `#26410` → thunk `#26411` calls `saveChildCalendarSingleDay` on M2279 slot 0 = dependency 1 / M2241 (`#26397 +0x92–0xa3`). Installer `#25620 +0x148–0x155` binds `#25648`; parameter 3 is data at `+0x38`. | **SaveChildCalendarSingleDay**, `#25648`, POST `/api/kindergartens/{kindergartenId}/children/{childId}/calendar/day` |
| Calendar range | Same M2279 import; export `#26406` → thunk `#26407` → `saveChildCalendarDays`, installed as `#25646` at `#25620 +0x131–0x13e`. | **SaveChildCalendarDays**, `#25646`, POST `/api/kindergartens/{kindergartenId}/children/{childId}/calendar/days` |
| Diary create feedback | `#43534` dependency 19 of M4475 = M2248; export `#25864` → async wrappers `#25865/#25866` → generator `#25867`. M2248 slot 4 = dependency 3 / M2249 (`#25752 +0x22c–0x23d`). `#25933 +0x148–0x155` installs `#25961`; augmented object is data parameter 3 at `+0x38`. | **AddEntryFeedback**, `#25961`, POST `/api/kindergartens/{kindergartenId}/diary/{diaryId}/add-entry-feedback` |
| Diary update feedback | Same M2248 import; export `#25870` → `#25871/#25872` → generator `#25873`; M2249 installer `#25933 +0x15f–0x16c` binds `#25963`. Augmented object is data parameter 4 at `+0x3b`. | **UpdateEntryFeedback**, `#25963`, PUT `/api/kindergartens/{kindergartenId}/diary/{diaryId}/update-entry-feedback/{feedbackId}` |

These targets must be recorded explicitly in enrichment metadata or integration mapping. In particular, the UI/action names `userLogin`, `addItemToCart`, `myCartOrder`, and `storeChildCalendar*` are **not** the existing endpoint operation IDs. No endpoint reassignment is needed once the above chains are used.

## Concrete corrections

### F1 — Both appended social records fabricate an outer `login`

Affected: `SocialLogin` and `SocialRegister`, both `bodyFields` and `serviceMutation.mutations`, and both Markdown rows.

At `#16311/#16314 +0x24`, `getPlatform()` returns into **r2**. At `+0x28`, input **r5.social** is read into r3. `+0x2e PutById r2,r3,login` writes **platform.login**, then `+0x34 PutById r5,r2,platform` writes that platform object onto the caller body. There is **no write to r5.login**. The existing mutation wording `data.social copied to data.login` is false.

**Exact fix:** replace the proven outer `login` entry with nested **`platform.login: unknown`**, source `input.social`; describe `p=getPlatform(); p.login=input.social; input.platform=p`. Do not claim any outer login was added (an arbitrary caller might already carry one, but that is unknown remainder, not this mutation). Keep outer `role=null`, `tz=-180` integer, and `lang="en"` string: all three are final assignments at `+0x3c/+0x48/+0x52` and are valid. Preserve `constructionComplete:false` and unknown incoming remainder.

Also fix `requestConfigEvidence`: the URL is the **first explicit POST argument**, r5 is the **second** (data), and `{params:{app_login:true}}` is the **third** (config) at `+0x97`. It is not the “second auth.post argument.” `app_login` must remain query/config evidence, not a body field.

### F2 — Known nested platform construction is dropped from all four auth bodies

Affected: `PasswordLogin`, `TwoFactorLogin`, `SocialLogin`, `SocialRegister`, including repeated `serviceMutation` metadata and Markdown shape descriptions.

`#16340 getPlatform`, full header **649231**, `+0x00` creates a fresh object:

- `+0x05–0x39` constructs and assigns **`platform: string`** using system name/version, model, and device ID; string literals in the concatenation establish string output.
- `+0x3e–0x59` constructs and assigns **`browser: string`**, `"Mobile app v" + getVersion()`.
- `+0x5e` returns precisely that object. `#16339 +0x58–0x9b` traces the captured device inputs; `+0x9f–0xa4` exports this closure. AuthService M1575 dependency 4 is M1576, whose export is `#16340`.

**Exact fix:** `platform` is a locally constructed **object**, not wholly unresolved. Retain nested `platform.platform:string` and `platform.browser:string` in all four records. For password login add **`platform.login:string`, constant `"password"`**, established by `#16308 +0x26/+0x2a` before outer insertion at `+0x58`. For the social variants add **`platform.login:unknown`** per F1. Two-factor login adds **no** nested login (`#16309 +0x22/+0x26`). Do not put `browser` or `login` at the outer level.

The password service creates a fresh outer three-field body, so its locally complete construction is valid once nested evidence is restored. Two-factor service mutation preserves arbitrary fields at service level; its existing open/incomplete endpoint interpretation is conservative and valid. A verified `{code,login_identifier,platform}` app-callsite variant may be recorded separately without turning the service's unknown remainder into a closed universal model. The same local-vs-endpoint distinction applies throughout this report.

Client provenance in the new evidence also needs to stay precise: only `#16308` reads the imported client's named **`auth`** property (`+0x34`). `#16309 +0x30` and `#16311/#16314 +0x5c` read **`default`**, the configured cookie client. Their evidence should say “AuthService calls default-client POST,” not literal `auth.post` if that denotes the isolated Axios instance. Do not propagate the password client's no-request-cookie classification to these three operations.

### F3 — Profile `dob` is always assigned, with null fallback, not omitted

Affected: `UserProfileUpdate.bodyFields[dob]`, `branches`, and Markdown profile row.

`#40860 +0x8f` reads submitted `dob`; `+0x95` loads null into r4; `+0x97` skips the second read when falsy, targeting **`+0xa0 PutNewOwnById body,r4,dob`**. Both branches execute that assignment. Thus the final field is submitted truthy `dob` **or null**, not absent.

**Exact fix:** remove the truthiness-based `optional:true`; keep type unknown, explain the null fallback. Do not constrain it to constant null or infer server nullability/requiredness. The other ten recursive occurrences, including locally created `address.address`, match the bytecode.

### F4 — Announcement parts have two dynamic indices, not `targetGroups[]` or `targetGroups[key]`

Affected: `SendAnnouncement.bodyFields[targetGroups[]]`, its evidence/branches, and Markdown shape.

`#42237 +0x89–0x99` calls **submitted `targetGroups.forEach`**, not `Object.keys(targetGroups)`. Outer callback **`#42238`** receives an element as parameter 1 and its index as parameter 2 (`+0x02/+0x09`), stores both, and calls `Object.keys(element).forEach` at `+0x12–0x2c` with callback **`#42239`**. Inner callback receives the key as parameter 1:

- `#42239 +0x13` loads the **outer element index**;
- `+0x24/+0x28/+0x2c` load `"targetGroups["`, `"]["`, `"]"`;
- concat at `+0x33` produces **`targetGroups[index][key]`**;
- `+0x37/+0x3b` loads the outer element and reads **element[key]**;
- `+0x3f` appends that value under the generated name to the captured FormData.

**Exact fix:** remove the phantom fixed multipart property `targetGroups[]`. Preserve an **extension/documented dynamic field pattern `targetGroups[{index}][{key}]` with unknown per-part value**, not an `unknown[]` literal part. The observed append value is one element property, not the whole array. Include both callback IDs/offsets. No fixed index/key set is proven; zero generated parts is possible. `subject`, converted `body` (unknown result accepted), and final literal `type="announcement"` are otherwise correct. FormData is locally complete only when this callback construction is included.

### F5 — Cart product/service branches are reversed

Affected: `AddShopItemToCart` identifier evidence, `branches`, notes suggesting surprising observed mapping, and Markdown row.

`#40014 +0x22 JStrictEqual` jumps to **`+0x37` when item.type === "product"**. That branch reads item.id at `+0x3b` and writes **`product_id` at +0x40**. The fall-through non-product branch writes **`service_id` at +0x2f** and jumps to `+0x46`.

**Exact fix:** `type === "product"` → `product_id`; `type !== "product"` → `service_id`. Both remain conditional across variants and unknown-valued. `qty` and final constant `course_period_id:null` are correct; unlike calendar time fields, this null is never overwritten.

### F6 — Shop order item mapping is wishlist-only; customer-name fallback has a separate condition

Affected: `SubmitShopOrder.items`, nested applicability/coverage, delivery_customer_name evidence, branches, and Markdown row.

**Items:** `#40448 +0x0c` reads `isWishlist`; `+0x16` jumps to `+0x1e` when truthy. On **non-wishlist**, `+0x19` copies captured slot 10 directly into r0 and jumps to `+0x3a`: **no mapper runs**. On wishlist, `+0x21` first checks the captured collection; only a truthy collection invokes its `.map(#40449)` at `+0x24–0x32`; a falsy value is preserved at `+0x37`. `+0x10b` always assigns this selected r0 to body.items.

**Exact fix:** apply reconstructed `items[].id`, `qty`, conditional `product_id`, conditional `service_id`, and `comment` **only to the truthy-collection wishlist branch sent to StoreKindergartenOrder**. The StoreUserOrder variant forwards captured items unchanged and must not acquire the mapper's closed element shape. Record the falsy wishlist passthrough branch, too. The top-level object's own 14-key construction is complete; nested item construction is not uniformly complete across the combined record. Split target/branch variants or explicitly label this applicability and nested incompleteness. Preserve partial callsite coverage/open endpoint models. Accept unknown forwarded collection/element values rather than inventing domain types.

**Delivery name:** `+0x81` reads **customer_name**, and `+0x8e` tests that same value. `+0x97` assigns truthy customer_name or empty string to `delivery_customer_name`. It does **not** test delivery_contacts. The other four fields (`delivery_reg_number`, `delivery_email`, `delivery_phone`, `delivery_address`) do test delivery_contacts at `+0x9c/+0xb3/+0xca/+0xe1` and are otherwise correctly recorded. Fix the “all five” branch assertion: a truthy customer name survives even with falsy delivery_contacts.

Mapper `#40449` otherwise matches all five listed element fields. Its course check at `+0x4b` uses **loose equality to null**: null **or undefined** yields an own comment value of undefined at `+0x59` (ordinary JSON serialization can omit that property). Document nullish rather than strict-null-only behavior; do not invent a comment constant or server optionality.

### F7 — First child-profile surface loses an address level, misplaces leave_date, and misstates sources/conditions

Affected: `UpdateChildProfileGuardianSurface` and its Markdown row.

- **Address:** `#44130 +0x1d` creates data r2; `+0x1f` creates another object r3; `+0x21/+0x27` assigns submitted address to **r3.address**; `+0x2c` assigns r3 to **r2.address**. Correct shape is **`data.address:{address:unknown}`**, missing leaf **`data.address.address`**, not an unknown scalar data.address.
- **Leave date:** `+0xfa` loads **body.data** into r3; `+0xff/+0x104` reads captured props.data.leave_date; `+0x10a` writes **r3.leave_date**. Correct path is **`data.leave_date`**, not outer `leave_date`.
- **DOB:** `+0xe2/+0xe8` reads captured props.dob and assigns it unconditionally within the teacher/manager branch. There is **no dob truthiness test** here. It is conditional solely because other view values skip `+0x9c–0x10a`.
- **Sources:** after the submitted dietary-options section, `+0x78` loads captured environment slot 4 into r0; the comparisons and subsequent body assignments use that **captured props object**, not the submitted values argument. `data.days`, `data.sex`, `data.info_for_school`, outer `dob`, outer `meals`, and `data.leave_date` are copied from those props at the stated offsets. `meals` is outer (`+0xf4`), unlike data.days.

**Exact fix:** add the missing nested address leaf/container shape; rename leave-date path; retain branch optionality for the six teacher/manager-only assignments but remove the extra invented dob-truthiness condition; correct field provenance. The test is exactly `props.view === "teacher" || props.view === "manager"` (`+0x86/+0x98`). Base fname/lname/nativelang/info/comment and conditional dietaryOptions are correct. This is client branching, not a server authorization claim.

### F8 — Employee surface misnests meals/address and omits the permission gate on every manager-only field

Affected: `UpdateChildProfileEmployeeSurface`, including all 29 field occurrences, duplicate metadata, notes, and Markdown row.

**Address:** `#44687 +0x1d–0x2c` repeats the two-object construction from F7. Correct **`data.address` object** contains missing leaf **`data.address.address:unknown`**.

**Meals:** `+0x140` creates r4; breakfast/dinner/lunch/supper are written at `+0x146/+0x14f/+0x158/+0x161`. **`+0x166 PutById r7,r4,meals` writes to outer body r7**, not body.data. Rename **all five occurrences**: `data.meals` → `meals`, and `data.meals.breakfast/dinner/lunch/supper` → `meals.breakfast/dinner/lunch/supper`.

**Complete manager gate:** `+0x16c` loads captured slot 7; `+0x170 JmpFalseLong` jumps to **`+0x221`** if false. `+0x176–0x184` then checks captured props.view against `"manager"`, also jumping to `+0x221` on mismatch. Thus **all** assignments at `+0x18b–0x21b` require **slot 7 truthy AND view === "manager"**, not just idcode/dob.

Slot 7 is traced, not guessed: `#44673 +0xfc–0x106` stores the result of selector **`#44676`**; that selector returns true exactly when `state.user.permissions != null` and `permissions.child_access_managerfields` is truthy (`#44676 +0x08–0x26`). This is a client field-visibility condition only, not proof of server authorization.

| Manager-gated assignment | Exact evidence / correction |
|---|---|
| outer idcode | `+0x18b–0x1a1`: **submitted idcode === empty string becomes null**, otherwise submitted idcode. Existing wording “null is preserved, otherwise copied” misses the actual empty-string comparison (`+0x191/+0x197`). |
| outer dob | `+0x1a7–0x1b8`: truthy submitted dob or null; gate includes permission as above. |
| repeated data.sex | `+0x1be–0x1c9`: gated re-assignment from submitted gender. The initial gender assignment at `+0x7a/+0x80` is unconditional; the final property is present independently of the manager gate. |
| data.arrive_date | `+0x1cf–0x1e1`: gated, captured slot 13 truthy value or null. Existing optional true is acceptable but must state the gate. |
| data.leave_date | `+0x1e7–0x1f9`: gated, captured slot 15 truthy value or null. Same gate correction. |
| data.discount | `+0x1ff–0x20a`: **gated/conditional**, not unconditionally present. Add conditional applicability/optional true. |
| data.contract | `+0x210–0x21b`: **gated/conditional**, not unconditionally present. Add conditional applicability/optional true. |

**Duplicate:** the JSON actually contains two data.sex entries although its note says it reports the path once. Keep one property entry with both assignment offsets and the second assignment's gate; do not deduplicate away that branching evidence or make the whole sex property manager-only.

**Weekend provenance:** `+0xdf/+0xe3` and `+0x117/+0x11b` load **captured props.data**, not submitted data, for `d_0`/`d_6`. Nullish props.data or falsy existing weekend value produces numeric zero (`+0x104/+0x138`); correct the two source claims, leaving type unknown (truthy forwarded values are unresolved). All seven day keys are assigned; weekday captures d_1–d_5 and their unknown types are otherwise correct. Base names/language/info/comment, unconditional sex/info_for_school, and conditional dietaryOptions are correct.

### F9 — Calendar initial nulls are not final constants; range dates are assigned on both paths

Affected: `UpdateChildCalendarAttendance`, particularly start_time/end_time constants, start_date/end_date optionality, branch evidence, and Markdown qualification.

`#43031 +0x2a–0x31` initially assigns null to both times, but `+0x64` and `+0xcb` replace them with `.format("HH:mm")` results when the corresponding submitted value is truthy. If the submitted value is falsy **and captured props.data and its attendance are non-nullish and the existing corresponding attendance time is truthy**, the field becomes empty string (`+0x73–0x97` / `+0xda–0xfe`). Otherwise the initial null remains.

**Exact fix:** remove **both `value:null` constraints**. Keep unknown type if format-result typing is unresolved; preserve the three observed branches in notes, not a universal null constant/default. Current broad “missing time can become empty string” is insufficient if turned into a schema branch: the existing attendance-time truthiness condition matters.

`start_date` is assigned in short path at `+0x156` and range path at `+0x1df`; `end_date` is assigned at `+0x184` or `+0x203`. **Neither property is conditionally omitted by this constructor.** Remove optional true based on path selection. Keep `date` short-only (`+0x1b2`) and `selected_start`/`selected_end` range-only (`+0x212/+0x221`). Values remain unknown where conservative typing is retained.

Precise branch is **props.longPeriod truthy OR (captured slot 16 truthy AND submitted end_date truthy)** at `+0x104–0x121`, repeated before action selection at `+0x227–0x241`. A submitted end_date alone does not select range. Correct that condition explicitly; do not infer meaning/type for slot 16 without further evidence. status/comment and copied selections are otherwise correct; services do not add body fields.

### F10 — Diary actions add a missing body child_id; the UI argument is a child reference, not diary entry

Affected: `CreateOrUpdateDiaryEntryFeedback`, final body completeness/callsite wording, and Markdown row.

The three fields constructed in `#43534 +0x26–0x46` are correct, including integer visibility 0/1. However, the action-to-service chain **changes the final body**:

- Create generator **`#25867 +0x91–0xa3`** constructs `{child_id: captured action argument 1}` and then performs **`Object.assign(newObject, action argument 2)`**; merged object is POST data at `+0xa9` → `#25961 +0x38`.
- Update generator **`#25873 +0x98–0xa7`** constructs `{child_id: captured action argument 1}`, then `Object.assign(newObject, action argument 3)`; merged object is PUT data at `+0xb6` → `#25963 +0x3b`.
- `#43525 +0xcd/+0xd3` captures **route.params.childId** in slot 4, which `#43534 +0x76/+0xa6` supplies as action argument 1. It is **not an entry reference or diaryId**. Diary ID comes from state.diary.diary.id in `#25867/#25873 +0x5a–0x68`. Feedback ID is the separate update path argument as already stated.

**Exact fix:** add **`child_id:unknown`** to the verified final app-callsite variant, with both action constructor offsets and childId provenance. The final variant is `{child_id,diary_feedback_type_id,comment,visible_to_guardians}`. For arbitrary service/action input, retain open/incomplete remainder: the Object.assign source can contain extra fields **and can overwrite child_id**, because source is applied after the constructed base. Do not claim the actions universally constrain child_id to their first argument, and do not claim the three-field UI object is the final network body. Local UI construction complete and partial callsite coverage remain distinct facts.

### F11 — Enable-2FA key comes from submitted handler parameter, not captured setup key

Affected: `EnableTwoFactorAuth.bodyFields[key].evidence` only (no field/type/endpoint change).

`#41132 +0x0c LoadParam r11,1` loads the generator's explicit input; `+0x3d PutNewOwnById body,r11,key` copies **that submitted parameter**, not an environment-captured setup key. `identifier` correctly comes from captured state.login_identifier at `+0x41–0x4b`.

**Exact fix:** correct key provenance to handler parameter 1; retain unknown type. No enum/string conversion/constant is proven by this function. This prevents incorrectly conflating the submitted verification key with setup secret state.

## Exhaustive field-occurrence ledger

Every recursive occurrence was checked, not just sample fields. Counts reflect the reviewed snapshot **before fixes**. F references above identify deviations; fields not so marked are supported with unknown types accepted. Containers and flattened item paths are counted as recorded, not reinterpreted as separate literal own keys.

| Record | Direct / recursive entries | Full occurrence coverage / disposition |
|---|---:|---|
| PasswordLogin | 3 / 3 | username, password supported; platform outer supported but missing known nested object evidence (F2). serviceMutation platform checked. |
| TwoFactorLogin | 3 / 3 | code and login_identifier supported; platform nested construction missing (F2). serviceMutation platform and forwarded remainder checked. |
| SocialLogin | 5 / 5 | login phantom (F1); platform underdocumented (F2); role null, integer tz -180, string lang en supported and not overwritten. All five serviceMutation occurrences checked, with the same two corrections. |
| SocialRegister | 5 / 5 | Same full five-field/mutation checks as SocialLogin, independently read `#16314`. |
| RegistrationForwardedData | 0 / 0 | Arbitrary argument remains unknown; no local constructor or invented fields. Correct. |
| UserProfileUpdate | 10 / 11 | email, username, fname, lname, idcode, address + address.address, phone, privacy_confirmed, timezone supported; dob fallback/presence F3. All 11 checked. |
| UserPasswordUpdate | 3 / 3 | current_password, password, password_confirm all copied into fresh object; final service forwarding unchanged. Correct. |
| EnableTwoFactorAuth | 2 / 2 | key property/type correct, provenance F11; identifier correct. |
| SendAnnouncement | 4 / 4 | subject, body, type constant supported; targetGroups[] phantom and actual two-level dynamic append F4. Both callbacks fully read. |
| AddShopItemToCart | 4 / 4 | qty and course_period_id final null supported; both product_id/service_id branch directions F5. |
| SubmitShopOrder | 19 / 19 | supplier_id, reg_number, email, phone, address, delivery_contacts, all five delivery_* fields, notes, conditions_accept, items, and all five items[] paths checked. Only customer-name condition and items branch/application/nullish-comment provenance require F6. No other own keys built at `#40448 +0x3a–0x10b`. |
| UpdateChildProfileGuardianSurface | 10 / 14 | fname/lname, data container and address/nativelang/info/comment, dietaryOptions, data.days/sex/info_for_school, dob/meals/leave_date all checked. Address shape/missing leaf, leave-date path, props provenance and dob condition F7. |
| UpdateChildProfileEmployeeSurface | 18 / 29 | fname/lname, address/nativelang/info/comment, dietaryOptions, both sex occurrences, info_for_school, days container + d_1/d_2/d_3/d_4/d_5/d_0/d_6, meals container + breakfast/dinner/lunch/supper, idcode/dob, arrive_date/leave_date/discount/contract all checked. Every meals path, nested address, both weekend sources, duplicate sex, and entire manager-gated block F8. |
| UpdateChildCalendarAttendance | 9 / 9 | status/comment, both times, both range dates, short date and both selections all checked; overwritten constants, range-date presence, exact guards F9. |
| CreateOrUpdateDiaryEntryFeedback | 3 / 3 | All three UI fields supported; final action-constructed child_id missing and diary-vs-child argument provenance F10. |
| **Total** | **98 / 114** | **15/15 records; 114/114 recorded field occurrences; 12/12 repeated serviceMutation occurrences.** |

## Construction / coverage decisions

- Current counts: **11 constructionComplete:true**, **4 false** (TwoFactorLogin, both social records, registration). Coverage: **14 partial**, **1 not-established** (registration). These are not endpoint closure proofs.
- Password's fresh final body may be locally complete with F2 applied; nested known fields must not be erased. Two-factor/social arbitrary service data remain open, even though the specified app callsite may establish a narrower variant.
- UserProfileUpdate, UserPasswordUpdate, EnableTwoFactorAuth, cart, both child editors, and calendar have traceable own-object construction. Correct paths/guards/fallbacks before retaining local completeness; **do not infer wire requiredness from an unconditional own assignment**, since unknown/undefined values may disappear under JSON serialization.
- Announcement's full FormData construction includes both dynamic callbacks. Dynamic pattern metadata belongs in an extension/notes, not a phantom fixed multipart schema property.
- Order top-level construction is traceable, but its forwarded non-wishlist items and falsy wishlist input do not support universally closed mapped elements. The mapped-item shape is a partial branch-specific variant.
- Diary UI construction is traceable, but final network construction must include the action merge and child_id. Arbitrary Object.assign source remainders stay unresolved and overwrite precedence must be documented.
- No evidence justifies merging both user-update surfaces or both child-profile surfaces into a closed “complete endpoint body.” Preserve named partial variants/notes and unresolved remainder as appropriate. Do not introduce inferred server requiredness, enum/default/null constraints, or fixed role permissions.

Minor anchor clarification, if the `bytecodeOffset` is intended to mark the actual `NewObject`: password app object begins at **`#13512 +0x87`**, not `+0x81` (method lookup); 2FA app object at **`#27140 +0x24`**, not `+0x1e` (method lookup). Existing header IDs/lines are correct. This does not change any field conclusions.

## Required follow-up

Apply only the verified evidence corrections above to both JSON and Markdown; propagate nested/dynamic/branch evidence without closed universal endpoint models. Recompute recursive counts, reject duplicate paths unless explicitly represented as assignment history, and record exact target source IDs. Then perform the requested **two independent clean full sweeps of the corrected final set and integrated output**. This report supplies the failing baseline and exact fixes; it does not certify a corrected version that has not yet been reviewed.
