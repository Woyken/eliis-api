# Request-model enrichment evidence

This bounded pass traces client-side object/FormData construction upstream of domain and auth service methods in the full Hermes disassembly at `/data/data/com.termux/files/home/eliis-analysis/eliis.hasm`. The accompanying [`request-model-enrichment.json`](request-model-enrichment.json) records the per-field evidence and construction status.

These are **client-created payloads**, not server-complete schemas. A field name being copied into an object does not establish server requiredness or validation. Values forwarded from forms, state, profile data, or cart entries remain `unknown` unless the bytecode shows a literal or conversion.

## Recoverable constructors

| App flow | Constructor evidence | Recovered request shape | Construction / coverage |
| --- | --- | --- | --- |
| Password login | #13512, line 543678, object `+0x87`; #16308, line 648612 | `{username,password,platform:{platform:string,browser:string,login:"password"}}` | Final service construction locally complete; isolated auth-client POST. |
| 2FA login | #27140, line 1048334, object `+0x24`; #16309 | `{code,login_identifier,platform:{platform:string,browser:string}}` app variant | Default-client POST; arbitrary service input stays open; no nested login added. |
| Social login | #16311, line 648684 | `p=getPlatform(); p.login=input.social; input.platform=p`; outer `role=null`, `tz=-180`, `lang="en"` | No outer login assignment. Nested platform has string platform/browser. Default-client POST; arbitrary remainder open. |
| Social registration | #16314, line 648760 | Same independently checked nested platform mutation and outer constants | No outer login assignment; default-client POST; arbitrary remainder open. |
| Registration | pass-through thunk #16255, line 647379, `registerUser` call at `0x0c–0x19` | `unknown` | The action forwards captured input without inspecting or constructing it. No app-side registration form constructor was recovered in this bounded pass. |
| Profile update | #40860, line 1657275, object `+0x1f`, call `+0xc6` | `email,username,fname,lname,idcode,address:{address},phone,privacy_confirmed,timezone,dob` | dob always assigned: submitted truthy value or null. Locally complete, not universal. |
| Password update | `formSubmitHandler`, #40950, line 1661182, object at `0x05`; `updateUser` at `0x53–0x59` | `{ current_password, password, password_confirm }` | Locally complete for this form. |
| Enable 2FA | #41132, line 1669637, object `+0x3b` | `{key:handlerParameter1,identifier:capturedState.login_identifier}` | Locally complete for submitted verification handler. |
| Send announcement | #42237, line 1712780; #42238/#42239 callbacks | Fixed multipart parts `subject,body,type="announcement"`; dynamic `targetGroups[{index}][{key}]` with element[key] values | No fixed targetGroups property. Outer targetGroups.forEach; inner Object.keys(element).forEach. Zero dynamic parts possible. |
| Add cart item | #40014, line 1613825 | `qty,course_period_id:null`, product_id iff item.type === "product", service_id otherwise | Final null is not overwritten. Identifiers unknown. |
| Submit order | #40448, line 1635833; #40449, line 1635935 | 14 outer keys; wishlist truthy collection maps items to `{id,qty,product_id?,service_id?,comment}`; non-wishlist and falsy wishlist items pass through | delivery_customer_name tests customer_name; other four delivery fields test delivery_contacts. Mapper comment is undefined for nullish course. No mapped element model for StoreUserOrder. |
| First child-profile surface | #44130, line 1800862 | `fname,lname,data:{address:{address},nativelang,info,comment}`, dietaryOptions conditional; teacher/manager adds `data.days,sex,info_for_school,leave_date` and outer `dob,meals` | Branch sources are captured props. No dob truthiness gate. Local constructor only. |
| Employee child-profile surface | #44687, line 1828229 | `fname,lname,data:{address:{address},nativelang,info,comment,sex,info_for_school,days:{d_0..d_6}}`, conditional dietaryOptions; outer `meals:{breakfast,dinner,lunch,supper}` | Permission selector #44676 AND props.view === manager gates idcode/dob/data.arrive_date/leave_date/discount/contract and repeated sex assignment. Weekend sources are props.data; sex is already unconditional. Empty idcode becomes null; dob/dates use truthy-or-null. |
| Calendar attendance | #43031, line 1751064 | Common `status,comment,start_time,end_time,start_date,end_date`; single-day adds `date`; range adds `selected_start,selected_end` | Range iff props.longPeriod OR (slot16 AND submitted end_date). Times end as format result, clearing empty string, or retained null, not universal constants. Clear requires non-nullish props.data/attendance and truthy existing corresponding time. |
| Diary feedback | #43534, line 1775784; action constructors #25867/#25873 | Final `{child_id,diary_feedback_type_id,comment,visible_to_guardians:integer}` | Actions prepend child_id then Object.assign UI body. General source can overwrite child_id/add fields. Child reference is route.params.childId; diary ID is state-derived; feedback.id is URL-only. |

