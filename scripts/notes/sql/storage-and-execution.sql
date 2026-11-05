-- Verify the SQL examples in Databases notes 6–11.
-- Run with psql -X -v ON_ERROR_STOP=1 -f scripts/notes/sql/storage-and-execution.sql
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

CREATE TEMP TABLE catalogue (
    product text PRIMARY KEY,
    category text NOT NULL
);

INSERT INTO catalogue VALUES
    ('tea', 'drinks'),
    ('coffee', 'drinks'),
    ('cocoa', 'pantry'),
    ('mint', 'herbs');

CREATE INDEX order_lines_by_order ON order_lines (order_id);

CREATE TEMP TABLE report_orders (
    order_id integer,
    shop_id integer,
    paid_on date,
    total_cents integer
);

INSERT INTO report_orders VALUES
    (101, 1, DATE '2026-01-01', 1300),
    (102, 1, DATE '2026-01-02', 350),
    (103, 1, DATE '2026-01-02', 1550),
    (104, 1, DATE '2026-01-03', 1200),
    (201, 2, DATE '2026-01-02', 2400),
    (202, 2, DATE '2026-01-03', 800);

CREATE INDEX report_orders_shop_day_id
ON report_orders (shop_id, paid_on, order_id) INCLUDE (total_cents);

ANALYZE report_orders;

DO $verify$
DECLARE
    details jsonb;
    results bigint[];
    order_ids integer[];
    join_rows integer;
BEGIN
    SELECT array_agg(line_no ORDER BY line_no) INTO order_ids
    FROM order_lines WHERE order_id = 103;
    IF order_ids IS DISTINCT FROM ARRAY[1, 2] THEN
        RAISE EXCEPTION 'Unexpected indexed lookup rows: %', order_ids;
    END IF;

    SELECT array_agg(order_id ORDER BY paid_on, order_id) INTO order_ids FROM (
        SELECT order_id, paid_on, total_cents
        FROM report_orders
        WHERE shop_id = 1
          AND paid_on >= DATE '2026-01-02'
          AND paid_on < DATE '2026-01-03'
        ORDER BY paid_on, order_id
    ) AS report;
    IF order_ids IS DISTINCT FROM ARRAY[102, 103] THEN
        RAISE EXCEPTION 'Unexpected order IDs for shop and date range: %', order_ids;
    END IF;

    SELECT array_agg(sales_cents ORDER BY shop_id) INTO results FROM (
        SELECT shop_id, SUM(total_cents) AS sales_cents
        FROM report_orders
        GROUP BY shop_id
        ORDER BY shop_id
    ) AS totals;
    IF results IS DISTINCT FROM ARRAY[4400, 3200]::bigint[] THEN
        RAISE EXCEPTION 'Unexpected totals by shop: %', results;
    END IF;

    SELECT count(*) INTO join_rows FROM (
        SELECT l.order_id, l.line_no, l.product, c.category
        FROM order_lines AS l
        JOIN catalogue AS c ON c.product = l.product
        ORDER BY l.order_id, l.line_no
    ) AS joined;
    IF join_rows IS DISTINCT FROM 6 THEN
        RAISE EXCEPTION 'Unexpected number of matching order lines: %', join_rows;
    END IF;

    EXECUTE $q$
        EXPLAIN (COSTS OFF, FORMAT JSON)
        SELECT order_id, total_cents
        FROM report_orders
        WHERE shop_id = 2
        ORDER BY total_cents DESC, order_id
    $q$ INTO details;
    IF details #>> '{0,Plan,Node Type}' IS DISTINCT FROM 'Sort'
       OR details #>> '{0,Plan,Plans,0,Node Type}' IS DISTINCT FROM 'Seq Scan' THEN
        RAISE EXCEPTION 'Expected Sort over Seq Scan on the toy data: %', details;
    END IF;
END
$verify$;

CREATE TEMP TABLE planner_orders AS
SELECT n AS order_id,
       CASE WHEN n <= 200 THEN 1 ELSE 2 END AS shop_id,
       CASE WHEN n <= 180 OR n BETWEEN 201 AND 320
            THEN 'web' ELSE 'counter' END AS channel
FROM generate_series(1, 1000) AS g(n);

ANALYZE planner_orders;

DO $verify$
DECLARE
    details jsonb;
    expected integer;
BEGIN
    FOREACH expected IN ARRAY ARRAY[60, 180] LOOP
        IF expected = 180 THEN
            CREATE STATISTICS shop_channel (mcv)
            ON shop_id, channel FROM planner_orders;
            ANALYZE planner_orders;
        END IF;

        EXECUTE $q$
            EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF, FORMAT JSON)
            SELECT order_id
            FROM planner_orders
            WHERE shop_id = 1 AND channel = 'web'
        $q$ INTO details;
        IF (details #>> '{0,Plan,Plan Rows}')::int IS DISTINCT FROM expected
           OR (details #>> '{0,Plan,Actual Rows}')::numeric IS DISTINCT FROM 180 THEN
            RAISE EXCEPTION 'Expected % estimated rows and 180 actual rows: %', expected, details;
        END IF;
    END LOOP;
END
$verify$;

SELECT 'Storage and Execution examples verified' AS result;
ROLLBACK;
