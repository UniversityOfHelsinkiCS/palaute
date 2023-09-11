

create table if not exists z_aud_course_realisations
(
    id                          varchar(255),
    created_at                  timestamp with time zone,
    updated_at                  timestamp with time zone,
    end_date                    timestamp with time zone,
    name                        jsonb,
    start_date                  timestamp with time zone,
    educational_institution_urn varchar(255),
    is_mooc_course              boolean,
    teaching_languages          jsonb,
    aud_action                  text,
    aud_timestamp               timestamp,
    aud_user                    text
);

alter table z_aud_course_realisations
    owner to postgres;

create table if not exists z_aud_feedback_targets
(
    id                                    integer,
    feedback_type                         enum_feedback_targets_feedback_type,
    type_id                               varchar(255),
    name                                  jsonb,
    opens_at                              timestamp with time zone,
    closes_at                             timestamp with time zone,
    created_at                            timestamp with time zone,
    updated_at                            timestamp with time zone,
    course_unit_id                        varchar(255),
    course_realisation_id                 varchar(255),
    hidden                                boolean,
    feedback_response                     text,
    public_question_ids                   integer[],
    feedback_visibility                   text,
    feedback_response_email_sent          boolean,
    feedback_opening_reminder_email_sent  boolean,
    feedback_dates_edited_by_teacher      boolean,
    feedback_response_reminder_email_sent boolean,
    feedback_count                        integer,
    feedback_reminder_last_sent_at        timestamp with time zone,
    settings_read_by_teacher              boolean,
    continuous_feedback_enabled           boolean,
    send_continuous_feedback_digest_email boolean,
    hidden_count                          integer,
    aud_action                            text,
    aud_timestamp                         timestamp,
    aud_user                              text
);

alter table z_aud_feedback_targets
    owner to postgres;

create table if not exists z_aud_feedbacks
(
    id                 integer,
    data               jsonb,
    created_at         timestamp with time zone,
    updated_at         timestamp with time zone,
    user_id            varchar(255),
    degree_study_right boolean,
    aud_action         text,
    aud_timestamp      timestamp,
    aud_user           text
);

alter table z_aud_feedbacks
    owner to postgres;

create table if not exists z_aud_surveys
(
    id                 integer,
    created_at         timestamp with time zone,
    updated_at         timestamp with time zone,
    feedback_target_id integer,
    question_ids       integer[],
    type               enum_surveys_type,
    type_id            varchar(255),
    aud_action         text,
    aud_timestamp      timestamp,
    aud_user           text
);

alter table z_aud_surveys
    owner to postgres;

create table if not exists z_aud_questions
(
    id             integer,
    data           jsonb,
    created_at     timestamp with time zone,
    updated_at     timestamp with time zone,
    type           varchar(255),
    required       boolean,
    secondary_type varchar(255),
    aud_action     text,
    aud_timestamp  timestamp,
    aud_user       text
);

alter table z_aud_questions
    owner to postgres;

create table if not exists z_aud_course_units
(
    id              varchar(255),
    name            jsonb,
    created_at      timestamp with time zone,
    updated_at      timestamp with time zone,
    course_code     varchar(255),
    validity_period jsonb,
    aud_action      text,
    aud_timestamp   timestamp,
    aud_user        text
);

alter table z_aud_course_units
    owner to postgres;

create table if not exists z_aud_users
(
    id                    varchar(255),
    first_name            varchar(255),
    last_name             varchar(255),
    email                 varchar(255),
    created_at            timestamp with time zone,
    updated_at            timestamp with time zone,
    language              varchar(255),
    username              varchar(255),
    student_number        varchar(255),
    employee_number       varchar(255),
    degree_study_right    boolean,
    secondary_email       varchar(255),
    norppa_feedback_given boolean,
    last_logged_in        timestamp with time zone,
    aud_action            text,
    aud_timestamp         timestamp,
    aud_user              text
);

alter table z_aud_users
    owner to postgres;

create table if not exists z_aud_course_units_organisati
(
    id              integer,
    type            varchar(255),
    course_unit_id  varchar(255),
    organisation_id varchar(255),
    created_at      timestamp with time zone,
    updated_at      timestamp with time zone,
    aud_action      text,
    aud_timestamp   timestamp,
    aud_user        text
);

alter table z_aud_course_units_organisati
    owner to postgres;

create table if not exists z_aud_user_feedback_targets
(
    id                       integer,
    access_status            varchar(255),
    feedback_id              integer,
    user_id                  varchar(255),
    feedback_target_id       integer,
    created_at               timestamp with time zone,
    updated_at               timestamp with time zone,
    feedback_open_email_sent boolean,
    is_administrative_person boolean,
    group_ids                varchar(255)[],
    aud_action               text,
    aud_timestamp            timestamp,
    aud_user                 text
);

alter table z_aud_user_feedback_targets
    owner to postgres;