## Important limits

- JSON `constructionComplete: true` means all fields created by that specific local constructor were followed. It does not mean every client callsite for the service method was audited, or that the server accepts only those fields. `callsiteCoverage` is therefore marked `partial` for the reconstructed flows.
- `registerUser` remains an arbitrary forwarded object; no registration fields are proposed. `socialRegister` is a separate AuthService method with the proven assignments above and an unknown forwarded remainder.
- No form-built body was recovered for private message sending or drafts in this pass. Service arguments that are forwarded without a constructor remain unknown; UI text or nearby literals are not body-field evidence.
- Exact operation targets and module/export/thunk/service binding evidence are recorded in JSON `targets` and `routingEvidence`; similar method names alone were not used as proof. All 15 original enrichment records are either verified for integration (14) or explicitly unresolved (registration).
- Known names are integrated as partial endpoint bodies (`complete:false`) except the existing fresh Login construction; exact observed variants retain local completeness separately. Nested objects remain open; constants are client metadata only. No closed server/all-callsite shape follows.
- This correction/integration pass is not either of the required two clean final full sweeps. Those must run after all source integrations are frozen.
- No login/write requests were made, and no response schemas or server-side requiredness were inferred.

## Verified child-review caller facts integrated

These were independently checked in full `eliis.hasm`, including the constructor registers, module dependency arrays, exported closures, thunks, service installers, and final Axios argument placement—not accepted solely from the review or method names.

| Operation / exact source target | Constructor and route | Known fields |
| --- | --- | --- |
| GetGuardianInvoices / #25671 | #44547 (1819322) → M4540 dependency 15=M2239 → #25589/#25590 → M2241 installed #25671 | Query `perPage,page,sortBy,sortDir,settings,services`; params passthrough stays true. perPage=15 and sortBy="updated_at" are client metadata. page overwrites initial null; both Boolean keys are always assigned. |
| GuardianUpdateSettings / #25485 | #41002 (1663208) → M4236 dependency 15=M2236 → #25479/#25480 → M2237 installed #25485 | Inner form `setting_id,value`; guardian_id/kindergarten_id remain routing only. |
| UpdateChildGuardianFee / #25681 | #44593 (1822044) → M4542 dependency 19=M2239 → #25598/#25599 → installed #25681 | `unit_price,qty,discount`; source fee_qty/invoice_discount are renamed, not extra wire keys. |
| AddGuardianInvoiceService / #25675 | #44609 (1823081), captured service.id falsy → #25604/#25605 → installed #25675 | `label,unit_price,qty,discount,valid_from,valid_to`. |
| UpdateGuardianInvoiceService / #25677 | Same constructor, service.id truthy → #25601/#25602 → installed #25677 | Same six plus own body `id` assigned +0xc2; separate serviceId remains URL routing. |
| UpdateEntryStatus / #25955 | #25845 (1010412) → M2248 slot 4=M2249 → #25933 binding #25955 | `child_id,status`. |
| UpdateEntryStatuses / #25957 | #25851 (1010561), callbacks #25852/#25853 → M2249 installed #25957 | `children:unknown[],status`; required_day filter and entry.child.id map; no child_ids or integer-element claim. |

Calendar day/range observations were integrated as **separate exact-target variants**, as shown above, without transferring range-only selections to the single-day operation or short-only date to the range operation.

## Exact integrated field ledger

