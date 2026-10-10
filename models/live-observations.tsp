// Generated sample-only views from redacted authenticated observations.

// These types are not linked to API operations or static response models.

using TypeSpec.OpenAPI;

namespace Eliis.LiveObservations;

@extension("x-observation-labels", #["GetAbsenceModalData"])
@extension("x-operation-id", "GetAbsenceModalData")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetAbsenceModalData", `observationLabels`: #["GetAbsenceModalData"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetAbsenceModalData extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `min_date`?: string;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildCalendar_child_data_days extends Record<unknown> {
  @extension("x-sample-observed-type", "integer")
  `d_0`?: integer;
  @extension("x-sample-observed-type", "integer")
  `d_1`?: integer;
  @extension("x-sample-observed-type", "integer")
  `d_2`?: integer;
  @extension("x-sample-observed-type", "integer")
  `d_3`?: integer;
  @extension("x-sample-observed-type", "integer")
  `d_4`?: integer;
  @extension("x-sample-observed-type", "integer")
  `d_5`?: integer;
  @extension("x-sample-observed-type", "integer")
  `d_6`?: integer;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildCalendar_child_data extends Record<unknown> {
  @extension("x-sample-observed-type", "unknown")
  `arrive_date`?: unknown;
  @extension("x-sample-observed-type", "object")
  `days`?: Observed_GetChildCalendar_child_data_days;
  @extension("x-sample-observed-type", "unknown")
  `leave_date`?: unknown;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildCalendar_daysItem_entry_diary_status extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `color`?: string;
  @extension("x-sample-observed-type", "string")
  `icon`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "integer")
  `type`?: integer;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildCalendar_daysItem_entry extends Record<unknown> {
  @extension("x-sample-observed-type", "integer")
  `child_id`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `deleted_at`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `diary_id`?: integer;
  @extension("x-sample-observed-type", "object")
  `diary_status`?: Observed_GetChildCalendar_daysItem_entry_diary_status;
  @extension("x-sample-observed-type", "integer")
  `has_card_event`?: integer;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `leave_type_id`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `status`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `total_time`?: unknown;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildCalendar_daysItem extends Record<unknown> {
  @extension("x-sample-observed-type", "integer")
  `course_id`?: integer;
  @extension("x-sample-observed-type", "string")
  `date`?: string;
  @extension("x-sample-observed-type", "object")
  `entry`?: Observed_GetChildCalendar_daysItem_entry;
  @extension("x-sample-observed-type", "integer")
  `log_count`?: integer;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildCalendar_default_status extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `color`?: string;
  @extension("x-sample-observed-type", "string")
  `icon`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "integer")
  `meals`?: integer;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "integer")
  `type`?: integer;
}

@extension("x-observation-labels", #["GetChildCalendar"])
@extension("x-operation-id", "GetChildCalendar")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetChildCalendar", `observationLabels`: #["GetChildCalendar"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildCalendar extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `access`?: string;
  @extension("x-sample-observed-type", "object")
  `child_data`?: Observed_GetChildCalendar_child_data;
  @extension("x-sample-observed-type", "string")
  `comment_date`?: string;
  @extension("x-sample-observed-type", "array")
  `days`?: Observed_GetChildCalendar_daysItem[];
  @extension("x-sample-observed-type", "object")
  `default_status`?: Observed_GetChildCalendar_default_status;
  @extension("x-sample-observed-type", "array")
  `holidays`?: unknown[];
  @extension("x-sample-observed-type", "string")
  `lock_date`?: string;
  @extension("x-sample-observed-type", "integer")
  `workday_holiday`?: integer;
  @extension("x-sample-observed-type", "integer")
  `workday_weekend`?: integer;
}

@extension("x-observation-labels", #["GetChildCourses"])
@extension("x-operation-id", "GetChildCourses")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetChildCourses", `observationLabels`: #["GetChildCourses"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildCoursesItem extends Record<unknown> {
  @extension("x-sample-observed-type", "boolean")
  `active`?: boolean;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
}

