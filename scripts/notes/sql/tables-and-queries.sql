-- Reproduce the SQL examples and verify their results in PostgreSQL.
-- Run: psql -X -v ON_ERROR_STOP=1 -f scripts/notes/sql/tables-and-queries.sql
-- The note targets PostgreSQL 18 syntax; these statements use compatible core SQL.
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

SELECT order_id, line_no, product, quantity, unit_price_cents
FROM order_lines
ORDER BY order_id, line_no;

SELECT order_id, line_no, product
FROM order_lines
WHERE quantity >= 2
ORDER BY order_id, line_no;

SELECT order_id, line_no, quantity * unit_price_cents AS line_total_cents
FROM order_lines
WHERE quantity >= 2
ORDER BY order_id, line_no;

SELECT product
FROM order_lines
ORDER BY order_id, line_no;

SELECT order_id, line_no, product
FROM order_lines
WHERE quantity >= 4
ORDER BY order_id, line_no;

DO $$
DECLARE
    actual jsonb;
BEGIN
    SELECT jsonb_agg(to_jsonb(t) ORDER BY order_id, line_no)
    INTO actual
    FROM (SELECT order_id, line_no, product FROM order_lines WHERE quantity >= 2) AS t;
    IF actual IS DISTINCT FROM '[{"order_id":101,"line_no":1,"product":"tea"},{"order_id":103,"line_no":1,"product":"coffee"},{"order_id":104,"line_no":1,"product":"cocoa"}]'::jsonb THEN
        RAISE EXCEPTION 'Unexpected filtered rows: %', actual;
    END IF;

    SELECT jsonb_agg(to_jsonb(t) ORDER BY order_id, line_no)
    INTO actual
    FROM (SELECT order_id, line_no, quantity * unit_price_cents AS line_total_cents FROM order_lines WHERE quantity >= 2) AS t;
    IF actual IS DISTINCT FROM '[{"order_id":101,"line_no":1,"line_total_cents":700},{"order_id":103,"line_no":1,"line_total_cents":1200},{"order_id":104,"line_no":1,"line_total_cents":1200}]'::jsonb THEN
        RAISE EXCEPTION 'Unexpected line totals: %', actual;
    END IF;

    IF (SELECT count(*) FROM order_lines) <> 6 OR
       (SELECT count(*) FROM order_lines WHERE product = 'tea') <> 3 OR
       (SELECT count(*) FROM order_lines WHERE quantity >= 4) <> 0 THEN
        RAISE EXCEPTION 'Unexpected source, duplicate or empty-result count';
    END IF;
    IF (SELECT count(DISTINCT (order_id, line_no)) FROM order_lines) <> 6 THEN
        RAISE EXCEPTION 'Order-line identities must be distinct in this example';
    END IF;
END $$;

ROLLBACK;
