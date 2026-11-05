-- Run with psql -X -v ON_ERROR_STOP=1 -f scripts/notes/sql/duplicates-and-order.sql
BEGIN;

CREATE TEMP TABLE order_lines (
    order_id integer,
    line_no integer,
    product text,
    quantity integer,
    unit_price_cents integer
);

INSERT INTO order_lines VALUES
    (101, 1, 'tea',    2, 350),
    (101, 2, 'coffee', 1, 600),
    (102, 1, 'tea',    1, 350),
    (103, 1, 'coffee', 2, 600),
    (103, 2, 'tea',    1, 350),
    (104, 1, 'cocoa',  3, 400);

CREATE TEMP VIEW priced_lines AS
SELECT order_id, line_no, quantity * unit_price_cents AS line_total_cents
FROM order_lines;

DO $$
DECLARE
    example record;
    actual text[];
    distinct_pairs integer;
    distinct_lines integer;
    prices integer[];
    chosen_line text;
BEGIN
    SELECT count(*) INTO distinct_pairs
    FROM (SELECT DISTINCT product, quantity FROM order_lines) AS pairs;

    SELECT count(*) INTO distinct_lines
    FROM (SELECT DISTINCT product, quantity, order_id, line_no FROM order_lines) AS lines;

    IF (distinct_pairs, distinct_lines) IS DISTINCT FROM (5, 6) THEN
        RAISE EXCEPTION 'Unexpected distinct counts: %, %', distinct_pairs, distinct_lines;
    END IF;

    SELECT array_agg(price_cents ORDER BY price_cents NULLS LAST) INTO prices
    FROM (
        SELECT DISTINCT price_cents
        FROM (VALUES (NULL::integer), (350), (NULL)) AS feed(price_cents)
    ) AS distinct_prices;
    IF prices IS DISTINCT FROM ARRAY[350, NULL] THEN
        RAISE EXCEPTION 'Unexpected distinct prices: %', prices;
    END IF;

    SELECT order_id || '/' || line_no INTO STRICT chosen_line
    FROM priced_lines
    ORDER BY line_total_cents DESC
    LIMIT 1;
    IF chosen_line NOT IN ('103/1', '104/1') THEN
        RAISE EXCEPTION 'Unexpected line at the tied cutoff: %', chosen_line;
    END IF;

    FOR example IN
        SELECT * FROM (VALUES
            ('all products', $q$SELECT product FROM order_lines$q$,
             ARRAY['cocoa', 'coffee', 'coffee', 'tea', 'tea', 'tea']),
            ('distinct products', $q$SELECT DISTINCT product FROM order_lines$q$,
             ARRAY['cocoa', 'coffee', 'tea']),
            ('one line', $q$SELECT order_id || '/' || line_no FROM priced_lines
                ORDER BY line_total_cents DESC, order_id ASC, line_no ASC LIMIT 1$q$,
             ARRAY['103/1']),
            ('all ties', $q$SELECT order_id || '/' || line_no FROM priced_lines
                ORDER BY line_total_cents DESC FETCH FIRST 1 ROW WITH TIES$q$,
             ARRAY['103/1', '104/1']),
            ('page one', $q$SELECT order_id || '/' || line_no FROM priced_lines
                ORDER BY line_total_cents DESC, order_id ASC, line_no ASC LIMIT 2$q$,
             ARRAY['103/1', '104/1']),
            ('page two', $q$SELECT order_id || '/' || line_no FROM priced_lines
                ORDER BY line_total_cents DESC, order_id ASC, line_no ASC LIMIT 2 OFFSET 2$q$,
             ARRAY['101/1', '101/2'])
        ) AS cases(label, statement, expected)
    LOOP
        EXECUTE format('SELECT array_agg(item ORDER BY item) FROM (%s) AS result(item)', example.statement)
        INTO actual;
        IF actual IS DISTINCT FROM example.expected THEN
            RAISE EXCEPTION 'Unexpected % result: %', example.label, actual;
        END IF;
    END LOOP;

    INSERT INTO order_lines VALUES (107, 1, 'tea', 3, 500);

    SELECT order_id || '/' || line_no INTO STRICT chosen_line
    FROM priced_lines
    ORDER BY line_total_cents DESC, order_id ASC, line_no ASC
    LIMIT 1 OFFSET 2;
    IF chosen_line IS DISTINCT FROM '104/1' THEN
        RAISE EXCEPTION 'Unexpected first row on shifted page two: %', chosen_line;
    END IF;
END $$;

SELECT 'All duplicate and ordering examples passed' AS result;
ROLLBACK;