// Sample-only response array view for GetChildCourses; labels: GetChildCourses.
alias Observed_GetChildCourses = Observed_GetChildCoursesItem[];

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildProfile_active_coursesItem extends Record<unknown> {
  @extension("x-sample-observed-type", "boolean")
  `active`?: boolean;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "integer")
  `type`?: integer;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildProfile_all_dietary_optionsItem extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `created_at`?: string;
  @extension("x-sample-observed-type", "integer")
  `created_by`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `deleted_at`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "integer")
  `kindergarten_id`?: integer;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "string")
  `updated_at`?: string;
  @extension("x-sample-observed-type", "unknown")
  `updated_by`?: unknown;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildProfile_course_datesItem extends Record<unknown> {
  @extension("x-sample-observed-type", "integer")
  `course_child_id`?: integer;
  @extension("x-sample-observed-type", "string")
  `course_end_date`?: string;
  @extension("x-sample-observed-type", "integer")
  `course_id`?: integer;
  @extension("x-sample-observed-type", "string")
  `course_start_date`?: string;
  @extension("x-sample-observed-type", "string")
  `end_date`?: string;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "string")
  `start_date`?: string;
  @extension("x-sample-observed-type", "integer")
  `type`?: integer;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildProfile_data_address extends Record<unknown> {
  @extension("x-sample-observed-type", "unknown")
  `address`?: unknown;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildProfile_data extends Record<unknown> {
  @extension("x-sample-observed-type", "object")
  `address`?: Observed_GetChildProfile_data_address;
  @extension("x-sample-observed-type", "integer")
  `child_id`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `comment`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `info`?: unknown;
  @extension("x-sample-observed-type", "unknown")
  `nativelang`?: unknown;
}

@extension("x-observation-labels", #["GetChildProfile"])
@extension("x-operation-id", "GetChildProfile")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetChildProfile", `observationLabels`: #["GetChildProfile"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetChildProfile extends Record<unknown> {
  @extension("x-sample-observed-type", "array")
  `active_courses`?: Observed_GetChildProfile_active_coursesItem[];
  @extension("x-sample-observed-type", "array")
  `all_dietary_options`?: Observed_GetChildProfile_all_dietary_optionsItem[];
  @extension("x-sample-observed-type", "array")
  `course_dates`?: Observed_GetChildProfile_course_datesItem[];
  @extension("x-sample-observed-type", "string")
  `created_at`?: string;
  @extension("x-sample-observed-type", "object")
  `data`?: Observed_GetChildProfile_data;
  @extension("x-sample-observed-type", "unknown")
  `deleted_at`?: unknown;
  @extension("x-sample-observed-type", "array")
  `dietary_options`?: unknown[];
  @extension("x-sample-observed-type", "string")
  `dob`?: string;
  @extension("x-sample-observed-type", "string")
  `fname`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "string")
  `idcode`?: string;
  @extension("x-sample-observed-type", "integer")
  `kindergarten_id`?: integer;
  @extension("x-sample-observed-type", "string")
  `lname`?: string;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "unknown")
  `profile_picture`?: unknown;
  @extension("x-sample-observed-type", "unknown")
  `profile_picture_updated_at`?: unknown;
  @extension("x-sample-observed-type", "string")
  `updated_at`?: string;
  @extension("x-sample-observed-type", "string")
  `view`?: string;
}

@extension("x-observation-labels", #["GetDayMenu"])
@extension("x-operation-id", "GetDayMenu")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetDayMenu", `observationLabels`: #["GetDayMenu"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetDayMenu extends Record<unknown> {
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetEventsItem_creator extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `fname`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "string")
  `lname`?: string;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "unknown")
  `profile_picture`?: unknown;
}

@extension("x-observation-labels", #["GetEvents"])
@extension("x-operation-id", "GetEvents")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetEvents", `observationLabels`: #["GetEvents"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetEventsItem extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `access`?: string;
  @extension("x-sample-observed-type", "string")
  `created_at`?: string;
  @extension("x-sample-observed-type", "integer")
  `created_by`?: integer;
  @extension("x-sample-observed-type", "object")
  `creator`?: Observed_GetEventsItem_creator;
  @extension("x-sample-observed-type", "unknown")
  `deleted_at`?: unknown;
  @extension("x-sample-observed-type", "string")
  `description`?: string;
  @extension("x-sample-observed-type", "integer")
  `duration`?: integer;
  @extension("x-sample-observed-type", "string")
  `end_date`?: string;
  @extension("x-sample-observed-type", "unknown")
  `end_time`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `event_type`?: integer;
  @extension("x-sample-observed-type", "array")
  `exceptions`?: unknown[];
  @extension("x-sample-observed-type", "unknown")
  `folder_id`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "boolean")
  `is_recurring`?: boolean;
  @extension("x-sample-observed-type", "integer")
  `kindergarten_id`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `org_id`?: unknown;
  @extension("x-sample-observed-type", "unknown")
  `rrule`?: unknown;
  @extension("x-sample-observed-type", "string")
  `start_date`?: string;
  @extension("x-sample-observed-type", "string")
  `start_time`?: string;
  @extension("x-sample-observed-type", "unknown")
  `synced_at`?: unknown;
  @extension("x-sample-observed-type", "string")
  `title`?: string;
  @extension("x-sample-observed-type", "string")
  `unique_id`?: string;
  @extension("x-sample-observed-type", "string")
  `updated_at`?: string;
  @extension("x-sample-observed-type", "unknown")
  `updated_by`?: unknown;
}