create table if not exists z_aud_course_realisations_org
(
    id                    integer,
    type                  varchar(255),
    course_realisation_id varchar(255),
    organisation_id       varchar(255),
    created_at            timestamp with time zone,
    updated_at            timestamp with time zone,
    aud_action            text,
    aud_timestamp         timestamp,
    aud_user              text
);

alter table z_aud_course_realisations_org
    owner to postgres;

create table if not exists z_aud_feedback_target_date_ch
(
    id                 integer,
    feedback_target_id integer,
    is_solved          boolean,
    created_at         timestamp with time zone,
    updated_at         timestamp with time zone,
    aud_action         text,
    aud_timestamp      timestamp,
    aud_user           text
);

alter table z_aud_feedback_target_date_ch
    owner to postgres;

create table if not exists z_aud_norppa_feedbacks
(
    id              integer,
    data            jsonb,
    user_id         varchar(255),
    response_wanted boolean,
    created_at      timestamp with time zone,
    updated_at      timestamp with time zone,
    solved          boolean,
    aud_action      text,
    aud_timestamp   timestamp,
    aud_user        text
);

alter table z_aud_norppa_feedbacks
    owner to postgres;

create table if not exists z_aud_organisation_logs
(
    id              integer,
    data            jsonb,
    organisation_id varchar(255),
    user_id         varchar(255),
    created_at      timestamp with time zone,
    updated_at      timestamp with time zone,
    aud_action      text,
    aud_timestamp   timestamp,
    aud_user        text
);

alter table z_aud_organisation_logs
    owner to postgres;

create table if not exists z_aud_feedback_target_logs
(
    id                 integer,
    data               jsonb,
    feedback_target_id integer,
    user_id            varchar(255),
    created_at         timestamp with time zone,
    updated_at         timestamp with time zone,
    aud_action         text,
    aud_timestamp      timestamp,
    aud_user           text
);

alter table z_aud_feedback_target_logs
    owner to postgres;

create table if not exists z_aud_organisations
(
    id                                varchar(255),
    name                              jsonb,
    created_at                        timestamp with time zone,
    updated_at                        timestamp with time zone,
    code                              varchar(255),
    parent_id                         varchar(255),
    student_list_visible              boolean,
    disabled_course_codes             text[],
    responsible_user_id               varchar(255),
    student_list_visible_course_codes text[],
    public_question_ids               integer[],
    aud_action                        text,
    aud_timestamp                     timestamp,
    aud_user                          text
);

alter table z_aud_organisations
    owner to postgres;

create table if not exists z_aud_updater_statuses
(
    id            integer,
    started_at    timestamp with time zone,
    finished_at   timestamp with time zone,
    status        varchar(16),
    job_type      varchar(16),
    aud_action    text,
    aud_timestamp timestamp,
    aud_user      text
);

alter table z_aud_updater_statuses
    owner to postgres;

create table if not exists z_aud_continuous_feedbacks
(
    id                   integer,
    data                 jsonb,
    user_id              varchar(255),
    feedback_target_id   integer,
    created_at           timestamp with time zone,
    updated_at           timestamp with time zone,
    send_in_digest_email boolean,
    response             text,
    response_email_sent  boolean,
    aud_action           text,
    aud_timestamp        timestamp,
    aud_user             text
);

alter table z_aud_continuous_feedbacks
    owner to postgres;

create table if not exists z_aud_summary_customisations
(
    id            integer,
    user_id       varchar(255),
    data          jsonb,
    created_at    timestamp with time zone,
    updated_at    timestamp with time zone,
    aud_action    text,
    aud_timestamp timestamp,
    aud_user      text
);

alter table z_aud_summary_customisations
    owner to postgres;

create table if not exists z_aud_organisation_feedback_c
(
    id              integer,
    user_id         varchar(255),
    organisation_id varchar(255),
    created_at      timestamp with time zone,
    updated_at      timestamp with time zone,
    aud_action      text,
    aud_timestamp   timestamp,
    aud_user        text
);

alter table z_aud_organisation_feedback_c
    owner to postgres;

create table if not exists z_aud_course_realisations_tag
(
    id                    integer,
    course_realisation_id varchar(255),
    tag_id                integer,
    created_at            timestamp with time zone,
    updated_at            timestamp with time zone,
    aud_action            text,
    aud_timestamp         timestamp,
    aud_user              text
);

alter table z_aud_course_realisations_tag
    owner to postgres;

create table if not exists z_aud_tags
(
    id              integer,
    organisation_id varchar(255),
    created_at      timestamp with time zone,
    updated_at      timestamp with time zone,
    name            jsonb,
    aud_action      text,
    aud_timestamp   timestamp,
    aud_user        text
);

alter table z_aud_tags
    owner to postgres;

create table if not exists z_aud_banners
(
    id            integer,
    data          jsonb,
    access_group  enum_banners_access_group,
    start_date    timestamp with time zone,
    end_date      timestamp with time zone,
    created_at    timestamp with time zone,
    updated_at    timestamp with time zone,
    aud_action    text,
    aud_timestamp timestamp,
    aud_user      text
);

alter table z_aud_banners
    owner to postgres;

