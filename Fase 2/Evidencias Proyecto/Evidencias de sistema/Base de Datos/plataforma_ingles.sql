--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 17.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _heroku; Type: SCHEMA; Schema: -; Owner: heroku_admin
--

CREATE SCHEMA _heroku;


ALTER SCHEMA _heroku OWNER TO heroku_admin;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: u4s6v2ba7opms1
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO u4s6v2ba7opms1;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: u4s6v2ba7opms1
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: create_ext(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.create_ext() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

  schemaname TEXT;
  databaseowner TEXT;

  r RECORD;

BEGIN

  IF tg_tag = 'CREATE EXTENSION' and current_user != 'rds_superuser' THEN
    FOR r IN SELECT * FROM pg_event_trigger_ddl_commands()
    LOOP
        CONTINUE WHEN r.command_tag != 'CREATE EXTENSION' OR r.object_type != 'extension';

        schemaname = (
            SELECT n.nspname
            FROM pg_catalog.pg_extension AS e
            INNER JOIN pg_catalog.pg_namespace AS n
            ON e.extnamespace = n.oid
            WHERE e.oid = r.objid
        );

        databaseowner = (
            SELECT pg_catalog.pg_get_userbyid(d.datdba)
            FROM pg_catalog.pg_database d
            WHERE d.datname = current_database()
        );
        --RAISE NOTICE 'Record for event trigger %, objid: %,tag: %, current_user: %, schema: %, database_owenr: %', r.object_identity, r.objid, tg_tag, current_user, schemaname, databaseowner;
        IF r.object_identity = 'address_standardizer_data_us' THEN
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'us_gaz');
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'us_lex');
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'us_rules');
        ELSIF r.object_identity = 'amcheck' THEN
            EXECUTE format('GRANT EXECUTE ON FUNCTION %I.bt_index_check TO %I;', schemaname, databaseowner);
            EXECUTE format('GRANT EXECUTE ON FUNCTION %I.bt_index_parent_check TO %I;', schemaname, databaseowner);
        ELSIF r.object_identity = 'dict_int' THEN
            EXECUTE format('ALTER TEXT SEARCH DICTIONARY %I.intdict OWNER TO %I;', schemaname, databaseowner);
        ELSIF r.object_identity = 'pg_partman' THEN
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'part_config');
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'part_config_sub');
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'custom_time_partitions');
        ELSIF r.object_identity = 'pg_stat_statements' THEN
            EXECUTE format('GRANT EXECUTE ON FUNCTION %I.pg_stat_statements_reset TO %I;', schemaname, databaseowner);
        ELSIF r.object_identity = 'postgis' THEN
            PERFORM _heroku.postgis_after_create();
        ELSIF r.object_identity = 'postgis_raster' THEN
            PERFORM _heroku.postgis_after_create();
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT', databaseowner, 'raster_columns');
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT', databaseowner, 'raster_overviews');
        ELSIF r.object_identity = 'postgis_topology' THEN
            PERFORM _heroku.postgis_after_create();
            EXECUTE format('GRANT USAGE ON SCHEMA topology TO %I;', databaseowner);
            EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA topology TO %I;', databaseowner);
            PERFORM _heroku.grant_table_if_exists('topology', 'SELECT, UPDATE, INSERT, DELETE', databaseowner);
            EXECUTE format('GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA topology TO %I;', databaseowner);
        ELSIF r.object_identity = 'postgis_tiger_geocoder' THEN
            PERFORM _heroku.postgis_after_create();
            EXECUTE format('GRANT USAGE ON SCHEMA tiger TO %I;', databaseowner);
            EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA tiger TO %I;', databaseowner);
            PERFORM _heroku.grant_table_if_exists('tiger', 'SELECT, UPDATE, INSERT, DELETE', databaseowner);

            EXECUTE format('GRANT USAGE ON SCHEMA tiger_data TO %I;', databaseowner);
            EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA tiger_data TO %I;', databaseowner);
            PERFORM _heroku.grant_table_if_exists('tiger_data', 'SELECT, UPDATE, INSERT, DELETE', databaseowner);
        END IF;
    END LOOP;
  END IF;
END;
$$;


ALTER FUNCTION _heroku.create_ext() OWNER TO heroku_admin;