// Sample-only response array view for GetEvents; labels: GetEvents.
alias Observed_GetEvents = Observed_GetEventsItem[];

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetGuardianFeed_dataItem_diariesItem_status extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `color`?: string;
  @extension("x-sample-observed-type", "string")
  `created_at`?: string;
  @extension("x-sample-observed-type", "integer")
  `created_by`?: integer;
  @extension("x-sample-observed-type", "string")
  `icon`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "integer")
  `kindergarten_id`?: integer;
  @extension("x-sample-observed-type", "integer")
  `meals`?: integer;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "integer")
  `type`?: integer;
  @extension("x-sample-observed-type", "string")
  `updated_at`?: string;
  @extension("x-sample-observed-type", "unknown")
  `updated_by`?: unknown;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetGuardianFeed_dataItem_diariesItem extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `course`?: string;
  @extension("x-sample-observed-type", "array")
  `feedback`?: unknown[];
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "object")
  `status`?: Observed_GetGuardianFeed_dataItem_diariesItem_status;
  @extension("x-sample-observed-type", "array")
  `texts`?: unknown[];
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetGuardianFeed_dataItem extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `date`?: string;
  @extension("x-sample-observed-type", "array")
  `diaries`?: Observed_GetGuardianFeed_dataItem_diariesItem[];
  @extension("x-sample-observed-type", "array")
  `evaluations`?: unknown[];
}

@extension("x-observation-labels", #["GetGuardianFeed"])
@extension("x-operation-id", "GetGuardianFeed")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetGuardianFeed", `observationLabels`: #["GetGuardianFeed"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetGuardianFeed extends Record<unknown> {
  @extension("x-sample-observed-type", "array")
  `data`?: Observed_GetGuardianFeed_dataItem[];
  @extension("x-sample-observed-type", "string")
  `next_date`?: string;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetRecentEvents_eventsItem_creator extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `fname`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "string")
  `lname`?: string;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "unknown")
  `profile_picture`?: unknown;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetRecentEvents_eventsItem extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `created_at`?: string;
  @extension("x-sample-observed-type", "integer")
  `created_by`?: integer;
  @extension("x-sample-observed-type", "object")
  `creator`?: Observed_GetRecentEvents_eventsItem_creator;
  @extension("x-sample-observed-type", "unknown")
  `deleted_at`?: unknown;
  @extension("x-sample-observed-type", "string")
  `description`?: string;
  @extension("x-sample-observed-type", "integer")
  `duration`?: integer;
  @extension("x-sample-observed-type", "string")
  `end_date`?: string;
  @extension("x-sample-observed-type", "unknown")
  `end_time`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `event_type`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `folder_id`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "boolean")
  `is_recurring`?: boolean;
  @extension("x-sample-observed-type", "integer")
  `kindergarten_id`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `org_id`?: unknown;
  @extension("x-sample-observed-type", "unknown")
  `rrule`?: unknown;
  @extension("x-sample-observed-type", "string")
  `start_date`?: string;
  @extension("x-sample-observed-type", "string")
  `start_time`?: string;
  @extension("x-sample-observed-type", "unknown")
  `synced_at`?: unknown;
  @extension("x-sample-observed-type", "string")
  `title`?: string;
  @extension("x-sample-observed-type", "string")
  `updated_at`?: string;
  @extension("x-sample-observed-type", "unknown")
  `updated_by`?: unknown;
}

