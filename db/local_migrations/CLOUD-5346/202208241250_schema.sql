DO $$
BEGIN


  -- Initially create the schema
CREATE SCHEMA IF NOT EXISTS "permission";

CREATE TABLE IF NOT EXISTS permission.space_user
(
    "spaceUri" character varying COLLATE pg_catalog."default" NOT NULL,
    "userUri" character varying COLLATE pg_catalog."default" NOT NULL,
    "addedOn" bigint NOT NULL,
    active boolean NOT NULL DEFAULT true,
    CONSTRAINT pk_space_user PRIMARY KEY ("spaceUri", "userUri")
);


END $$;
