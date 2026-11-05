-- Verify the type and NULL examples in PostgreSQL.
-- Run with psql -X -v ON_ERROR_STOP=1 -f scripts/notes/sql/types-and-null.sql
BEGIN;
SET LOCAL transform_null_equals = off;

CREATE TEMP TABLE order_line_quotes (
    line_key text,
    quantity integer,
    unit_price_cents integer
);

INSERT INTO order_line_quotes VALUES
    ('101/1', 2, 350),
    ('102/1', 1, 350),
    ('103/1', 2, NULL),
    ('105/1', 1, 0);

DO $$
DECLARE
    example record;
    actual text[];
BEGIN
    IF 350 / 100 IS DISTINCT FROM 3
       OR CAST(350 / 100 AS numeric) IS DISTINCT FROM 3
       OR CAST(350 AS numeric) / 100 IS DISTINCT FROM 3.5
       OR pg_typeof(350 / 100) IS DISTINCT FROM 'integer'::regtype
       OR pg_typeof(CAST(350 AS numeric) / 100) IS DISTINCT FROM 'numeric'::regtype THEN
        RAISE EXCEPTION 'Unexpected division result or result type';
    END IF;

    IF (0.1 + 0.2 = 0.3) IS DISTINCT FROM TRUE
       OR (CAST(0.1 AS double precision) + CAST(0.2 AS double precision)
               = CAST(0.3 AS double precision)) IS DISTINCT FROM FALSE
       OR CAST(3.505 AS numeric(5, 2)) IS DISTINCT FROM 3.51 THEN
        RAISE EXCEPTION 'Unexpected numeric precision result';
    END IF;

    BEGIN
        PERFORM CAST(999.995 AS numeric(5, 2));
        RAISE EXCEPTION 'Expected a numeric range error after rounding';
    EXCEPTION WHEN numeric_value_out_of_range THEN
        NULL;
    END;

    IF (350 = '350') IS DISTINCT FROM TRUE
       OR (350 = CAST(text '350' AS integer)) IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Unexpected integer comparison';
    END IF;

    BEGIN
        EXECUTE 'SELECT 350 = text ''350''';
        RAISE EXCEPTION 'Expected an undefined integer = text operator';
    EXCEPTION WHEN undefined_function THEN
        NULL;
    END;

    BEGIN
        PERFORM CAST(text 'pending' AS integer);
        RAISE EXCEPTION 'Expected a text-to-integer cast error';
    EXCEPTION WHEN invalid_text_representation THEN
        NULL;
    END;

    IF (SELECT array_agg(quantity * unit_price_cents ORDER BY line_key)
        FROM order_line_quotes) IS DISTINCT FROM ARRAY[700, 350, NULL, 0] THEN
        RAISE EXCEPTION 'Unexpected line amounts';
    END IF;

    IF (SELECT array_agg(quantity * unit_price_cents >= 700 ORDER BY line_key)
        FROM order_line_quotes) IS DISTINCT FROM ARRAY[TRUE, FALSE, NULL, FALSE] THEN
        RAISE EXCEPTION 'Unexpected truth values for the threshold';
    END IF;

    FOR example IN
        SELECT * FROM (VALUES
            ('quantity * unit_price_cents >= 700', ARRAY['101/1']),
            ('NOT (quantity * unit_price_cents >= 700)', ARRAY['102/1', '105/1']),
            ('unit_price_cents = NULL', ARRAY[]::text[]),
            ('unit_price_cents IS NULL', ARRAY['103/1']),
            ('quantity * COALESCE(unit_price_cents, 0) < 700', ARRAY['102/1', '103/1', '105/1'])
        ) AS filters(predicate, expected)
    LOOP
        EXECUTE format(
            'SELECT ARRAY(SELECT line_key FROM order_line_quotes WHERE %s ORDER BY line_key)',
            example.predicate
        ) INTO actual;
        IF actual IS DISTINCT FROM example.expected THEN
            RAISE EXCEPTION 'Unexpected result for %: %', example.predicate, actual;
        END IF;
    END LOOP;

    IF ARRAY[
        NOT NULL::boolean,
        FALSE AND NULL::boolean,
        TRUE AND NULL::boolean,
        FALSE OR NULL::boolean,
        TRUE OR NULL::boolean
    ] IS DISTINCT FROM ARRAY[NULL, FALSE, NULL, NULL, TRUE] THEN
        RAISE EXCEPTION 'Unexpected three-valued truth table';
    END IF;

    IF (SELECT ARRAY[
            quantity = 1 AND quantity * unit_price_cents >= 700,
            quantity >= 2 OR quantity * unit_price_cents >= 700
        ] FROM order_line_quotes WHERE line_key = '103/1') IS DISTINCT FROM ARRAY[FALSE, TRUE] THEN
        RAISE EXCEPTION 'Unexpected compound conditions on line 103/1';
    END IF;

    IF (SELECT array_agg(COALESCE(CAST(unit_price_cents AS text), 'pending') ORDER BY line_key)
        FROM order_line_quotes) IS DISTINCT FROM ARRAY['350', '350', 'pending', '0'] THEN
        RAISE EXCEPTION 'Unexpected display prices';
    END IF;
END
$$;

SELECT 'Types and NULL examples verified' AS result;
ROLLBACK;