@extension("x-observation-labels", #["GetRecentEvents"])
@extension("x-operation-id", "GetRecentEvents")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetRecentEvents", `observationLabels`: #["GetRecentEvents"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetRecentEvents extends Record<unknown> {
  @extension("x-sample-observed-type", "integer")
  `count`?: integer;
  @extension("x-sample-observed-type", "array")
  `events`?: Observed_GetRecentEvents_eventsItem[];
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetStatusLogsItem_diary_status extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `color`?: string;
  @extension("x-sample-observed-type", "string")
  `icon`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetStatusLogsItem_identifiable extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `fname`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "string")
  `lname`?: string;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "string")
  `type`?: string;
  @extension("x-sample-observed-type", "string")
  `unique_id`?: string;
}

@extension("x-observation-labels", #["GetStatusLogs", "GetStatusLogs-recorded-day"])
@extension("x-operation-id", "GetStatusLogs")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetStatusLogs", `observationLabels`: #["GetStatusLogs", "GetStatusLogs-recorded-day"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetStatusLogsItem extends Record<unknown> {
  @extension("x-sample-observed-type", "unknown")
  `comment`?: unknown;
  @extension("x-sample-observed-type", "string")
  `created_at`?: string;
  @extension("x-sample-observed-type", "string")
  `date`?: string;
  @extension("x-sample-observed-type", "object")
  `diary_status`?: Observed_GetStatusLogsItem_diary_status;
  @extension("x-sample-observed-type", "unknown")
  `end_time`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "object")
  `identifiable`?: Observed_GetStatusLogsItem_identifiable;
  @extension("x-sample-observed-type", "integer")
  `identifiable_id`?: integer;
  @extension("x-sample-observed-type", "string")
  `identifiable_type`?: string;
  @extension("x-sample-observed-type", "unknown")
  `start_time`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `status`?: integer;
  @extension("x-sample-observed-type", "string")
  `type`?: string;
}

// Sample-only response array view for GetStatusLogs; labels: GetStatusLogs, GetStatusLogs-recorded-day.
alias Observed_GetStatusLogs = Observed_GetStatusLogsItem[];

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetUserData_cartData extends Record<unknown> {
  @extension("x-sample-observed-type", "integer")
  `count`?: integer;
  @extension("x-sample-observed-type", "array")
  `items`?: unknown[];
  @extension("x-sample-observed-type", "integer")
  `sum`?: integer;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetUserData_childrenItem extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `fname`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "integer")
  `kindergarten_id`?: integer;
  @extension("x-sample-observed-type", "string")
  `lname`?: string;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "unknown")
  `profile_picture`?: unknown;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetUserData_guardiansItem extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `fname`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "integer")
  `kindergarten_id`?: integer;
  @extension("x-sample-observed-type", "string")
  `lname`?: string;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "string")
  `type`?: string;
  @extension("x-sample-observed-type", "string")
  `unique_id`?: string;
  @extension("x-sample-observed-type", "integer")
  `user_id`?: integer;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetUserData_kindergartensItem extends Record<unknown> {
  @extension("x-sample-observed-type", "integer")
  `country_id`?: integer;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `logo`?: unknown;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "integer")
  `org_id`?: integer;
  @extension("x-sample-observed-type", "string")
  `status`?: string;
  @extension("x-sample-observed-type", "integer")
  `two_fa_required`?: integer;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetUserData_user_address extends Record<unknown> {
  @extension("x-sample-observed-type", "unknown")
  `address`?: unknown;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetUserData_user_country extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `code`?: string;
  @extension("x-sample-observed-type", "string")
  `continent`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "string")
  `phone_code`?: string;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetUserData_user_language extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `code`?: string;
  @extension("x-sample-observed-type", "string")
  `family`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "string")
  `long_code`?: string;
  @extension("x-sample-observed-type", "string")
  `name`?: string;
  @extension("x-sample-observed-type", "string")
  `native_name`?: string;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetUserData_user_phone extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `code`?: string;
  @extension("x-sample-observed-type", "string")
  `number`?: string;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetUserData_user extends Record<unknown> {
  @extension("x-sample-observed-type", "object")
  `address`?: Observed_GetUserData_user_address;
  @extension("x-sample-observed-type", "object")
  `country`?: Observed_GetUserData_user_country;
  @extension("x-sample-observed-type", "unknown")
  `dob`?: unknown;
  @extension("x-sample-observed-type", "string")
  `email`?: string;
  @extension("x-sample-observed-type", "string")
  `email_verified_at`?: string;
  @extension("x-sample-observed-type", "string")
  `fname`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `idcode`?: unknown;
  @extension("x-sample-observed-type", "unknown")
  `info`?: unknown;
  @extension("x-sample-observed-type", "boolean")
  `is_admin`?: boolean;
  @extension("x-sample-observed-type", "boolean")
  `is_supplier`?: boolean;
  @extension("x-sample-observed-type", "object")
  `language`?: Observed_GetUserData_user_language;
  @extension("x-sample-observed-type", "string")
  `lname`?: string;
  @extension("x-sample-observed-type", "object")
  `phone`?: Observed_GetUserData_user_phone;
  @extension("x-sample-observed-type", "unknown")
  `preferences`?: unknown;
  @extension("x-sample-observed-type", "string")
  `privacy_confirmed`?: string;
  @extension("x-sample-observed-type", "string")
  `profile_picture`?: string;
  @extension("x-sample-observed-type", "string")
  `timezone`?: string;
  @extension("x-sample-observed-type", "integer")
  `two_fa_enabled`?: integer;
  @extension("x-sample-observed-type", "string")
  `username`?: string;
}

