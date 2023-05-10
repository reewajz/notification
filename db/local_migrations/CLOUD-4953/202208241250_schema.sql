DO $$
BEGIN


  -- Initially create the schema
CREATE SCHEMA IF NOT EXISTS "tenant";

CREATE TABLE IF NOT EXISTS "tenant"."user" (
                                 "userUri" character varying NOT NULL,
                                 "title" character varying,
                                 "email" character varying NOT NULL,
                                 "firstName" character varying NOT NULL,
                                 "lastName" character varying NOT NULL,
                                 "version" integer NOT NULL,
                                 "createdOn" numeric NOT NULL,
                                 "createdByUri" character varying,
                                 "updatedOn" numeric,
                                 "updatedByUri" character varying,
                                 CONSTRAINT "pk_user" PRIMARY KEY ("userUri")
);



END $$;