All entries below are **known partial names**, not required server fields. Dotted notation in this Markdown table describes paths; JSON operation fields use nested `fields` trees, never dotted literal properties.

| Operation | Named/nested body paths |
| --- | --- |
| Login | Existing `username,password,platform.{platform,browser,login}` preserved; added verified app variant only. |
| Login2FA | Added `code,login_identifier`; existing `platform.{platform,browser}` preserved. |
| SocialLogin / SocialRegister | Existing `platform.{platform,browser,login},role,tz,lang` preserved; added exact service-mutation variants. No outer login/social assignment invented. |
| UpdateUser | `email,username,fname,lname,idcode,address.address,phone,privacy_confirmed,timezone,dob,current_password,password,password_confirm` (13 outer keys + address leaf); profile/password variants separate. |
| EnableTwoFactorAuth | `key,identifier`. |
| SendAnnouncement | Literal multipart `subject,body,type`; dynamic `targetGroups[{index}][{key}]` is metadata only. |
| AddToCart | `qty,course_period_id,product_id,service_id`; exactly one identifier in each observed branch. |
| StoreUserOrder | `supplier_id,reg_number,email,phone,address,delivery_contacts,delivery_customer_name,delivery_reg_number,delivery_email,delivery_phone,delivery_address,notes,conditions_accept,items`; items wholly forwarded/unresolved. |
| StoreKindergartenOrder | Same 14 outer names. Truthy-wishlist-collection variant alone retains nested `items[].{id,qty,product_id,service_id,comment}`; falsy wishlist items stay unresolved. |
| GuardianUpdateSettings | `setting_id,value`. |
| UpdateChildProfile | Outer `fname,lname,data,dietaryOptions,dob,meals,idcode`; data keys `address.address,nativelang,info,comment,sex,info_for_school,days.{d_0,d_1,d_2,d_3,d_4,d_5,d_6},leave_date,arrive_date,discount,contract`; outer meals keys `breakfast,dinner,lunch,supper`. 30 recursive field occurrences including containers. |
| SaveChildCalendarSingleDay | `status,comment,start_time,end_time,start_date,end_date,date`. |
| SaveChildCalendarDays | `status,comment,start_time,end_time,start_date,end_date,selected_start,selected_end`. |
| AddGuardianInvoiceService | `label,unit_price,qty,discount,valid_from,valid_to`. |
| UpdateGuardianInvoiceService | Same six plus `id`. |
| UpdateChildGuardianFee | `unit_price,qty,discount`. |
| UpdateEntryStatus | `child_id,status`. |
| UpdateEntryStatuses | `children,status`. |
| AddEntryFeedback / UpdateEntryFeedback | Each `child_id,diary_feedback_type_id,comment,visible_to_guardians`. |

### Counts and remaining gate

- **22 operation records / 25 variants** in the four original domain research JSON files.
- Those records contain **116 direct / 151 recursive body-field occurrences**, including the preserved direct-helper fields; **104 direct / 128 recursive additions** relative to the already-corrected source-helper snapshot. Five further wishlist item leaves are retained only in the branch-specific variant. New query names: **6** (invoice list); the two existing social app_login query fields remain unchanged.
- Corrected enrichment: **15 records, 14 verified/integrated, 1 explicitly unresolved** (RegisterUser); **124 recursive bodyFields occurrences**, no duplicate paths. These metadata occurrence counts include containers and branch-specific paths; they are not emitted own-key counts.
- Read-only JSON validation, catalog construction/rendering, and coverage computation passed. Concurrent coverage fixes expanded the global set to **298 records / 296 routes**, with **283/283 baseline candidates covered**, **0 missing**, and **0 synthetic `unknown` query fields**. No coverage-owned file was edited here.
- Generator considerations: keep SendAnnouncement multipart and preserve its dynamic-parts metadata. Do not emit wishlist mapped element constraints for StoreUserOrder or for falsy wishlist items; `body.items` deliberately stays unknown, with normalized mapped fields only in `clientRequestVariants`. No generator changes were made in this pass.
- **Two consecutive clean full sweeps remain required after final source freeze** (including the separately owned multipart and coverage integrations). This bounded verification/JSON validation is not the final review gate and does not certify generated output.