@extension("x-observation-labels", #["GetUserData"])
@extension("x-operation-id", "GetUserData")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetUserData", `observationLabels`: #["GetUserData"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetUserData extends Record<unknown> {
  @extension("x-sample-observed-type", "object")
  `cartData`?: Observed_GetUserData_cartData;
  @extension("x-sample-observed-type", "array")
  `children`?: Observed_GetUserData_childrenItem[];
  @extension("x-sample-observed-type", "array")
  `employees`?: unknown[];
  @extension("x-sample-observed-type", "array")
  `guardians`?: Observed_GetUserData_guardiansItem[];
  @extension("x-sample-observed-type", "array")
  `kindergartens`?: Observed_GetUserData_kindergartensItem[];
  @extension("x-sample-observed-type", "string")
  `login`?: string;
  @extension("x-sample-observed-type", "array")
  `officials`?: unknown[];
  @extension("x-sample-observed-type", "array")
  `organizations`?: unknown[];
  @extension("x-sample-observed-type", "array")
  `supplier_reps`?: unknown[];
  @extension("x-sample-observed-type", "array")
  `suppliers`?: unknown[];
  @extension("x-sample-observed-type", "integer")
  `unreadAnnouncementCount`?: integer;
  @extension("x-sample-observed-type", "object")
  `user`?: Observed_GetUserData_user;
}

@extension("x-observation-labels", #["GetUserPermissions-institution-1"])
@extension("x-operation-id", "GetUserPermissions")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetUserPermissions", `observationLabels`: #["GetUserPermissions-institution-1"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetUserPermissions extends Record<unknown> {
  @extension("x-sample-observed-type", "integer")
  `announcement_access_index`?: integer;
  @extension("x-sample-observed-type", "integer")
  `announcement_can_see_receivers`?: integer;
  @extension("x-sample-observed-type", "integer")
  `child_access_files_guardian`?: integer;
  @extension("x-sample-observed-type", "integer")
  `child_access_index`?: integer;
  @extension("x-sample-observed-type", "integer")
  `child_access_plans`?: integer;
  @extension("x-sample-observed-type", "integer")
  `child_access_view`?: integer;
  @extension("x-sample-observed-type", "integer")
  `child_approvals_edit`?: integer;
  @extension("x-sample-observed-type", "integer")
  `child_dev_goal_view_parent`?: integer;
  @extension("x-sample-observed-type", "integer")
  `child_edit_files_guardian`?: integer;
  @extension("x-sample-observed-type", "integer")
  `child_manage_files_guardian`?: integer;
  @extension("x-sample-observed-type", "integer")
  `child_parent_access_maps`?: integer;
  @extension("x-sample-observed-type", "integer")
  `child_parent_view_map`?: integer;
  @extension("x-sample-observed-type", "integer")
  `child_view_guardian_invoices_guardian`?: integer;
  @extension("x-sample-observed-type", "integer")
  `contacts_access_index`?: integer;
  @extension("x-sample-observed-type", "integer")
  `contacts_access_kindergarten`?: integer;
  @extension("x-sample-observed-type", "integer")
  `documents_access_index`?: integer;
  @extension("x-sample-observed-type", "integer")
  `events_access_index`?: integer;
  @extension("x-sample-observed-type", "integer")
  `foodmenu_access_index`?: integer;
  @extension("x-sample-observed-type", "integer")
  `foodmenu_view_unpublished`?: integer;
  @extension("x-sample-observed-type", "integer")
  `forum_access_index`?: integer;
  @extension("x-sample-observed-type", "integer")
  `gallery_access_index`?: integer;
  @extension("x-sample-observed-type", "integer")
  `message_can_see_receivers`?: integer;
  @extension("x-sample-observed-type", "integer")
  `statistics_access_activity`?: integer;
  @extension("x-sample-observed-type", "integer")
  `statistics_access_attendance`?: integer;
  @extension("x-sample-observed-type", "integer")
  `statistics_access_courses`?: integer;
  @extension("x-sample-observed-type", "integer")
  `statistics_access_index`?: integer;
  @extension("x-sample-observed-type", "integer")
  `statistics_access_kindergarten`?: integer;
  @extension("x-sample-observed-type", "integer")
  `statistics_access_menu`?: integer;
  @extension("x-sample-observed-type", "integer")
  `statistics_access_plans`?: integer;
  @extension("x-sample-observed-type", "integer")
  `surveys_access_index`?: integer;
  @extension("x-sample-observed-type", "integer")
  `surveys_access_polls`?: integer;
  @extension("x-sample-observed-type", "integer")
  `surveys_access_questionnaires`?: integer;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetWeekMenu_daysItem extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `breakfast`?: string;
  @extension("x-sample-observed-type", "string")
  `created_at`?: string;
  @extension("x-sample-observed-type", "integer")
  `created_by`?: integer;
  @extension("x-sample-observed-type", "string")
  `date`?: string;
  @extension("x-sample-observed-type", "unknown")
  `dinner`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "integer")
  `kindergarten_id`?: integer;
  @extension("x-sample-observed-type", "string")
  `lunch`?: string;
  @extension("x-sample-observed-type", "string")
  `supper`?: string;
  @extension("x-sample-observed-type", "string")
  `updated_at`?: string;
  @extension("x-sample-observed-type", "unknown")
  `updated_by`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `week_id`?: integer;
}

