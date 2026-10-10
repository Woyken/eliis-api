# Discovery selector source resolution

The initial discovery review's selector mapping was contradicted by the original disassembly. The medium correction agent and coordinator independently checked the actual function bodies and environment stores; source takes precedence over the report.

- `#44121`, header line 1800687: `state.myChild.child` (reads at 1800692–1800693).
- `#44122`, header line 1800699: optional `state.myChild.child.kindergarten_id` (read at 1800710).
- `#44123`, header line 1800716: optional `state.myChild.child.deleted_at` (read at 1800727).
- `#44120` stores `#44121`'s result in environment slot 4 (1800125–1800127), `#44122`'s result in slot 5 (1800131–1800133), and `#44123`'s result in slot 6 (1800137–1800139).
- `#44124` reads slot 5 at 1800750 for the first action argument, route `childId` at 1800751 for the second, and literal false at 1800752 for the third. Its first argument is therefore the selected kindergarten identifier, not the whole child object.

The false versus true thunk-context distinction is separate and remains subject to the exact `#25519` branch trace. This resolution does not prove a signed-in guardian relationship, backend authorization, or that the route childId came from init-derived child selection.

No model field, server status/permission guarantee, or runtime request is inferred from this citation correction. The initial review report is retained as history rather than silently overwritten.