create table if not exists z_aud_inactive_course_realisa
(
    id                          varchar(255),
    end_date                    timestamp with time zone,
    start_date                  timestamp with time zone,
    name                        jsonb,
    educational_institution_urn varchar(255),
    is_mooc_course              boolean,
    teaching_languages          jsonb,
    manually_enabled            boolean,
    created_at                  timestamp with time zone,
    updated_at                  timestamp with time zone,
    aud_action                  text,
    aud_timestamp               timestamp,
    aud_user                    text
);

alter table z_aud_inactive_course_realisa
    owner to postgres;

create table if not exists z_aud_course_units_tags
(
    id            integer,
    course_code   varchar(255),
    tag_id        integer,
    created_at    timestamp with time zone,
    updated_at    timestamp with time zone,
    aud_action    text,
    aud_timestamp timestamp,
    aud_user      text
);

alter table z_aud_course_units_tags
    owner to postgres;

create table if not exists z_aud_groups
(
    id                 varchar(255),
    feedback_target_id integer,
    name               jsonb,
    created_at         timestamp with time zone,
    updated_at         timestamp with time zone,
    aud_action         text,
    aud_timestamp      timestamp,
    aud_user           text
);

alter table z_aud_groups
    owner to postgres;


create or replace function banners_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_banners (aud_action, aud_timestamp, aud_user, access_group,created_at,data,end_date,id,start_date,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.access_group,OLD.created_at,OLD.data,OLD.end_date,OLD.id,OLD.start_date,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_banners (aud_action, aud_timestamp, aud_user, access_group,created_at,data,end_date,id,start_date,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.access_group,NEW.created_at,NEW.data,NEW.end_date,NEW.id,NEW.start_date,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_banners( aud_action, aud_timestamp, aud_user, access_group,created_at,data,end_date,id,start_date,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.access_group,NEW.created_at,NEW.data,NEW.end_date,NEW.id,NEW.start_date,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function banners_trg_func() owner to postgres;

create trigger banners_trigger
    after insert or update or delete
    on banners
    for each row
execute procedure banners_trg_func();

create or replace function continuous_feedbacks_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_continuous_feedbacks (aud_action, aud_timestamp, aud_user, created_at,data,feedback_target_id,id,response,response_email_sent,send_in_digest_email,updated_at,user_id)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.data,OLD.feedback_target_id,OLD.id,OLD.response,OLD.response_email_sent,OLD.send_in_digest_email,OLD.updated_at,OLD.user_id;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_continuous_feedbacks (aud_action, aud_timestamp, aud_user, created_at,data,feedback_target_id,id,response,response_email_sent,send_in_digest_email,updated_at,user_id)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.feedback_target_id,NEW.id,NEW.response,NEW.response_email_sent,NEW.send_in_digest_email,NEW.updated_at,NEW.user_id;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_continuous_feedbacks( aud_action, aud_timestamp, aud_user, created_at,data,feedback_target_id,id,response,response_email_sent,send_in_digest_email,updated_at,user_id) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.feedback_target_id,NEW.id,NEW.response,NEW.response_email_sent,NEW.send_in_digest_email,NEW.updated_at,NEW.user_id;
                 end if;
                 return null;
                 end;
$$;

alter function continuous_feedbacks_trg_func() owner to postgres;

create trigger continuous_feedbacks_trigger
    after insert or update or delete
    on continuous_feedbacks
    for each row
execute procedure continuous_feedbacks_trg_func();

create or replace function course_realisations_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_course_realisations (aud_action, aud_timestamp, aud_user, created_at,educational_institution_urn,end_date,id,is_mooc_course,name,start_date,teaching_languages,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.educational_institution_urn,OLD.end_date,OLD.id,OLD.is_mooc_course,OLD.name,OLD.start_date,OLD.teaching_languages,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_course_realisations (aud_action, aud_timestamp, aud_user, created_at,educational_institution_urn,end_date,id,is_mooc_course,name,start_date,teaching_languages,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.educational_institution_urn,NEW.end_date,NEW.id,NEW.is_mooc_course,NEW.name,NEW.start_date,NEW.teaching_languages,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_course_realisations( aud_action, aud_timestamp, aud_user, created_at,educational_institution_urn,end_date,id,is_mooc_course,name,start_date,teaching_languages,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.educational_institution_urn,NEW.end_date,NEW.id,NEW.is_mooc_course,NEW.name,NEW.start_date,NEW.teaching_languages,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function course_realisations_trg_func() owner to postgres;

create trigger course_realisations_trigger
    after insert or update or delete
    on course_realisations
    for each row
execute procedure course_realisations_trg_func();

create or replace function course_realisations_orga_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_course_realisations_org (aud_action, aud_timestamp, aud_user, course_realisation_id,created_at,id,organisation_id,type,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.course_realisation_id,OLD.created_at,OLD.id,OLD.organisation_id,OLD.type,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_course_realisations_org (aud_action, aud_timestamp, aud_user, course_realisation_id,created_at,id,organisation_id,type,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.course_realisation_id,NEW.created_at,NEW.id,NEW.organisation_id,NEW.type,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_course_realisations_org( aud_action, aud_timestamp, aud_user, course_realisation_id,created_at,id,organisation_id,type,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.course_realisation_id,NEW.created_at,NEW.id,NEW.organisation_id,NEW.type,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function course_realisations_orga_trg_func() owner to postgres;

create trigger course_realisations_orga_trigger
    after insert or update or delete
    on course_realisations_organisations
    for each row
execute procedure course_realisations_orga_trg_func();

create or replace function course_realisations_tags_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_course_realisations_tag (aud_action, aud_timestamp, aud_user, course_realisation_id,created_at,id,tag_id,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.course_realisation_id,OLD.created_at,OLD.id,OLD.tag_id,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_course_realisations_tag (aud_action, aud_timestamp, aud_user, course_realisation_id,created_at,id,tag_id,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.course_realisation_id,NEW.created_at,NEW.id,NEW.tag_id,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_course_realisations_tag( aud_action, aud_timestamp, aud_user, course_realisation_id,created_at,id,tag_id,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.course_realisation_id,NEW.created_at,NEW.id,NEW.tag_id,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function course_realisations_tags_trg_func() owner to postgres;

create trigger course_realisations_tags_trigger
    after insert or update or delete
    on course_realisations_tags
    for each row
execute procedure course_realisations_tags_trg_func();

create or replace function course_units_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_course_units (aud_action, aud_timestamp, aud_user, course_code,created_at,id,name,updated_at,validity_period)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.course_code,OLD.created_at,OLD.id,OLD.name,OLD.updated_at,OLD.validity_period;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_course_units (aud_action, aud_timestamp, aud_user, course_code,created_at,id,name,updated_at,validity_period)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.course_code,NEW.created_at,NEW.id,NEW.name,NEW.updated_at,NEW.validity_period;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_course_units( aud_action, aud_timestamp, aud_user, course_code,created_at,id,name,updated_at,validity_period) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.course_code,NEW.created_at,NEW.id,NEW.name,NEW.updated_at,NEW.validity_period;
                 end if;
                 return null;
                 end;
$$;

alter function course_units_trg_func() owner to postgres;

create trigger course_units_trigger
    after insert or update or delete
    on course_units
    for each row
execute procedure course_units_trg_func();

create or replace function course_units_organisatio_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_course_units_organisati (aud_action, aud_timestamp, aud_user, course_unit_id,created_at,id,organisation_id,type,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.course_unit_id,OLD.created_at,OLD.id,OLD.organisation_id,OLD.type,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_course_units_organisati (aud_action, aud_timestamp, aud_user, course_unit_id,created_at,id,organisation_id,type,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.course_unit_id,NEW.created_at,NEW.id,NEW.organisation_id,NEW.type,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_course_units_organisati( aud_action, aud_timestamp, aud_user, course_unit_id,created_at,id,organisation_id,type,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.course_unit_id,NEW.created_at,NEW.id,NEW.organisation_id,NEW.type,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function course_units_organisatio_trg_func() owner to postgres;

create trigger course_units_organisatio_trigger
    after insert or update or delete
    on course_units_organisations
    for each row
execute procedure course_units_organisatio_trg_func();

create or replace function course_units_tags_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_course_units_tags (aud_action, aud_timestamp, aud_user, course_code,created_at,id,tag_id,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.course_code,OLD.created_at,OLD.id,OLD.tag_id,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_course_units_tags (aud_action, aud_timestamp, aud_user, course_code,created_at,id,tag_id,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.course_code,NEW.created_at,NEW.id,NEW.tag_id,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_course_units_tags( aud_action, aud_timestamp, aud_user, course_code,created_at,id,tag_id,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.course_code,NEW.created_at,NEW.id,NEW.tag_id,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function course_units_tags_trg_func() owner to postgres;

create trigger course_units_tags_trigger
    after insert or update or delete
    on course_units_tags
    for each row
execute procedure course_units_tags_trg_func();

create or replace function feedback_target_date_che_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_feedback_target_date_ch (aud_action, aud_timestamp, aud_user, created_at,feedback_target_id,id,is_solved,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.feedback_target_id,OLD.id,OLD.is_solved,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_feedback_target_date_ch (aud_action, aud_timestamp, aud_user, created_at,feedback_target_id,id,is_solved,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.feedback_target_id,NEW.id,NEW.is_solved,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_feedback_target_date_ch( aud_action, aud_timestamp, aud_user, created_at,feedback_target_id,id,is_solved,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.feedback_target_id,NEW.id,NEW.is_solved,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function feedback_target_date_che_trg_func() owner to postgres;

create trigger feedback_target_date_che_trigger
    after insert or update or delete
    on feedback_target_date_checks
    for each row
execute procedure feedback_target_date_che_trg_func();

create or replace function feedback_target_logs_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_feedback_target_logs (aud_action, aud_timestamp, aud_user, created_at,data,feedback_target_id,id,updated_at,user_id)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.data,OLD.feedback_target_id,OLD.id,OLD.updated_at,OLD.user_id;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_feedback_target_logs (aud_action, aud_timestamp, aud_user, created_at,data,feedback_target_id,id,updated_at,user_id)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.feedback_target_id,NEW.id,NEW.updated_at,NEW.user_id;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_feedback_target_logs( aud_action, aud_timestamp, aud_user, created_at,data,feedback_target_id,id,updated_at,user_id) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.feedback_target_id,NEW.id,NEW.updated_at,NEW.user_id;
                 end if;
                 return null;
                 end;
$$;

alter function feedback_target_logs_trg_func() owner to postgres;

create trigger feedback_target_logs_trigger
    after insert or update or delete
    on feedback_target_logs
    for each row
execute procedure feedback_target_logs_trg_func();

create or replace function feedback_targets_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_feedback_targets (aud_action, aud_timestamp, aud_user, closes_at,continuous_feedback_enabled,course_realisation_id,course_unit_id,created_at,feedback_count,feedback_dates_edited_by_teacher,feedback_opening_reminder_email_sent,feedback_reminder_last_sent_at,feedback_response,feedback_response_email_sent,feedback_response_reminder_email_sent,feedback_type,feedback_visibility,hidden,hidden_count,id,name,opens_at,public_question_ids,send_continuous_feedback_digest_email,settings_read_by_teacher,type_id,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.closes_at,OLD.continuous_feedback_enabled,OLD.course_realisation_id,OLD.course_unit_id,OLD.created_at,OLD.feedback_count,OLD.feedback_dates_edited_by_teacher,OLD.feedback_opening_reminder_email_sent,OLD.feedback_reminder_last_sent_at,OLD.feedback_response,OLD.feedback_response_email_sent,OLD.feedback_response_reminder_email_sent,OLD.feedback_type,OLD.feedback_visibility,OLD.hidden,OLD.hidden_count,OLD.id,OLD.name,OLD.opens_at,OLD.public_question_ids,OLD.send_continuous_feedback_digest_email,OLD.settings_read_by_teacher,OLD.type_id,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_feedback_targets (aud_action, aud_timestamp, aud_user, closes_at,continuous_feedback_enabled,course_realisation_id,course_unit_id,created_at,feedback_count,feedback_dates_edited_by_teacher,feedback_opening_reminder_email_sent,feedback_reminder_last_sent_at,feedback_response,feedback_response_email_sent,feedback_response_reminder_email_sent,feedback_type,feedback_visibility,hidden,hidden_count,id,name,opens_at,public_question_ids,send_continuous_feedback_digest_email,settings_read_by_teacher,type_id,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.closes_at,NEW.continuous_feedback_enabled,NEW.course_realisation_id,NEW.course_unit_id,NEW.created_at,NEW.feedback_count,NEW.feedback_dates_edited_by_teacher,NEW.feedback_opening_reminder_email_sent,NEW.feedback_reminder_last_sent_at,NEW.feedback_response,NEW.feedback_response_email_sent,NEW.feedback_response_reminder_email_sent,NEW.feedback_type,NEW.feedback_visibility,NEW.hidden,NEW.hidden_count,NEW.id,NEW.name,NEW.opens_at,NEW.public_question_ids,NEW.send_continuous_feedback_digest_email,NEW.settings_read_by_teacher,NEW.type_id,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_feedback_targets( aud_action, aud_timestamp, aud_user, closes_at,continuous_feedback_enabled,course_realisation_id,course_unit_id,created_at,feedback_count,feedback_dates_edited_by_teacher,feedback_opening_reminder_email_sent,feedback_reminder_last_sent_at,feedback_response,feedback_response_email_sent,feedback_response_reminder_email_sent,feedback_type,feedback_visibility,hidden,hidden_count,id,name,opens_at,public_question_ids,send_continuous_feedback_digest_email,settings_read_by_teacher,type_id,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.closes_at,NEW.continuous_feedback_enabled,NEW.course_realisation_id,NEW.course_unit_id,NEW.created_at,NEW.feedback_count,NEW.feedback_dates_edited_by_teacher,NEW.feedback_opening_reminder_email_sent,NEW.feedback_reminder_last_sent_at,NEW.feedback_response,NEW.feedback_response_email_sent,NEW.feedback_response_reminder_email_sent,NEW.feedback_type,NEW.feedback_visibility,NEW.hidden,NEW.hidden_count,NEW.id,NEW.name,NEW.opens_at,NEW.public_question_ids,NEW.send_continuous_feedback_digest_email,NEW.settings_read_by_teacher,NEW.type_id,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function feedback_targets_trg_func() owner to postgres;

create trigger feedback_targets_trigger
    after insert or update or delete
    on feedback_targets
    for each row
execute procedure feedback_targets_trg_func();

create or replace function feedbacks_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_feedbacks (aud_action, aud_timestamp, aud_user, created_at,data,degree_study_right,id,updated_at,user_id)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.data,OLD.degree_study_right,OLD.id,OLD.updated_at,OLD.user_id;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_feedbacks (aud_action, aud_timestamp, aud_user, created_at,data,degree_study_right,id,updated_at,user_id)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.degree_study_right,NEW.id,NEW.updated_at,NEW.user_id;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_feedbacks( aud_action, aud_timestamp, aud_user, created_at,data,degree_study_right,id,updated_at,user_id) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.degree_study_right,NEW.id,NEW.updated_at,NEW.user_id;
                 end if;
                 return null;
                 end;
$$;

alter function feedbacks_trg_func() owner to postgres;

create trigger feedbacks_trigger
    after insert or update or delete
    on feedbacks
    for each row
execute procedure feedbacks_trg_func();

create or replace function groups_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_groups (aud_action, aud_timestamp, aud_user, created_at,feedback_target_id,id,name,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.feedback_target_id,OLD.id,OLD.name,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_groups (aud_action, aud_timestamp, aud_user, created_at,feedback_target_id,id,name,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.feedback_target_id,NEW.id,NEW.name,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_groups( aud_action, aud_timestamp, aud_user, created_at,feedback_target_id,id,name,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.feedback_target_id,NEW.id,NEW.name,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function groups_trg_func() owner to postgres;

create trigger groups_trigger
    after insert or update or delete
    on groups
    for each row
execute procedure groups_trg_func();

create or replace function inactive_course_realisat_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_inactive_course_realisa (aud_action, aud_timestamp, aud_user, created_at,educational_institution_urn,end_date,id,is_mooc_course,manually_enabled,name,start_date,teaching_languages,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.educational_institution_urn,OLD.end_date,OLD.id,OLD.is_mooc_course,OLD.manually_enabled,OLD.name,OLD.start_date,OLD.teaching_languages,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_inactive_course_realisa (aud_action, aud_timestamp, aud_user, created_at,educational_institution_urn,end_date,id,is_mooc_course,manually_enabled,name,start_date,teaching_languages,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.educational_institution_urn,NEW.end_date,NEW.id,NEW.is_mooc_course,NEW.manually_enabled,NEW.name,NEW.start_date,NEW.teaching_languages,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_inactive_course_realisa( aud_action, aud_timestamp, aud_user, created_at,educational_institution_urn,end_date,id,is_mooc_course,manually_enabled,name,start_date,teaching_languages,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.educational_institution_urn,NEW.end_date,NEW.id,NEW.is_mooc_course,NEW.manually_enabled,NEW.name,NEW.start_date,NEW.teaching_languages,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function inactive_course_realisat_trg_func() owner to postgres;

create trigger inactive_course_realisat_trigger
    after insert or update or delete
    on inactive_course_realisations
    for each row
execute procedure inactive_course_realisat_trg_func();

create or replace function norppa_feedbacks_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_norppa_feedbacks (aud_action, aud_timestamp, aud_user, created_at,data,id,response_wanted,solved,updated_at,user_id)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.data,OLD.id,OLD.response_wanted,OLD.solved,OLD.updated_at,OLD.user_id;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_norppa_feedbacks (aud_action, aud_timestamp, aud_user, created_at,data,id,response_wanted,solved,updated_at,user_id)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.id,NEW.response_wanted,NEW.solved,NEW.updated_at,NEW.user_id;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_norppa_feedbacks( aud_action, aud_timestamp, aud_user, created_at,data,id,response_wanted,solved,updated_at,user_id) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.id,NEW.response_wanted,NEW.solved,NEW.updated_at,NEW.user_id;
                 end if;
                 return null;
                 end;
$$;

alter function norppa_feedbacks_trg_func() owner to postgres;

create trigger norppa_feedbacks_trigger
    after insert or update or delete
    on norppa_feedbacks
    for each row
execute procedure norppa_feedbacks_trg_func();

create or replace function organisation_feedback_co_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_organisation_feedback_c (aud_action, aud_timestamp, aud_user, created_at,id,organisation_id,updated_at,user_id)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.id,OLD.organisation_id,OLD.updated_at,OLD.user_id;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_organisation_feedback_c (aud_action, aud_timestamp, aud_user, created_at,id,organisation_id,updated_at,user_id)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.id,NEW.organisation_id,NEW.updated_at,NEW.user_id;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_organisation_feedback_c( aud_action, aud_timestamp, aud_user, created_at,id,organisation_id,updated_at,user_id) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.id,NEW.organisation_id,NEW.updated_at,NEW.user_id;
                 end if;
                 return null;
                 end;
$$;

alter function organisation_feedback_co_trg_func() owner to postgres;

create trigger organisation_feedback_co_trigger
    after insert or update or delete
    on organisation_feedback_correspondents
    for each row
execute procedure organisation_feedback_co_trg_func();

create or replace function organisation_logs_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_organisation_logs (aud_action, aud_timestamp, aud_user, created_at,data,id,organisation_id,updated_at,user_id)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.data,OLD.id,OLD.organisation_id,OLD.updated_at,OLD.user_id;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_organisation_logs (aud_action, aud_timestamp, aud_user, created_at,data,id,organisation_id,updated_at,user_id)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.id,NEW.organisation_id,NEW.updated_at,NEW.user_id;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_organisation_logs( aud_action, aud_timestamp, aud_user, created_at,data,id,organisation_id,updated_at,user_id) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.id,NEW.organisation_id,NEW.updated_at,NEW.user_id;
                 end if;
                 return null;
                 end;
$$;

alter function organisation_logs_trg_func() owner to postgres;

create trigger organisation_logs_trigger
    after insert or update or delete
    on organisation_logs
    for each row
execute procedure organisation_logs_trg_func();

create or replace function organisations_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_organisations (aud_action, aud_timestamp, aud_user, code,created_at,disabled_course_codes,id,name,parent_id,public_question_ids,responsible_user_id,student_list_visible,student_list_visible_course_codes,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.code,OLD.created_at,OLD.disabled_course_codes,OLD.id,OLD.name,OLD.parent_id,OLD.public_question_ids,OLD.responsible_user_id,OLD.student_list_visible,OLD.student_list_visible_course_codes,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_organisations (aud_action, aud_timestamp, aud_user, code,created_at,disabled_course_codes,id,name,parent_id,public_question_ids,responsible_user_id,student_list_visible,student_list_visible_course_codes,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.code,NEW.created_at,NEW.disabled_course_codes,NEW.id,NEW.name,NEW.parent_id,NEW.public_question_ids,NEW.responsible_user_id,NEW.student_list_visible,NEW.student_list_visible_course_codes,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_organisations( aud_action, aud_timestamp, aud_user, code,created_at,disabled_course_codes,id,name,parent_id,public_question_ids,responsible_user_id,student_list_visible,student_list_visible_course_codes,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.code,NEW.created_at,NEW.disabled_course_codes,NEW.id,NEW.name,NEW.parent_id,NEW.public_question_ids,NEW.responsible_user_id,NEW.student_list_visible,NEW.student_list_visible_course_codes,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function organisations_trg_func() owner to postgres;

create trigger organisations_trigger
    after insert or update or delete
    on organisations
    for each row
execute procedure organisations_trg_func();

create or replace function questions_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_questions (aud_action, aud_timestamp, aud_user, created_at,data,id,required,secondary_type,type,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.data,OLD.id,OLD.required,OLD.secondary_type,OLD.type,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_questions (aud_action, aud_timestamp, aud_user, created_at,data,id,required,secondary_type,type,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.id,NEW.required,NEW.secondary_type,NEW.type,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_questions( aud_action, aud_timestamp, aud_user, created_at,data,id,required,secondary_type,type,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.id,NEW.required,NEW.secondary_type,NEW.type,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function questions_trg_func() owner to postgres;

create trigger questions_trigger
    after insert or update or delete
    on questions
    for each row
execute procedure questions_trg_func();

create or replace function summary_customisations_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_summary_customisations (aud_action, aud_timestamp, aud_user, created_at,data,id,updated_at,user_id)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.data,OLD.id,OLD.updated_at,OLD.user_id;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_summary_customisations (aud_action, aud_timestamp, aud_user, created_at,data,id,updated_at,user_id)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.id,NEW.updated_at,NEW.user_id;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_summary_customisations( aud_action, aud_timestamp, aud_user, created_at,data,id,updated_at,user_id) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.data,NEW.id,NEW.updated_at,NEW.user_id;
                 end if;
                 return null;
                 end;
$$;

alter function summary_customisations_trg_func() owner to postgres;

create trigger summary_customisations_trigger
    after insert or update or delete
    on summary_customisations
    for each row
execute procedure summary_customisations_trg_func();

create or replace function surveys_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_surveys (aud_action, aud_timestamp, aud_user, created_at,feedback_target_id,id,question_ids,type,type_id,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.feedback_target_id,OLD.id,OLD.question_ids,OLD.type,OLD.type_id,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_surveys (aud_action, aud_timestamp, aud_user, created_at,feedback_target_id,id,question_ids,type,type_id,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.feedback_target_id,NEW.id,NEW.question_ids,NEW.type,NEW.type_id,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_surveys( aud_action, aud_timestamp, aud_user, created_at,feedback_target_id,id,question_ids,type,type_id,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.feedback_target_id,NEW.id,NEW.question_ids,NEW.type,NEW.type_id,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function surveys_trg_func() owner to postgres;

create trigger surveys_trigger
    after insert or update or delete
    on surveys
    for each row
execute procedure surveys_trg_func();

create or replace function tags_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_tags (aud_action, aud_timestamp, aud_user, created_at,id,name,organisation_id,updated_at)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.id,OLD.name,OLD.organisation_id,OLD.updated_at;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_tags (aud_action, aud_timestamp, aud_user, created_at,id,name,organisation_id,updated_at)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.id,NEW.name,NEW.organisation_id,NEW.updated_at;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_tags( aud_action, aud_timestamp, aud_user, created_at,id,name,organisation_id,updated_at) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.id,NEW.name,NEW.organisation_id,NEW.updated_at;
                 end if;
                 return null;
                 end;
$$;

alter function tags_trg_func() owner to postgres;

create trigger tags_trigger
    after insert or update or delete
    on tags
    for each row
execute procedure tags_trg_func();

create or replace function updater_statuses_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_updater_statuses (aud_action, aud_timestamp, aud_user, finished_at,id,job_type,started_at,status)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.finished_at,OLD.id,OLD.job_type,OLD.started_at,OLD.status;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_updater_statuses (aud_action, aud_timestamp, aud_user, finished_at,id,job_type,started_at,status)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.finished_at,NEW.id,NEW.job_type,NEW.started_at,NEW.status;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_updater_statuses( aud_action, aud_timestamp, aud_user, finished_at,id,job_type,started_at,status) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.finished_at,NEW.id,NEW.job_type,NEW.started_at,NEW.status;
                 end if;
                 return null;
                 end;
$$;

alter function updater_statuses_trg_func() owner to postgres;

create trigger updater_statuses_trigger
    after insert or update or delete
    on updater_statuses
    for each row
execute procedure updater_statuses_trg_func();

create or replace function user_feedback_targets_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_user_feedback_targets (aud_action, aud_timestamp, aud_user, access_status,created_at,feedback_id,feedback_open_email_sent,feedback_target_id,group_ids,id,is_administrative_person,updated_at,user_id)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.access_status,OLD.created_at,OLD.feedback_id,OLD.feedback_open_email_sent,OLD.feedback_target_id,OLD.group_ids,OLD.id,OLD.is_administrative_person,OLD.updated_at,OLD.user_id;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_user_feedback_targets (aud_action, aud_timestamp, aud_user, access_status,created_at,feedback_id,feedback_open_email_sent,feedback_target_id,group_ids,id,is_administrative_person,updated_at,user_id)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.access_status,NEW.created_at,NEW.feedback_id,NEW.feedback_open_email_sent,NEW.feedback_target_id,NEW.group_ids,NEW.id,NEW.is_administrative_person,NEW.updated_at,NEW.user_id;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_user_feedback_targets( aud_action, aud_timestamp, aud_user, access_status,created_at,feedback_id,feedback_open_email_sent,feedback_target_id,group_ids,id,is_administrative_person,updated_at,user_id) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.access_status,NEW.created_at,NEW.feedback_id,NEW.feedback_open_email_sent,NEW.feedback_target_id,NEW.group_ids,NEW.id,NEW.is_administrative_person,NEW.updated_at,NEW.user_id;
                 end if;
                 return null;
                 end;
$$;

alter function user_feedback_targets_trg_func() owner to postgres;

create trigger user_feedback_targets_trigger
    after insert or update or delete
    on user_feedback_targets
    for each row
execute procedure user_feedback_targets_trg_func();

create or replace function users_trg_func() returns trigger
    language plpgsql
as
$$
begin
                 if (TG_OP = 'DELETE') THEN
                 insert into z_aud_users (aud_action, aud_timestamp, aud_user, created_at,degree_study_right,email,employee_number,first_name,id,language,last_logged_in,last_name,norppa_feedback_given,secondary_email,student_number,updated_at,username)  SELECT 'DELETE' as aud_action, now() as aud_timestamp, user as aud_user, OLD.created_at,OLD.degree_study_right,OLD.email,OLD.employee_number,OLD.first_name,OLD.id,OLD.language,OLD.last_logged_in,OLD.last_name,OLD.norppa_feedback_given,OLD.secondary_email,OLD.student_number,OLD.updated_at,OLD.username;
                 elsif (TG_OP = 'UPDATE') THEN
                 insert into z_aud_users (aud_action, aud_timestamp, aud_user, created_at,degree_study_right,email,employee_number,first_name,id,language,last_logged_in,last_name,norppa_feedback_given,secondary_email,student_number,updated_at,username)  SELECT 'UPDATE'  as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.degree_study_right,NEW.email,NEW.employee_number,NEW.first_name,NEW.id,NEW.language,NEW.last_logged_in,NEW.last_name,NEW.norppa_feedback_given,NEW.secondary_email,NEW.student_number,NEW.updated_at,NEW.username;
                 elsif (TG_OP = 'INSERT') THEN
                 insert into z_aud_users( aud_action, aud_timestamp, aud_user, created_at,degree_study_right,email,employee_number,first_name,id,language,last_logged_in,last_name,norppa_feedback_given,secondary_email,student_number,updated_at,username) SELECT 'INSERT' as aud_action, now() as aud_timestamp, user as aud_user, NEW.created_at,NEW.degree_study_right,NEW.email,NEW.employee_number,NEW.first_name,NEW.id,NEW.language,NEW.last_logged_in,NEW.last_name,NEW.norppa_feedback_given,NEW.secondary_email,NEW.student_number,NEW.updated_at,NEW.username;
                 end if;
                 return null;
                 end;
$$;

alter function users_trg_func() owner to postgres;

create trigger users_trigger
    after insert or update or delete
    on users
    for each row
execute procedure users_trg_func();

