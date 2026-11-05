-- Reproduce the expression and filtering examples in PostgreSQL.
-- Run with psql -X -v ON_ERROR_STOP=1 -f scripts/notes/sql/select-and-expressions.sql
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

DO $$
DECLARE
    example record;
    actual text[];
    priced_total integer;
    per_line integer;
    per_unit integer;
BEGIN
    SELECT quantity * unit_price_cents + 50,
           quantity * (unit_price_cents + 50)
    INTO STRICT per_line, per_unit
    FROM order_lines
    WHERE order_id = 101 AND line_no = 1;
    IF (per_line, per_unit) IS DISTINCT FROM (750, 800) THEN
        RAISE EXCEPTION 'Unexpected amounts with fees: %, %', per_line, per_unit;
    END IF;

    FOR example IN
        SELECT * FROM (VALUES
            ('grouped', $p$quantity >= 2 AND (product = 'tea' OR product = 'coffee')$p$,
             ARRAY['101/1', '103/1']),
            ('ungrouped', $p$product = 'tea' OR product = 'coffee' AND quantity >= 2$p$,
             ARRAY['101/1', '102/1', '103/1', '103/2']),
            ('negated', $p$quantity >= 2 AND NOT (product = 'tea' OR product = 'coffee')$p$,
             ARRAY['104/1']),
            ('half-open', $p$quantity * unit_price_cents >= 700 AND quantity * unit_price_cents < 1200$p$,
             ARRAY['101/1']),
            ('closed', $p$quantity * unit_price_cents BETWEEN 700 AND 1200$p$,
             ARRAY['101/1', '103/1', '104/1'])
        ) AS filters(label, predicate, expected)
    LOOP
        EXECUTE format(
            'SELECT array_agg(order_id || ''/'' || line_no ORDER BY order_id, line_no)
             FROM order_lines WHERE %s',
            example.predicate
        ) INTO actual;
        IF actual IS DISTINCT FROM example.expected THEN
            RAISE EXCEPTION 'Unexpected % result: %', example.label, actual;
        END IF;
    END LOOP;

    BEGIN
        EXECUTE $query$
            SELECT order_id, line_no, quantity * unit_price_cents AS line_total_cents
            FROM order_lines
            WHERE line_total_cents >= 700
        $query$;
        RAISE EXCEPTION 'Expected undefined_column when WHERE refers to the output name';
    EXCEPTION WHEN undefined_column THEN
        NULL;
    END;

    SELECT line_total_cents INTO STRICT priced_total
    FROM (
        SELECT order_id, line_no, quantity * unit_price_cents AS line_total_cents
        FROM order_lines
    ) AS priced
    WHERE line_total_cents >= 700 AND line_total_cents < 1200
    ORDER BY line_total_cents, order_id, line_no;
    IF priced_total IS DISTINCT FROM 700 THEN
        RAISE EXCEPTION 'Unexpected amount from the derived table: %', priced_total;
    END IF;
END $$;

SELECT 'All expression examples passed' AS result;
ROLLBACK;