--
-- Name: drop_ext(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.drop_ext() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

  schemaname TEXT;
  databaseowner TEXT;

  r RECORD;

BEGIN

  IF tg_tag = 'DROP EXTENSION' and current_user != 'rds_superuser' THEN
    FOR r IN SELECT * FROM pg_event_trigger_dropped_objects()
    LOOP
      CONTINUE WHEN r.object_type != 'extension';

      databaseowner = (
            SELECT pg_catalog.pg_get_userbyid(d.datdba)
            FROM pg_catalog.pg_database d
            WHERE d.datname = current_database()
      );

      --RAISE NOTICE 'Record for event trigger %, objid: %,tag: %, current_user: %, database_owner: %, schemaname: %', r.object_identity, r.objid, tg_tag, current_user, databaseowner, r.schema_name;

      IF r.object_identity = 'postgis_topology' THEN
          EXECUTE format('DROP SCHEMA IF EXISTS topology');
      END IF;
    END LOOP;

  END IF;
END;
$$;


ALTER FUNCTION _heroku.drop_ext() OWNER TO heroku_admin;

--
-- Name: extension_before_drop(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.extension_before_drop() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

  query TEXT;

BEGIN
  query = (SELECT current_query());

  -- RAISE NOTICE 'executing extension_before_drop: tg_event: %, tg_tag: %, current_user: %, session_user: %, query: %', tg_event, tg_tag, current_user, session_user, query;
  IF tg_tag = 'DROP EXTENSION' and not pg_has_role(session_user, 'rds_superuser', 'MEMBER') THEN
    -- DROP EXTENSION [ IF EXISTS ] name [, ...] [ CASCADE | RESTRICT ]
    IF (regexp_match(query, 'DROP\s+EXTENSION\s+(IF\s+EXISTS)?.*(plpgsql)', 'i') IS NOT NULL) THEN
      RAISE EXCEPTION 'The plpgsql extension is required for database management and cannot be dropped.';
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION _heroku.extension_before_drop() OWNER TO heroku_admin;

--
-- Name: grant_table_if_exists(text, text, text, text); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.grant_table_if_exists(alias_schemaname text, grants text, databaseowner text, alias_tablename text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

  IF alias_tablename IS NULL THEN
    EXECUTE format('GRANT %s ON ALL TABLES IN SCHEMA %I TO %I;', grants, alias_schemaname, databaseowner);
  ELSE
    IF EXISTS (SELECT 1 FROM pg_tables WHERE pg_tables.schemaname = alias_schemaname AND pg_tables.tablename = alias_tablename) THEN
      EXECUTE format('GRANT %s ON TABLE %I.%I TO %I;', grants, alias_schemaname, alias_tablename, databaseowner);
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION _heroku.grant_table_if_exists(alias_schemaname text, grants text, databaseowner text, alias_tablename text) OWNER TO heroku_admin;

--
-- Name: postgis_after_create(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.postgis_after_create() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    schemaname TEXT;
    databaseowner TEXT;
BEGIN
    schemaname = (
        SELECT n.nspname
        FROM pg_catalog.pg_extension AS e
        INNER JOIN pg_catalog.pg_namespace AS n ON e.extnamespace = n.oid
        WHERE e.extname = 'postgis'
    );
    databaseowner = (
        SELECT pg_catalog.pg_get_userbyid(d.datdba)
        FROM pg_catalog.pg_database d
        WHERE d.datname = current_database()
    );

    EXECUTE format('GRANT EXECUTE ON FUNCTION %I.st_tileenvelope TO %I;', schemaname, databaseowner);
    EXECUTE format('GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE %I.spatial_ref_sys TO %I;', schemaname, databaseowner);
END;
$$;


ALTER FUNCTION _heroku.postgis_after_create() OWNER TO heroku_admin;

--
-- Name: validate_extension(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.validate_extension() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

  schemaname TEXT;
  r RECORD;

BEGIN

  IF tg_tag = 'CREATE EXTENSION' and current_user != 'rds_superuser' THEN
    FOR r IN SELECT * FROM pg_event_trigger_ddl_commands()
    LOOP
      CONTINUE WHEN r.command_tag != 'CREATE EXTENSION' OR r.object_type != 'extension';

      schemaname = (
        SELECT n.nspname
        FROM pg_catalog.pg_extension AS e
        INNER JOIN pg_catalog.pg_namespace AS n
        ON e.extnamespace = n.oid
        WHERE e.oid = r.objid
      );

      IF schemaname = '_heroku' THEN
        RAISE EXCEPTION 'Creating extensions in the _heroku schema is not allowed';
      END IF;
    END LOOP;
  END IF;
END;
$$;


ALTER FUNCTION _heroku.validate_extension() OWNER TO heroku_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Pagina_Web_Ingles_quiz; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public."Pagina_Web_Ingles_quiz" (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    level character varying(20) NOT NULL,
    number_of_questions integer NOT NULL,
    "time" integer NOT NULL,
    required_score_to_pass integer NOT NULL,
    difficulty character varying(10) NOT NULL,
    allowed_attempts integer NOT NULL,
    is_active boolean NOT NULL
);


ALTER TABLE public."Pagina_Web_Ingles_quiz" OWNER TO u4s6v2ba7opms1;

--
-- Name: Pagina_Web_Ingles_quiz_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public."Pagina_Web_Ingles_quiz" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Pagina_Web_Ingles_quiz_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO u4s6v2ba7opms1;

--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.auth_group ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO u4s6v2ba7opms1;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.auth_group_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO u4s6v2ba7opms1;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.auth_permission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id bigint NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


ALTER TABLE public.django_admin_log OWNER TO u4s6v2ba7opms1;

--
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.django_admin_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO u4s6v2ba7opms1;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.django_content_type ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO u4s6v2ba7opms1;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.django_migrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_session; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO u4s6v2ba7opms1;

--
-- Name: questions_answer; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.questions_answer (
    id bigint NOT NULL,
    text character varying(200) NOT NULL,
    correct boolean NOT NULL,
    created date NOT NULL,
    question_id bigint NOT NULL
);


ALTER TABLE public.questions_answer OWNER TO u4s6v2ba7opms1;

--
-- Name: questions_answer_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.questions_answer ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.questions_answer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: questions_question; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.questions_question (
    id bigint NOT NULL,
    text character varying(200) NOT NULL,
    created date NOT NULL,
    quiz_id bigint NOT NULL
);


ALTER TABLE public.questions_question OWNER TO u4s6v2ba7opms1;

--
-- Name: questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.questions_question ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.questions_question_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: results_result; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.results_result (
    id bigint NOT NULL,
    score double precision NOT NULL,
    quiz_id bigint NOT NULL,
    user_id bigint NOT NULL,
    attempt_number integer NOT NULL,
    created timestamp with time zone NOT NULL
);


ALTER TABLE public.results_result OWNER TO u4s6v2ba7opms1;

--
-- Name: results_result_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.results_result ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.results_result_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_customuser; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.users_customuser (
    id bigint NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(150) NOT NULL,
    last_name character varying(150) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL,
    email character varying(254) NOT NULL,
    description text NOT NULL,
    role character varying(50) NOT NULL
);


ALTER TABLE public.users_customuser OWNER TO u4s6v2ba7opms1;

--
-- Name: users_customuser_groups; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.users_customuser_groups (
    id bigint NOT NULL,
    customuser_id bigint NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.users_customuser_groups OWNER TO u4s6v2ba7opms1;

--
-- Name: users_customuser_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.users_customuser_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_customuser_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_customuser_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.users_customuser ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_customuser_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_customuser_user_permissions; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.users_customuser_user_permissions (
    id bigint NOT NULL,
    customuser_id bigint NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.users_customuser_user_permissions OWNER TO u4s6v2ba7opms1;

--
-- Name: users_customuser_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.users_customuser_user_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_customuser_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_section; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.users_section (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    is_active boolean NOT NULL
);


ALTER TABLE public.users_section OWNER TO u4s6v2ba7opms1;

--
-- Name: users_section_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.users_section ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_section_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_studentprofile; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.users_studentprofile (
    id bigint NOT NULL,
    student_id integer,
    section_id bigint,
    user_id bigint NOT NULL
);


ALTER TABLE public.users_studentprofile OWNER TO u4s6v2ba7opms1;

--
-- Name: users_studentprofile_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.users_studentprofile ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_studentprofile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_teacherprofile; Type: TABLE; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE TABLE public.users_teacherprofile (
    id bigint NOT NULL,
    teacher_id integer,
    user_id bigint NOT NULL
);


ALTER TABLE public.users_teacherprofile OWNER TO u4s6v2ba7opms1;

--
-- Name: users_teacherprofile_id_seq; Type: SEQUENCE; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE public.users_teacherprofile ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_teacherprofile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: Pagina_Web_Ingles_quiz; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public."Pagina_Web_Ingles_quiz" (id, name, level, number_of_questions, "time", required_score_to_pass, difficulty, allowed_attempts, is_active) FROM stdin;
1	Pronombres	basico	10	2	60	medio	3	t
4	Preposiciones	basico	10	2	60	dificil	3	t
2	Artículos	basico	10	2	60	medio	3	t
5	Pronombre indefinido	elemental	7	2	60	dificil	3	t
6	nuevo_Quiz	basico	6	3	60	facil	3	t
\.


--
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add user	1	add_customuser
2	Can change user	1	change_customuser
3	Can delete user	1	delete_customuser
4	Can view user	1	view_customuser
5	Can add student	2	add_student
6	Can change student	2	change_student
7	Can delete student	2	delete_student
8	Can view student	2	view_student
9	Can add teacher	3	add_teacher
10	Can change teacher	3	change_teacher
11	Can delete teacher	3	delete_teacher
12	Can view teacher	3	view_teacher
13	Can add Sección	4	add_section
14	Can change Sección	4	change_section
15	Can delete Sección	4	delete_section
16	Can view Sección	4	view_section
17	Can add Perfil de Estudiante	5	add_studentprofile
18	Can change Perfil de Estudiante	5	change_studentprofile
19	Can delete Perfil de Estudiante	5	delete_studentprofile
20	Can view Perfil de Estudiante	5	view_studentprofile
21	Can add teacher profile	6	add_teacherprofile
22	Can change teacher profile	6	change_teacherprofile
23	Can delete teacher profile	6	delete_teacherprofile
24	Can view teacher profile	6	view_teacherprofile
25	Can add log entry	7	add_logentry
26	Can change log entry	7	change_logentry
27	Can delete log entry	7	delete_logentry
28	Can view log entry	7	view_logentry
29	Can add permission	8	add_permission
30	Can change permission	8	change_permission
31	Can delete permission	8	delete_permission
32	Can view permission	8	view_permission
33	Can add group	9	add_group
34	Can change group	9	change_group
35	Can delete group	9	delete_group
36	Can view group	9	view_group
37	Can add content type	10	add_contenttype
38	Can change content type	10	change_contenttype
39	Can delete content type	10	delete_contenttype
40	Can view content type	10	view_contenttype
41	Can add session	11	add_session
42	Can change session	11	change_session
43	Can delete session	11	delete_session
44	Can view session	11	view_session
45	Can add quiz	12	add_quiz
46	Can change quiz	12	change_quiz
47	Can delete quiz	12	delete_quiz
48	Can view quiz	12	view_quiz
49	Can add question	13	add_question
50	Can change question	13	change_question
51	Can delete question	13	delete_question
52	Can view question	13	view_question
53	Can add answer	14	add_answer
54	Can change answer	14	change_answer
55	Can delete answer	14	delete_answer
56	Can view answer	14	view_answer
57	Can add result	15	add_result
58	Can change result	15	change_result
59	Can delete result	15	delete_result
60	Can view result	15	view_result
\.


--
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
1	2024-12-12 15:37:50.587759+00	2	Felipe	3		1	1
2	2024-12-12 17:10:03.352162+00	4	profesor_test	2	[]	1	1
3	2024-12-12 17:11:11.774156+00	4	profesor_test	3		1	1
4	2024-12-12 17:11:47.617028+00	5	profesor.test	1	[{"added": {}}]	1	1
5	2024-12-12 17:12:05.469858+00	5	profesor.test	2	[{"changed": {"fields": ["Email", "Role"]}}]	1	1
34	2024-12-14 17:07:23.211417+00	1	Prononmbres-basic	1	[{"added": {}}]	12	1
35	2024-12-14 17:07:54.696996+00	1	Where is David? ____ is at home.	1	[{"added": {}}, {"added": {"name": "answer", "object": "question: Where is David? ____ is at home., answer: His, correct: True"}}, {"added": {"name": "answer", "object": "question: Where is David? ____ is at home., answer: She, correct: False"}}, {"added": {"name": "answer", "object": "question: Where is David? ____ is at home., answer: He, correct: False"}}, {"added": {"name": "answer", "object": "question: Where is David? ____ is at home., answer: Him, correct: False"}}]	13	1
36	2024-12-14 17:08:26.895439+00	1	Pronouns-basic	2	[{"changed": {"fields": ["Name"]}}]	12	1
37	2024-12-14 17:08:54.858093+00	2	Can you help ____?	1	[{"added": {}}, {"added": {"name": "answer", "object": "question: Can you help ____?, answer: me, correct: True"}}, {"added": {"name": "answer", "object": "question: Can you help ____?, answer: I, correct: False"}}, {"added": {"name": "answer", "object": "question: Can you help ____?, answer: we, correct: False"}}, {"added": {"name": "answer", "object": "question: Can you help ____?, answer: they, correct: False"}}]	13	1
38	2024-12-14 17:09:24.365271+00	3	Where is the book? ____ is on the table.	1	[{"added": {}}, {"added": {"name": "answer", "object": "question: Where is the book? ____ is on the table., answer: He, correct: False"}}, {"added": {"name": "answer", "object": "question: Where is the book? ____ is on the table., answer: It, correct: True"}}, {"added": {"name": "answer", "object": "question: Where is the book? ____ is on the table., answer: She, correct: False"}}, {"added": {"name": "answer", "object": "question: Where is the book? ____ is on the table., answer: --, correct: False"}}]	13	1
39	2024-12-14 17:09:41.7306+00	4	____ house is blue.	1	[{"added": {}}, {"added": {"name": "answer", "object": "question: ____ house is blue., answer: You, correct: False"}}, {"added": {"name": "answer", "object": "question: ____ house is blue., answer: It, correct: False"}}, {"added": {"name": "answer", "object": "question: ____ house is blue., answer: Yours, correct: False"}}, {"added": {"name": "answer", "object": "question: ____ house is blue., answer: Your, correct: False"}}]	13	1
40	2024-12-14 17:10:13.390903+00	5	These seats are ____.	1	[{"added": {}}, {"added": {"name": "answer", "object": "question: These seats are ____., answer: theirs, correct: True"}}, {"added": {"name": "answer", "object": "question: These seats are ____., answer: them, correct: False"}}, {"added": {"name": "answer", "object": "question: These seats are ____., answer: they, correct: False"}}, {"added": {"name": "answer", "object": "question: These seats are ____., answer: their, correct: False"}}]	13	1
41	2024-12-14 17:10:22.698404+00	4	____ house is blue.	2	[{"changed": {"name": "answer", "object": "question: ____ house is blue., answer: Your, correct: True", "fields": ["Correct"]}}]	13	1
42	2024-12-14 17:10:58.15728+00	6	Whose bike is it? It is ____.	1	[{"added": {}}, {"added": {"name": "answer", "object": "question: Whose bike is it? It is ____., answer: Sarah, correct: False"}}, {"added": {"name": "answer", "object": "question: Whose bike is it? It is ____., answer: she, correct: False"}}, {"added": {"name": "answer", "object": "question: Whose bike is it? It is ____., answer: Sarah's, correct: True"}}, {"added": {"name": "answer", "object": "question: Whose bike is it? It is ____., answer: of Sarah, correct: False"}}]	13	1
43	2024-12-14 17:11:11.898706+00	7	I like ____ book.	1	[{"added": {}}, {"added": {"name": "answer", "object": "question: I like ____ book., answer: this, correct: False"}}, {"added": {"name": "answer", "object": "question: I like ____ book., answer: those, correct: False"}}, {"added": {"name": "answer", "object": "question: I like ____ book., answer: these, correct: False"}}, {"added": {"name": "answer", "object": "question: I like ____ book., answer: --, correct: False"}}]	13	1
44	2024-12-14 17:11:27.590504+00	8	____ seats are ours.	1	[{"added": {}}, {"added": {"name": "answer", "object": "question: ____ seats are ours., answer: That, correct: False"}}, {"added": {"name": "answer", "object": "question: ____ seats are ours., answer: This, correct: False"}}, {"added": {"name": "answer", "object": "question: ____ seats are ours., answer: --, correct: False"}}, {"added": {"name": "answer", "object": "question: ____ seats are ours., answer: Those, correct: False"}}]	13	1
45	2024-12-14 17:11:55.681344+00	9	Did you paint the house? Yes, we painted the house ____.	1	[{"added": {}}, {"added": {"name": "answer", "object": "question: Did you paint the house? Yes, we painted the house ____., answer: yourselves, correct: False"}}, {"added": {"name": "answer", "object": "question: Did you paint the house? Yes, we painted the house ____., answer: ourselves, correct: True"}}, {"added": {"name": "answer", "object": "question: Did you paint the house? Yes, we painted the house ____., answer: ourself, correct: False"}}, {"added": {"name": "answer", "object": "question: Did you paint the house? Yes, we painted the house ____., answer: itself, correct: False"}}]	13	1
46	2024-12-14 17:12:18.664413+00	10	Alice and Paul see ____ everyday.	1	[{"added": {}}, {"added": {"name": "answer", "object": "question: Alice and Paul see ____ everyday., answer: themselves, correct: True"}}, {"added": {"name": "answer", "object": "question: Alice and Paul see ____ everyday., answer: themself, correct: False"}}, {"added": {"name": "answer", "object": "question: Alice and Paul see ____ everyday., answer: yourselves, correct: False"}}, {"added": {"name": "answer", "object": "question: Alice and Paul see ____ everyday., answer: each other, correct: False"}}]	13	1
47	2024-12-14 17:12:32.542722+00	8	____ seats are ours.	2	[{"changed": {"name": "answer", "object": "question: ____ seats are ours., answer: Those, correct: True", "fields": ["Correct"]}}]	13	1
48	2024-12-14 17:12:42.86961+00	7	I like ____ book.	2	[{"changed": {"name": "answer", "object": "question: I like ____ book., answer: this, correct: True", "fields": ["Correct"]}}]	13	1
49	2024-12-14 17:12:46.512158+00	6	Whose bike is it? It is ____.	2	[]	13	1
50	2024-12-14 17:12:49.943399+00	5	These seats are ____.	2	[]	13	1
51	2024-12-15 22:46:51.633762+00	21	New York is the largest city ____ the United States.	2	[]	13	1
52	2024-12-15 23:02:18.260292+00	67	alumno1.prueba	2	[{"changed": {"fields": ["Username", "First name", "Last name", "Email"]}}]	1	1
53	2024-12-15 23:02:37.128266+00	67	alumno1.prueba	2	[{"changed": {"fields": ["password"]}}]	1	1
54	2024-12-15 23:03:15.812587+00	67	alumno1.prueba	2	[]	1	1
55	2024-12-15 23:04:30.470581+00	67	alumno1.prueba	2	[{"changed": {"fields": ["password"]}}]	1	1
56	2024-12-15 23:04:36.194199+00	67	alumno1.prueba	2	[]	1	1
57	2024-12-15 23:05:23.814609+00	67	alumno1.prueba - INU2101 - 002D	2	[{"changed": {"fields": ["Section"]}}]	5	1
58	2024-12-15 23:05:37.650518+00	67	alumno1.prueba	3		1	1
59	2024-12-15 23:06:59.533751+00	68	alumno1.test@duocuc.cl	1	[{"added": {}}]	1	1
60	2024-12-15 23:07:16.489392+00	68	alumno1.test@duocuc.cl	2	[{"changed": {"fields": ["Email", "Role"]}}]	1	1
61	2024-12-15 23:07:29.603806+00	68	alumno1.test	2	[{"changed": {"fields": ["Username"]}}]	1	1
62	2024-12-15 23:19:12.81115+00	68	alumno1.test - INI3111 - 001D	1	[{"added": {}}]	5	1
63	2024-12-15 23:27:45.339806+00	5	These seats are ____.	2	[]	13	1
64	2024-12-15 23:41:59.3913+00	5	Pronombre indefinido-elemental	1	[{"added": {}}]	12	1
\.


--
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	users	customuser
2	users	student
3	users	teacher
4	users	section
5	users	studentprofile
6	users	teacherprofile
7	admin	logentry
8	auth	permission
9	auth	group
10	contenttypes	contenttype
11	sessions	session
12	Pagina_Web_Ingles	quiz
13	questions	question
14	questions	answer
15	results	result
\.


--
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2024-12-11 03:21:56.586628+00
2	contenttypes	0002_remove_content_type_name	2024-12-11 03:21:56.594627+00
3	auth	0001_initial	2024-12-11 03:21:56.660009+00
4	auth	0002_alter_permission_name_max_length	2024-12-11 03:21:56.666085+00
5	auth	0003_alter_user_email_max_length	2024-12-11 03:21:56.671669+00
6	auth	0004_alter_user_username_opts	2024-12-11 03:21:56.677473+00
7	auth	0005_alter_user_last_login_null	2024-12-11 03:21:56.683023+00
8	auth	0006_require_contenttypes_0002	2024-12-11 03:21:56.68589+00
9	auth	0007_alter_validators_add_error_messages	2024-12-11 03:21:56.691472+00
10	auth	0008_alter_user_username_max_length	2024-12-11 03:21:56.697001+00
11	auth	0009_alter_user_last_name_max_length	2024-12-11 03:21:56.702462+00
12	auth	0010_alter_group_name_max_length	2024-12-11 03:21:56.71002+00
13	auth	0011_update_proxy_permissions	2024-12-11 03:21:56.71718+00
14	auth	0012_alter_user_first_name_max_length	2024-12-11 03:21:56.72288+00
15	users	0001_initial	2024-12-11 03:21:56.927145+00
16	users	0002_remove_section_created_by	2024-12-11 03:21:56.949888+00
17	Pagina_Web_Ingles	0001_initial	2024-12-11 03:21:57.029558+00
18	admin	0001_initial	2024-12-11 03:21:57.069334+00
19	admin	0002_logentry_remove_auto_add	2024-12-11 03:21:57.078162+00
20	admin	0003_logentry_add_action_flag_choices	2024-12-11 03:21:57.089577+00
21	questions	0001_initial	2024-12-11 03:21:57.141553+00
22	results	0001_initial	2024-12-11 03:21:57.173882+00
23	results	0002_result_attempt_number_result_created	2024-12-11 03:21:57.200625+00
24	sessions	0001_initial	2024-12-11 03:21:57.22338+00
25	users	0003_alter_section_options_alter_studentprofile_options_and_more	2024-12-11 03:21:57.254048+00
26	Pagina_Web_Ingles	0002_alter_quiz_level	2024-12-12 16:47:39.263669+00
34	Pagina_Web_Ingles	0003_remove_quiz_sections_alter_quiz_difficulty_and_more	2024-12-14 19:55:13.719548+00
\.


--
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
t5g7qhf4byvj962s9rkzq9yb1kmr2p9t	.eJxVizsOwjAQBe_iGkUbe-3YlEicw9pf5IhPgUmFuDtESgHlvJn3cpXWZ6trt0dd1B1dcIffjUkudt_Ehn3YuQ_nGy3X027_Lo16-_bIMagIQuYCE6ZUQDEUHVPxGScaJZAARZ8A2RQ8EVucMftZSZK59wd3mzKo:1tMAWO:pRIKW3deUZtSQoNII2c9Y5AkqGvFLfdgUX5wWqZc3ro	2024-12-27 18:36:16.466288+00
rc0svdq684cm7qxnw2p528uopwpmmfkg	.eJxVi0sOwjAMBe-SNaoKTWKbJRLniF5dW6n4LAhdIe4OlbqA5byZ9woFy7OWpdmjzFM4hhx2v9sIvdh9FSu2buPWnW-Yr6fN_l0qWv32PhjrYUgwoX1kdx8ZUyQRMU2sTqrohTylaKAeRhBONlDOnB3h_QGyDDNX:1tMy5S:4t1LA6WMZFOODFaNpEGjjIU6-tHjFOxLkmuCYwEyLk4	2024-12-29 23:31:46.035899+00
n1fevjcuubx8c3zyxqakbd6okjv0iioa	.eJxVi0sOwjAMBe-SNaoKTWKbJRLniF5dW6n4LAhdIe4OlbqA5byZ9woFy7OWpdmjzFM4hhx2v9sIvdh9FSu2buPWnW-Yr6fN_l0qWv32PhjrYUgwoX1kdx8ZUyQRMU2sTqrohTylaKAeRhBONlDOnB3h_QGyDDNX:1tLwJ9:BVJXzRf4L7cB8PojLo2LYGp88873dk1B6er994NVV7s	2024-12-27 03:25:39.644694+00
3d5trahggklo7gl1a9zzavqhwthdcvca	.eJxVizsOwjAQBe-yNYrszSYbUyJxDuvZG8sRnwKTCnF3iJQCynkz70UR67PGtc2PuBgdydPhd0vIl_m-iQ1bt3Przjcs19Nu_y4VrX774hEsOWa2UXuTyUmvrpgfVRgomc2gpbgJygNy4IERkJElBWGl9weQUzLV:1tNFcz:6WPjy--Ayn6EK2-HEZbkxNXvbqs2b3e3hO6q3FYWJ4E	2024-12-30 18:15:33.905704+00
z1u2ixpp2kcz9rma6zr4152ah6e1aasn	.eJxVizkKwzAURO-iOhht1pIykHOI-dIXMlmKyK5C7h4bXNjNwJs38xUJy9zS0vmTpiKuwojLsSPkB783sWEfdu7D_YXpedvt6dLQ27p30UvlNXz1ZJBDIQtFMTjHo3Vy5GAl2KtS9Rq6EEItMTNQyShJ4vcHjJszQw:1tNI0h:__Fta2c3jYESPUO5RDt6ag1EPlGDhT7PIvOxvKSLTqs	2024-12-30 20:48:11.177666+00
zrwhuhk150l3z3xn4l7ajqz6ec7amm7f	.eJxVizkKwzAURO-iOhht1pIykHOI-dIXMlmKyK5C7h4bXNjNwJs38xUJy9zS0vmTpiKuwojLsSPkB783sWEfdu7D_YXpedvt6dLQ27p30UvlNXz1ZJBDIQtFMTjHo3Vy5GAl2KtS9Rq6EEItMTNQyShJ4vcHjJszQw:1tNalT:UIGWj2wZnB4g9yJnS4HANo9wyXbOb57FBfl2f9jBSHg	2024-12-31 16:49:43.656913+00
\.


--
-- Data for Name: questions_answer; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.questions_answer (id, text, correct, created, question_id) FROM stdin;
153	yourselves	f	2024-12-15	9
154	ourselves	t	2024-12-15	9
155	ourself	f	2024-12-15	9
156	itself	f	2024-12-15	9
5	me	t	2024-12-14	2
6	I	f	2024-12-14	2
7	we	f	2024-12-14	2
8	they	f	2024-12-14	2
9	He	f	2024-12-14	3
10	It	t	2024-12-14	3
11	She	f	2024-12-14	3
12	--	f	2024-12-14	3
157	themselves	f	2024-12-15	10
158	themself	f	2024-12-15	10
159	yourselves	f	2024-12-15	10
160	each other	t	2024-12-15	10
161	on	f	2024-12-15	21
162	at	f	2024-12-15	21
163	into	f	2024-12-15	21
164	in	t	2024-12-15	21
168	test	f	2024-12-16	22
169	test2	t	2024-12-16	22
61	the	t	2024-12-15	11
62	an	f	2024-12-15	11
63	a	f	2024-12-15	11
64	--	f	2024-12-15	11
65	the	f	2024-12-15	12
66	an	f	2024-12-15	12
67	a	t	2024-12-15	12
68	--	f	2024-12-15	12
81	the	f	2024-12-15	13
82	a	f	2024-12-15	13
83	an	f	2024-12-15	13
84	--	t	2024-12-15	13
85	the	t	2024-12-15	14
86	a	f	2024-12-15	14
87	an	f	2024-12-15	14
88	--	f	2024-12-15	14
89	the	f	2024-12-15	15
90	a	t	2024-12-15	15
91	an	f	2024-12-15	15
92	--	f	2024-12-15	15
93	the	f	2024-12-15	16
94	a	f	2024-12-15	16
95	an	f	2024-12-15	16
96	--	t	2024-12-15	16
97	the	f	2024-12-15	17
98	a	t	2024-12-15	17
99	an	f	2024-12-15	17
100	--	f	2024-12-15	17
101	the	f	2024-12-15	18
102	a	f	2024-12-15	18
103	an	t	2024-12-15	18
104	--	f	2024-12-15	18
105	the	f	2024-12-15	19
106	a	f	2024-12-15	19
107	an	t	2024-12-15	19
108	--	f	2024-12-15	19
109	the, A	f	2024-12-15	20
110	the, An	f	2024-12-15	20
111	a, The	t	2024-12-15	20
112	an, The	f	2024-12-15	20
113	His	f	2024-12-15	1
114	She	f	2024-12-15	1
115	He	t	2024-12-15	1
116	Him	f	2024-12-15	1
125	You	f	2024-12-15	4
126	It	f	2024-12-15	4
127	Yours	f	2024-12-15	4
128	Your	t	2024-12-15	4
133	theirs	t	2024-12-15	5
134	them	f	2024-12-15	5
135	they	f	2024-12-15	5
136	their	f	2024-12-15	5
141	Sarah	f	2024-12-15	6
142	she	f	2024-12-15	6
143	Sarah's	t	2024-12-15	6
144	of Sarah	f	2024-12-15	6
145	those	f	2024-12-15	7
146	these	f	2024-12-15	7
147	--	f	2024-12-15	7
148	this	t	2024-12-15	7
149	That	f	2024-12-15	8
150	This	f	2024-12-15	8
151	--	f	2024-12-15	8
152	Those	t	2024-12-15	8
\.


--
-- Data for Name: questions_question; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.questions_question (id, text, created, quiz_id) FROM stdin;
2	Can you help ____?	2024-12-14	1
3	Where is the book? ____ is on the table.	2024-12-14	1
11	What is ____ name of the hotel?	2024-12-15	2
12	She works in ____ hospital.	2024-12-15	2
13	I like to eat ____ apples.	2024-12-15	2
14	New York is in ____ United States.	2024-12-15	2
15	I am ____ republican.	2024-12-15	2
16	We go to the supermarket on ____ Saturdays.	2024-12-15	2
17	He has ____ red bike.	2024-12-15	2
18	I want ____ orange and two apples.	2024-12-15	2
19	Her father is ____ architect.	2024-12-15	2
20	We live in _____ house. _____ house is small.	2024-12-15	2
1	Where is David? ____ is at home.	2024-12-14	1
4	____ house is blue.	2024-12-14	1
6	Whose bike is it? It is ____.	2024-12-14	1
7	I like ____ book.	2024-12-14	1
8	____ seats are ours.	2024-12-14	1
9	Did you paint the house? Yes, we painted the house ____.	2024-12-14	1
10	Alice and Paul see ____ everyday.	2024-12-14	1
21	New York is the largest city ____ the United States.	2024-12-15	4
5	These seats are ____.	2024-12-14	1
22	Hello	2024-12-16	6
\.


--
-- Data for Name: results_result; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.results_result (id, score, quiz_id, user_id, attempt_number, created) FROM stdin;
1	30	1	3	1	2024-12-15 22:31:34.984974+00
2	100	1	3	2	2024-12-15 22:55:50.216288+00
3	20	1	68	1	2024-12-15 23:20:41.331678+00
4	50	1	68	2	2024-12-15 23:26:15.75594+00
5	90	1	68	3	2024-12-15 23:27:04.572+00
6	30	2	3	1	2024-12-16 15:36:27.973474+00
7	100	2	3	2	2024-12-16 15:36:59.559354+00
\.


--
-- Data for Name: users_customuser; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.users_customuser (id, password, last_login, is_superuser, username, first_name, last_name, is_staff, is_active, date_joined, email, description, role) FROM stdin;
68	pbkdf2_sha256$870000$eccVWhpEWKhphyx1giyp5U$HfW1fF4fYqtB0WbFHWWqERy8pysVK99xaepmQ6jBj6Y=	2024-12-15 23:07:49.628223+00	f	alumno1.test			f	t	2024-12-15 23:06:59+00	alumno1.test@duocuc.cl		STUDENT
6	pbkdf2_sha256$870000$HKxQh7wvK2FK3SA6Gd019F$3DDI3tjlznYFtoLMYtMkPISnRwH5+9enGLrGGa00Csc=	2024-12-16 01:34:01.865073+00	f	ca.carrascod	Camilo	Carrasco	f	t	2024-12-13 03:24:12.359049+00	ca.carrascod@duocuc.cl		STUDENT
5	pbkdf2_sha256$870000$v12AhvfIxRuFPETF3Iji9O$RQZzuBkMf7DP0NySM8lP4hKEE5dYmXlcnyXSwZWZ5tU=	2024-12-16 15:38:05.823433+00	f	profesor.test	profesor	Test	f	t	2024-12-12 17:11:47+00	profesor.test@profesor.duoc.cl		TEACHER
34	pbkdf2_sha256$870000$R4yhq1j89irYA2TIQ0buGC$+Cvfx5Yedw3Rpk0dk9Nvxz0v9jbd5vlwcd8ZVOSkl7U=	2024-12-13 21:49:15.340577+00	f	cri.carrasco	Cristian	Carrasco	f	t	2024-12-13 17:11:41.729324+00	cri.carrasco@duocuc.cl		STUDENT
1	pbkdf2_sha256$870000$xzjcCy0dll3mr6ETFwCBp9$X2vFMnNKseo2Rrhk6kXXdkW36G47hc0LxzBN5gMrs3k=	2024-12-16 18:15:33.9+00	t	admin_django			t	t	2024-12-11 03:26:47.507933+00	speakit.duocuc@gmail.com		OTHER
69	pbkdf2_sha256$870000$636qAxK2dxrqBgxwoT01Iz$ii2OOZJPUj4eEKiHpemtd91dZNl4TOCBN0/LXv7Y3CA=	2024-12-16 20:34:58.223182+00	f	i.bilbao	Ivan	Bilbao	f	t	2024-12-16 20:32:17.240079+00	i.bilbao@profesor.duoc.cl		TEACHER
3	pbkdf2_sha256$870000$hDMvG70CBtq90WF34RIXGl$gWgxBYxYcPRXtEoSOjIuFBMmp322KYVbcG7zHWk4i+8=	2024-12-17 16:49:43.65318+00	f	feli.ortiz	Felipe	Ortiz	f	t	2024-12-12 16:50:21.716728+00	feli.ortiz@duocuc.cl		STUDENT
\.


--
-- Data for Name: users_customuser_groups; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.users_customuser_groups (id, customuser_id, group_id) FROM stdin;
\.


--
-- Data for Name: users_customuser_user_permissions; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.users_customuser_user_permissions (id, customuser_id, permission_id) FROM stdin;
\.


--
-- Data for Name: users_section; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.users_section (id, code, created_at, is_active) FROM stdin;
1	INU1234 - 123D	2024-12-12 03:37:59.09317+00	t
2	INU4101 - 004D	2024-12-12 16:50:22.183142+00	t
3	INU2101 - 002D	2024-12-12 20:23:19.214322+00	t
4	INI3111 - 001D	2024-12-13 03:24:12.683062+00	t
\.


--
-- Data for Name: users_studentprofile; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.users_studentprofile (id, student_id, section_id, user_id) FROM stdin;
3	\N	4	6
34	\N	4	34
68	\N	3	68
2	\N	3	3
\.


--
-- Data for Name: users_teacherprofile; Type: TABLE DATA; Schema: public; Owner: u4s6v2ba7opms1
--

COPY public.users_teacherprofile (id, teacher_id, user_id) FROM stdin;
34	\N	69
\.


--
-- Name: Pagina_Web_Ingles_quiz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public."Pagina_Web_Ingles_quiz_id_seq"', 33, true);


--
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 66, true);


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 66, true);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 33, true);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 66, true);


--
-- Name: questions_answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.questions_answer_id_seq', 198, true);


--
-- Name: questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.questions_question_id_seq', 33, true);


--
-- Name: results_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.results_result_id_seq', 33, true);


--
-- Name: users_customuser_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.users_customuser_groups_id_seq', 1, false);


--
-- Name: users_customuser_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.users_customuser_id_seq', 99, true);


--
-- Name: users_customuser_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.users_customuser_user_permissions_id_seq', 1, false);


--
-- Name: users_section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.users_section_id_seq', 33, true);


--
-- Name: users_studentprofile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.users_studentprofile_id_seq', 99, true);


--
-- Name: users_teacherprofile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: u4s6v2ba7opms1
--

SELECT pg_catalog.setval('public.users_teacherprofile_id_seq', 66, true);


--
-- Name: Pagina_Web_Ingles_quiz Pagina_Web_Ingles_quiz_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public."Pagina_Web_Ingles_quiz"
    ADD CONSTRAINT "Pagina_Web_Ingles_quiz_pkey" PRIMARY KEY (id);


--
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- Name: questions_answer questions_answer_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.questions_answer
    ADD CONSTRAINT questions_answer_pkey PRIMARY KEY (id);


--
-- Name: questions_question questions_question_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.questions_question
    ADD CONSTRAINT questions_question_pkey PRIMARY KEY (id);


--
-- Name: results_result results_result_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.results_result
    ADD CONSTRAINT results_result_pkey PRIMARY KEY (id);


--
-- Name: users_customuser users_customuser_email_key; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_customuser
    ADD CONSTRAINT users_customuser_email_key UNIQUE (email);


--
-- Name: users_customuser_groups users_customuser_groups_customuser_id_group_id_76b619e3_uniq; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_customuser_groups
    ADD CONSTRAINT users_customuser_groups_customuser_id_group_id_76b619e3_uniq UNIQUE (customuser_id, group_id);


--
-- Name: users_customuser_groups users_customuser_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_customuser_groups
    ADD CONSTRAINT users_customuser_groups_pkey PRIMARY KEY (id);


--
-- Name: users_customuser users_customuser_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_customuser
    ADD CONSTRAINT users_customuser_pkey PRIMARY KEY (id);


--
-- Name: users_customuser_user_permissions users_customuser_user_pe_customuser_id_permission_7a7debf6_uniq; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_customuser_user_permissions
    ADD CONSTRAINT users_customuser_user_pe_customuser_id_permission_7a7debf6_uniq UNIQUE (customuser_id, permission_id);


--
-- Name: users_customuser_user_permissions users_customuser_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_customuser_user_permissions
    ADD CONSTRAINT users_customuser_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: users_customuser users_customuser_username_key; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_customuser
    ADD CONSTRAINT users_customuser_username_key UNIQUE (username);


--
-- Name: users_section users_section_code_key; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_section
    ADD CONSTRAINT users_section_code_key UNIQUE (code);


--
-- Name: users_section users_section_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_section
    ADD CONSTRAINT users_section_pkey PRIMARY KEY (id);


--
-- Name: users_studentprofile users_studentprofile_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_studentprofile
    ADD CONSTRAINT users_studentprofile_pkey PRIMARY KEY (id);


--
-- Name: users_studentprofile users_studentprofile_user_id_key; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_studentprofile
    ADD CONSTRAINT users_studentprofile_user_id_key UNIQUE (user_id);


--
-- Name: users_teacherprofile users_teacherprofile_pkey; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_teacherprofile
    ADD CONSTRAINT users_teacherprofile_pkey PRIMARY KEY (id);


--
-- Name: users_teacherprofile users_teacherprofile_user_id_key; Type: CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_teacherprofile
    ADD CONSTRAINT users_teacherprofile_user_id_key UNIQUE (user_id);


--
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- Name: questions_answer_question_id_45884d67; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX questions_answer_question_id_45884d67 ON public.questions_answer USING btree (question_id);


--
-- Name: questions_question_quiz_id_ab31444c; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX questions_question_quiz_id_ab31444c ON public.questions_question USING btree (quiz_id);


--
-- Name: results_result_quiz_id_2609133d; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX results_result_quiz_id_2609133d ON public.results_result USING btree (quiz_id);


--
-- Name: results_result_user_id_ed3178a5; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX results_result_user_id_ed3178a5 ON public.results_result USING btree (user_id);


--
-- Name: users_customuser_email_6445acef_like; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX users_customuser_email_6445acef_like ON public.users_customuser USING btree (email varchar_pattern_ops);


--
-- Name: users_customuser_groups_customuser_id_958147bf; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX users_customuser_groups_customuser_id_958147bf ON public.users_customuser_groups USING btree (customuser_id);


--
-- Name: users_customuser_groups_group_id_01390b14; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX users_customuser_groups_group_id_01390b14 ON public.users_customuser_groups USING btree (group_id);


--
-- Name: users_customuser_user_permissions_customuser_id_5771478b; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX users_customuser_user_permissions_customuser_id_5771478b ON public.users_customuser_user_permissions USING btree (customuser_id);


--
-- Name: users_customuser_user_permissions_permission_id_baaa2f74; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX users_customuser_user_permissions_permission_id_baaa2f74 ON public.users_customuser_user_permissions USING btree (permission_id);


--
-- Name: users_customuser_username_80452fdf_like; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX users_customuser_username_80452fdf_like ON public.users_customuser USING btree (username varchar_pattern_ops);


--
-- Name: users_section_code_20a28cc0_like; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX users_section_code_20a28cc0_like ON public.users_section USING btree (code varchar_pattern_ops);


--
-- Name: users_studentprofile_section_id_ef607e69; Type: INDEX; Schema: public; Owner: u4s6v2ba7opms1
--

CREATE INDEX users_studentprofile_section_id_ef607e69 ON public.users_studentprofile USING btree (section_id);


--
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_users_customuser_id; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_users_customuser_id FOREIGN KEY (user_id) REFERENCES public.users_customuser(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: questions_answer questions_answer_question_id_45884d67_fk_questions_question_id; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.questions_answer
    ADD CONSTRAINT questions_answer_question_id_45884d67_fk_questions_question_id FOREIGN KEY (question_id) REFERENCES public.questions_question(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: questions_question questions_question_quiz_id_ab31444c_fk_Pagina_We; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.questions_question
    ADD CONSTRAINT "questions_question_quiz_id_ab31444c_fk_Pagina_We" FOREIGN KEY (quiz_id) REFERENCES public."Pagina_Web_Ingles_quiz"(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: results_result results_result_quiz_id_2609133d_fk_Pagina_Web_Ingles_quiz_id; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.results_result
    ADD CONSTRAINT "results_result_quiz_id_2609133d_fk_Pagina_Web_Ingles_quiz_id" FOREIGN KEY (quiz_id) REFERENCES public."Pagina_Web_Ingles_quiz"(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: results_result results_result_user_id_ed3178a5_fk_users_customuser_id; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.results_result
    ADD CONSTRAINT results_result_user_id_ed3178a5_fk_users_customuser_id FOREIGN KEY (user_id) REFERENCES public.users_customuser(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_customuser_groups users_customuser_gro_customuser_id_958147bf_fk_users_cus; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_customuser_groups
    ADD CONSTRAINT users_customuser_gro_customuser_id_958147bf_fk_users_cus FOREIGN KEY (customuser_id) REFERENCES public.users_customuser(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_customuser_groups users_customuser_groups_group_id_01390b14_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_customuser_groups
    ADD CONSTRAINT users_customuser_groups_group_id_01390b14_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_customuser_user_permissions users_customuser_use_customuser_id_5771478b_fk_users_cus; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_customuser_user_permissions
    ADD CONSTRAINT users_customuser_use_customuser_id_5771478b_fk_users_cus FOREIGN KEY (customuser_id) REFERENCES public.users_customuser(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_customuser_user_permissions users_customuser_use_permission_id_baaa2f74_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_customuser_user_permissions
    ADD CONSTRAINT users_customuser_use_permission_id_baaa2f74_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_studentprofile users_studentprofile_section_id_ef607e69_fk_users_section_id; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_studentprofile
    ADD CONSTRAINT users_studentprofile_section_id_ef607e69_fk_users_section_id FOREIGN KEY (section_id) REFERENCES public.users_section(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_studentprofile users_studentprofile_user_id_d0e95184_fk_users_customuser_id; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_studentprofile
    ADD CONSTRAINT users_studentprofile_user_id_d0e95184_fk_users_customuser_id FOREIGN KEY (user_id) REFERENCES public.users_customuser(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_teacherprofile users_teacherprofile_user_id_976ceafc_fk_users_customuser_id; Type: FK CONSTRAINT; Schema: public; Owner: u4s6v2ba7opms1
--

ALTER TABLE ONLY public.users_teacherprofile
    ADD CONSTRAINT users_teacherprofile_user_id_976ceafc_fk_users_customuser_id FOREIGN KEY (user_id) REFERENCES public.users_customuser(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: u4s6v2ba7opms1
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint); Type: ACL; Schema: public; Owner: rdsadmin
--

GRANT ALL ON FUNCTION public.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint) TO u4s6v2ba7opms1;


--
-- Name: extension_before_drop; Type: EVENT TRIGGER; Schema: -; Owner: heroku_admin
--

CREATE EVENT TRIGGER extension_before_drop ON ddl_command_start
   EXECUTE FUNCTION _heroku.extension_before_drop();


ALTER EVENT TRIGGER extension_before_drop OWNER TO heroku_admin;

--
-- Name: log_create_ext; Type: EVENT TRIGGER; Schema: -; Owner: heroku_admin
--

CREATE EVENT TRIGGER log_create_ext ON ddl_command_end
   EXECUTE FUNCTION _heroku.create_ext();


ALTER EVENT TRIGGER log_create_ext OWNER TO heroku_admin;

--
-- Name: log_drop_ext; Type: EVENT TRIGGER; Schema: -; Owner: heroku_admin
--

CREATE EVENT TRIGGER log_drop_ext ON sql_drop
   EXECUTE FUNCTION _heroku.drop_ext();


ALTER EVENT TRIGGER log_drop_ext OWNER TO heroku_admin;

--
-- Name: validate_extension; Type: EVENT TRIGGER; Schema: -; Owner: heroku_admin
--

CREATE EVENT TRIGGER validate_extension ON ddl_command_end
   EXECUTE FUNCTION _heroku.validate_extension();


ALTER EVENT TRIGGER validate_extension OWNER TO heroku_admin;

--
-- PostgreSQL database dump complete
--

