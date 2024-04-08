-- ----------------------------
-- Table structure for action_verification
-- ----------------------------
DROP TABLE IF EXISTS "action_verification" CASCADE;
CREATE TABLE "action_verification" (
  "acve_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "type" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "verification" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "deleted_at" timestamp(6),
  "expire_at" timestamptz(6) NOT NULL DEFAULT (now() + '02:00:00' :: interval)
);
-- ----------------------------
-- Table structure for auth_log
-- ----------------------------
DROP TABLE IF EXISTS "auth_log" CASCADE;
CREATE TABLE "auth_log" (
  "aulo_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" uuid NOT NULL,
  "ip" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "device_id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "device_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "location" varchar(255) COLLATE "pg_catalog"."default",
  "coord" point,
  "status" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'not logged' :: character varying,
  "token" text COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) NOT NULL DEFAULT now()
);
-- ----------------------------
-- Table structure for authentication_email
-- ----------------------------
DROP TABLE IF EXISTS "authentication_email" CASCADE;
CREATE TABLE "authentication_email" (
  "auem_id" serial8 NOT NULL,
  "user_id" uuid NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now()
);
-- ----------------------------
-- Table structure for config
-- ----------------------------
DROP TABLE IF EXISTS "config" CASCADE;
CREATE TABLE "config" (
  "path" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "type" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "info" jsonb NOT NULL DEFAULT '{}' :: jsonb,
  "description" varchar COLLATE "pg_catalog"."default" NOT NULL DEFAULT '' :: character varying
);
-- ----------------------------
-- Table structure for geo_city
-- ----------------------------
DROP TABLE IF EXISTS "geo_city" CASCADE;
CREATE TABLE "geo_city" (
  "geci_id" serial4 NOT NULL,
  "gest_id" serial4 NOT NULL,
  "identifier" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "coordinate" point NOT NULL
);
-- ----------------------------
-- Table structure for geo_country
-- ----------------------------
DROP TABLE IF EXISTS "geo_country" CASCADE;
CREATE TABLE "geo_country" (
  "geco_id" serial4 NOT NULL,
  "name" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "iso_2" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "iso_3" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "iso_numeric" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "coordinate" point NOT NULL
);
-- ----------------------------
-- Table structure for geo_state
-- ----------------------------
DROP TABLE IF EXISTS "geo_state" CASCADE;
CREATE TABLE "geo_state" (
  "gest_id" serial4 NOT NULL,
  "geco_id" serial4 NOT NULL,
  "identifier" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "acronym" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "coordinate" point NOT NULL
);
-- ----------------------------
-- Table structure for geo_state_capital
-- ----------------------------
DROP TABLE IF EXISTS "geo_state_capital";
CREATE TABLE "geo_state_capital" (
  "gest_id" serial4 NOT NULL,
  "geci_id" serial4 NOT NULL
);
-- ----------------------------
-- Table structure for geo_zip_code
-- ----------------------------
DROP TABLE IF EXISTS "geo_zip_code" CASCADE;
CREATE TABLE "geo_zip_code" (
  "gezi_id" serial4 NOT NULL,
  "geci_id" serial4 NOT NULL,
  "zip_code" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "coordinate" point NOT NULL,
  "street" varchar COLLATE "pg_catalog"."default",
  "complement" varchar COLLATE "pg_catalog"."default",
  "district" varchar COLLATE "pg_catalog"."default"
);
-- ----------------------------
-- Table structure for migration
-- ----------------------------
DROP TABLE IF EXISTS "migration" CASCADE;
CREATE TABLE "migration" (
  "migr_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now()
);
-- ----------------------------
-- Table structure for notification
-- ----------------------------
DROP TABLE IF EXISTS "notification" CASCADE;
CREATE TABLE "notification" (
  "noti_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "path" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "data" jsonb NOT NULL DEFAULT '{}' :: jsonb,
  "created_at" timestamp(6) NOT NULL DEFAULT now()
);
-- ----------------------------
-- Table structure for notification_user
-- ----------------------------
DROP TABLE IF EXISTS "notification_user" CASCADE;
CREATE TABLE "notification_user" (
  "noti_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" uuid NOT NULL,
  "read_at" timestamptz(6)
);
-- ----------------------------
-- Table structure for one_time_login
-- ----------------------------
DROP TABLE IF EXISTS "one_time_login" CASCADE;
CREATE TABLE "one_time_login" (
  "otlo_id" serial8 NOT NULL,
  "user_id" uuid NOT NULL,
  "token" text COLLATE "pg_catalog"."default" NOT NULL,
  "valid_until" timestamptz(6) NOT NULL,
  "deleted_at" timestamptz(6),
  "created_at" timestamptz(6) NOT NULL DEFAULT now()
);
-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS "user" CASCADE;
CREATE TABLE "user" (
  "user_id" uuid NOT NULL,
  "appl_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "avatar" varchar COLLATE "pg_catalog"."default",
  "push_tokens" varchar(255) [] COLLATE "pg_catalog"."default" NOT NULL DEFAULT '{}' :: character varying [],
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "deleted_at" timestamp(6),
  "info" jsonb NOT NULL DEFAULT '{}' :: jsonb
);
CREATE TABLE "public"."authentication_oauth" (
  "auoa_id" serial8 NOT NULL,
  "user_id" uuid NOT NULL,
  "email" varchar(255) NOT NULL,
  "provider" varchar(255) NOT NULL,
  "external_id" text NOT NULL,
  "provider_data" jsonb NOT NULL DEFAULT '{}' :: jsonb,
  CONSTRAINT "authentication_oauth_pkey" PRIMARY KEY ("auoa_id"),
  CONSTRAINT "authentication_oauth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
-- ----------------------------
-- Primary Key structure for table action_verification
-- ----------------------------
ALTER TABLE
  "action_verification"
ADD
  CONSTRAINT "action_verification_pkey" PRIMARY KEY ("acve_id");
-- ----------------------------
  -- Primary Key structure for table auth_log
  -- ----------------------------
ALTER TABLE
  "auth_log"
ADD
  CONSTRAINT "auth_log_pkey" PRIMARY KEY ("aulo_id");
-- ----------------------------
  -- Indexes structure for table authentication_email
  -- ----------------------------
  CREATE INDEX "idx_authentication_email_user_id" ON "authentication_email" USING btree (
    "user_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
  );
-- ----------------------------
  -- Uniques structure for table authentication_email
  -- ----------------------------
ALTER TABLE
  "authentication_email"
ADD
  CONSTRAINT "unq_authentication_email_user_id" UNIQUE ("user_id");
-- ----------------------------
  -- Foreign Keys structure for table action_verification
  -- ----------------------------
ALTER TABLE
  "action_verification"
ADD
  CONSTRAINT "fk_action_verification_user_1" FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
  -- Primary Key structure for table authentication_email
  -- ----------------------------
ALTER TABLE
  "authentication_email"
ADD
  CONSTRAINT "authentication_email_pkey" PRIMARY KEY ("auem_id");
-- ----------------------------
  -- Primary Key structure for table geo_city
  -- ----------------------------
ALTER TABLE
  "geo_city"
ADD
  CONSTRAINT "geo_city_pkey" PRIMARY KEY ("geci_id");
-- ----------------------------
  -- Primary Key structure for table geo_country
  -- ----------------------------
ALTER TABLE
  "geo_country"
ADD
  CONSTRAINT "geo_country_pkey" PRIMARY KEY ("geco_id");
-- ----------------------------
  -- Primary Key structure for table geo_state
  -- ----------------------------
ALTER TABLE
  "geo_state"
ADD
  CONSTRAINT "geo_state_pkey" PRIMARY KEY ("gest_id");
-- ----------------------------
  -- Primary Key structure for table geo_state_capital
  -- ----------------------------
ALTER TABLE
  "geo_state_capital"
ADD
  CONSTRAINT "unq_geo_state_capital_gest_id_geci_id" PRIMARY KEY ("gest_id", "geci_id");
-- ----------------------------
  -- Uniques structure for table geo_zip_code
  -- ----------------------------
ALTER TABLE
  "geo_zip_code"
ADD
  CONSTRAINT "unq_geo_zip_code_zip_code" UNIQUE ("zip_code");
-- ----------------------------
  -- Primary Key structure for table geo_zip_code
  -- ----------------------------
ALTER TABLE
  "geo_zip_code"
ADD
  CONSTRAINT "geo_zip_code_pkey" PRIMARY KEY ("gezi_id");
-- ----------------------------
  -- Primary Key structure for table migration
  -- ----------------------------
ALTER TABLE
  "migration"
ADD
  CONSTRAINT "migration_pkey" PRIMARY KEY ("migr_id");
-- ----------------------------
  -- Primary Key structure for table notification
  -- ----------------------------
ALTER TABLE
  "notification"
ADD
  CONSTRAINT "notification_pkey" PRIMARY KEY ("noti_id");
-- ----------------------------
  -- Primary Key structure for table notification_user
  -- ----------------------------
ALTER TABLE
  "notification_user"
ADD
  CONSTRAINT "notification_user_pkey" PRIMARY KEY ("user_id", "noti_id");
-- ----------------------------
  -- Primary Key structure for table one_time_login
  -- ----------------------------
ALTER TABLE
  "one_time_login"
ADD
  CONSTRAINT "one_time_login_pkey" PRIMARY KEY ("otlo_id");
-- ----------------------------
  -- Primary Key structure for table user
  -- ----------------------------
ALTER TABLE
  "user"
ADD
  CONSTRAINT "user_pkey" PRIMARY KEY ("user_id");
-- ----------------------------
  -- Foreign Keys structure for table auth_log
  -- ----------------------------
ALTER TABLE
  "auth_log"
ADD
  CONSTRAINT "fk_auth_log_user_1" FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
  -- Foreign Keys structure for table authentication_email
  -- ----------------------------
ALTER TABLE
  "authentication_email"
ADD
  CONSTRAINT "fk_authentication_email_user_1" FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
  -- Foreign Keys structure for table geo_city
  -- ----------------------------
ALTER TABLE
  "geo_city"
ADD
  CONSTRAINT "fk_geo_city_state_gest_id" FOREIGN KEY ("gest_id") REFERENCES "geo_state" ("gest_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
  -- Foreign Keys structure for table geo_state
  -- ----------------------------
ALTER TABLE
  "geo_state"
ADD
  CONSTRAINT "fk_geo_state_geo_country_geco_id" FOREIGN KEY ("geco_id") REFERENCES "geo_country" ("geco_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
  -- Foreign Keys structure for table geo_state_capital
  -- ----------------------------
ALTER TABLE
  "geo_state_capital"
ADD
  CONSTRAINT "fk_geo_state_capital_geci_id" FOREIGN KEY ("geci_id") REFERENCES "geo_city" ("geci_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE
  "geo_state_capital"
ADD
  CONSTRAINT "fk_geo_state_capital_gest_id" FOREIGN KEY ("gest_id") REFERENCES "geo_state" ("gest_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
  -- Foreign Keys structure for table geo_zip_code
  -- ----------------------------
ALTER TABLE
  "geo_zip_code"
ADD
  CONSTRAINT "fk_geo_zip_code_geo_city_geci_id" FOREIGN KEY ("geci_id") REFERENCES "geo_city" ("geci_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
  -- Foreign Keys structure for table notification_user
  -- ----------------------------
ALTER TABLE
  "notification_user"
ADD
  CONSTRAINT "fk_notification_user_notification_1" FOREIGN KEY ("noti_id") REFERENCES "notification" ("noti_id") ON DELETE NO ACTION ON UPDATE NO ACTION;