@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetWeekMenu_settings extends Record<unknown> {
  @extension("x-sample-observed-type", "integer")
  `workday_holiday`?: integer;
  @extension("x-sample-observed-type", "integer")
  `workday_weekend`?: integer;
}

@extension("x-observation-labels", #["GetWeekMenu"])
@extension("x-operation-id", "GetWeekMenu")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "GetWeekMenu", `observationLabels`: #["GetWeekMenu"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_GetWeekMenu extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `created_at`?: string;
  @extension("x-sample-observed-type", "integer")
  `created_by`?: integer;
  @extension("x-sample-observed-type", "array")
  `days`?: Observed_GetWeekMenu_daysItem[];
  @extension("x-sample-observed-type", "string")
  `end`?: string;
  @extension("x-sample-observed-type", "integer")
  `id`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `info`?: unknown;
  @extension("x-sample-observed-type", "integer")
  `kindergarten_id`?: integer;
  @extension("x-sample-observed-type", "unknown")
  `published`?: unknown;
  @extension("x-sample-observed-type", "object")
  `settings`?: Observed_GetWeekMenu_settings;
  @extension("x-sample-observed-type", "string")
  `start`?: string;
  @extension("x-sample-observed-type", "string")
  `updated_at`?: string;
  @extension("x-sample-observed-type", "unknown")
  `updated_by`?: unknown;
  @extension("x-sample-observed-type", "unknown")
  `uploaded_file`?: unknown;
  @extension("x-sample-observed-type", "array")
  `uploaded_files`?: unknown[];
}

@extension("x-observation-labels", #["Login"])
@extension("x-operation-id", "Login")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "Login", `observationLabels`: #["Login"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_Login extends Record<unknown> {
  @extension("x-sample-observed-type", "string")
  `identifier`?: string;
  @extension("x-sample-observed-type", "unknown")
  `locked_out`?: unknown;
  @extension("x-sample-observed-type", "string")
  `type`?: string;
}

@extension("x-observation-labels", #["Login2FA"])
@extension("x-operation-id", "Login2FA")
@extension("x-provenance", #{`type`: "redacted-authenticated-observation-shapes", `operationId`: "Login2FA", `observationLabels`: #["Login2FA"]})
@extension("x-authenticated-sample-view", true)
@extension("x-normative", false)
model Observed_Login2FA extends Record<unknown> {
  @extension("x-sample-observed-type", "unknown")
  `locked_at`?: unknown;
  @extension("x-sample-observed-type", "string")
  `status`?: string;
}
