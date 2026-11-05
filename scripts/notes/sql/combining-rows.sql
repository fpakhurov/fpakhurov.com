-- Verify the examples in SQL notes 5–8.
-- Run with psql -X -v ON_ERROR_STOP=1 -f scripts/notes/sql/combining-rows.sql
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

CREATE TEMP TABLE supplier_offers (
    product text,
    supplier text,
    PRIMARY KEY (product, supplier)
);

INSERT INTO supplier_offers VALUES
    ('tea', 'A'),
    ('tea', 'B'),
    ('coffee', 'A'),
    ('cocoa', 'C');

DO $verify$
DECLARE
    example record;
    actual jsonb;
BEGIN
    FOR example IN
        SELECT * FROM (VALUES
        ('product groups', $q$
            SELECT product,
                   COUNT(*) AS lines,
                   SUM(quantity) AS units,
                   SUM(quantity * unit_price_cents) AS revenue_cents
            FROM order_lines
            GROUP BY product
            ORDER BY product
        $q$, '[
            {"product":"cocoa","lines":1,"units":3,"revenue_cents":1200},
            {"product":"coffee","lines":2,"units":3,"revenue_cents":1800},
            {"product":"tea","lines":3,"units":4,"revenue_cents":1400}
        ]'::jsonb),
        ('distinct aggregates', $q$
            SELECT SUM(DISTINCT quantity) AS distinct_units,
                   COUNT(DISTINCT order_id) AS orders
            FROM order_lines
            WHERE product = 'tea'
        $q$, '[
            {"distinct_units":3,"orders":3}
        ]'::jsonb),
        ('HAVING threshold', $q$
            SELECT product,
                   SUM(quantity * unit_price_cents) AS revenue_cents
            FROM order_lines
            GROUP BY product
            HAVING SUM(quantity * unit_price_cents) >= 1500
            ORDER BY product
        $q$, '[
            {"product":"coffee","revenue_cents":1800}
        ]'::jsonb),
        ('WHERE before grouping', $q$
            SELECT product,
                   SUM(quantity * unit_price_cents) AS revenue_cents
            FROM order_lines
            WHERE order_id >= 103
            GROUP BY product
            HAVING SUM(quantity * unit_price_cents) >= 1500
            ORDER BY product
        $q$, '[

        ]'::jsonb),
        ('missing amount', $q$
            SELECT COUNT(*) AS input_rows,
                   COUNT(amount_cents) AS known_amounts,
                   SUM(amount_cents) AS known_total_cents,
                   AVG(amount_cents) AS mean_known_cents
            FROM (VALUES (700), (NULL::integer)) AS batch(amount_cents)
        $q$, '[
            {"input_rows":2,"known_amounts":1,"known_total_cents":700,"mean_known_cents":700}
        ]'::jsonb),
        ('zero amount', $q$
            SELECT COUNT(*) AS input_rows,
                   COUNT(amount_cents) AS known_amounts,
                   SUM(amount_cents) AS known_total_cents,
                   AVG(amount_cents) AS mean_known_cents
            FROM (VALUES (700), (0)) AS batch(amount_cents)
        $q$, '[
            {"input_rows":2,"known_amounts":2,"known_total_cents":700,"mean_known_cents":350}
        ]'::jsonb),
        ('empty input', $q$
            SELECT COUNT(*) AS input_rows,
                   COUNT(amount_cents) AS known_amounts,
                   SUM(amount_cents) AS known_total_cents,
                   AVG(amount_cents) AS mean_known_cents
            FROM (VALUES (700), (NULL::integer)) AS batch(amount_cents)
            WHERE false
        $q$, '[
            {"input_rows":0,"known_amounts":0,"known_total_cents":null,"mean_known_cents":null}
        ]'::jsonb),
        ('empty grouped input', $q$
            SELECT product,
                   COUNT(*) AS lines,
                   SUM(quantity) AS units,
                   SUM(quantity * unit_price_cents) AS revenue_cents
            FROM order_lines
            WHERE false
            GROUP BY product
            ORDER BY product
        $q$, '[

        ]'::jsonb),
        ('inner catalogue matches', $q$
            SELECT l.order_id, l.line_no, l.product, c.category
            FROM order_lines AS l
            JOIN catalogue AS c ON c.product = l.product
            ORDER BY l.order_id, l.line_no
        $q$, '[
            {"order_id":101,"line_no":1,"product":"tea","category":"drinks"},
            {"order_id":101,"line_no":2,"product":"coffee","category":"drinks"},
            {"order_id":102,"line_no":1,"product":"tea","category":"drinks"},
            {"order_id":103,"line_no":1,"product":"coffee","category":"drinks"},
            {"order_id":103,"line_no":2,"product":"tea","category":"drinks"},
            {"order_id":104,"line_no":1,"product":"cocoa","category":"pantry"}
        ]'::jsonb),
        ('cross product', $q$
            SELECT COUNT(*) AS pairs FROM order_lines CROSS JOIN catalogue
        $q$, '[
            {"pairs":24}
        ]'::jsonb),
        ('offer fan-out', $q$
            SELECT l.product, COUNT(*) AS pairs,
                   SUM(l.quantity) AS summed_units
            FROM order_lines AS l
            JOIN supplier_offers AS s ON s.product = l.product
            GROUP BY l.product
            ORDER BY l.product
        $q$, '[
            {"product":"cocoa","pairs":1,"summed_units":3},
            {"product":"coffee","pairs":2,"summed_units":3},
            {"product":"tea","pairs":6,"summed_units":8}
        ]'::jsonb),
        ('left join padding', $q$
            SELECT c.product, l.order_id, l.line_no, l.quantity
            FROM catalogue AS c
            LEFT JOIN order_lines AS l ON l.product = c.product
            ORDER BY c.product, l.order_id, l.line_no
        $q$, '[
            {"product":"cocoa","order_id":104,"line_no":1,"quantity":3},
            {"product":"coffee","order_id":101,"line_no":2,"quantity":1},
            {"product":"coffee","order_id":103,"line_no":1,"quantity":2},
            {"product":"mint","order_id":null,"line_no":null,"quantity":null},
            {"product":"tea","order_id":101,"line_no":1,"quantity":2},
            {"product":"tea","order_id":102,"line_no":1,"quantity":1},
            {"product":"tea","order_id":103,"line_no":2,"quantity":1}
        ]'::jsonb),
        ('real matches and units', $q$
            SELECT c.product,
                   COUNT(*) AS joined_rows,
                   COUNT(l.order_id) AS sales_lines,
                   COALESCE(SUM(l.quantity), 0) AS units
            FROM catalogue AS c
            LEFT JOIN order_lines AS l ON l.product = c.product
            GROUP BY c.product
            ORDER BY c.product
        $q$, '[
            {"product":"cocoa","joined_rows":1,"sales_lines":1,"units":3},
            {"product":"coffee","joined_rows":2,"sales_lines":2,"units":3},
            {"product":"mint","joined_rows":1,"sales_lines":0,"units":0},
            {"product":"tea","joined_rows":3,"sales_lines":3,"units":4}
        ]'::jsonb),
        ('threshold in ON', $q$
            SELECT c.product, COUNT(l.order_id) AS large_lines
            FROM catalogue AS c
            LEFT JOIN order_lines AS l
                ON l.product = c.product AND l.quantity >= 3
            GROUP BY c.product
            ORDER BY c.product
        $q$, '[
            {"product":"cocoa","large_lines":1},
            {"product":"coffee","large_lines":0},
            {"product":"mint","large_lines":0},
            {"product":"tea","large_lines":0}
        ]'::jsonb),
        ('threshold in WHERE', $q$
            SELECT c.product, COUNT(l.order_id) AS large_lines
            FROM catalogue AS c
            LEFT JOIN order_lines AS l ON l.product = c.product
            WHERE l.quantity >= 3
            GROUP BY c.product
            ORDER BY c.product
        $q$, '[
            {"product":"cocoa","large_lines":1}
        ]'::jsonb),
        ('threshold or null order', $q$
            SELECT c.product, COUNT(l.order_id) AS large_lines
            FROM catalogue AS c
            LEFT JOIN order_lines AS l ON l.product = c.product
            WHERE l.quantity >= 3 OR l.order_id IS NULL
            GROUP BY c.product
            ORDER BY c.product
        $q$, '[
            {"product":"cocoa","large_lines":1},
            {"product":"mint","large_lines":0}
        ]'::jsonb),
        ('above average', $q$
            SELECT order_id, line_no,
                   quantity * unit_price_cents AS line_cents
            FROM order_lines
            WHERE quantity * unit_price_cents > (
                SELECT AVG(quantity * unit_price_cents)
                FROM order_lines
            )
            ORDER BY order_id, line_no
        $q$, '[
            {"order_id":103,"line_no":1,"line_cents":1200},
            {"order_id":104,"line_no":1,"line_cents":1200}
        ]'::jsonb),
        ('mean amount', $q$
            SELECT ROUND(AVG(quantity * unit_price_cents), 2) AS mean_cents FROM order_lines
        $q$, '[
            {"mean_cents":733.33}
        ]'::jsonb),
        ('scalar empty', $q$
            SELECT (SELECT unit_price_cents FROM order_lines WHERE product = 'mint') AS price
        $q$, '[
            {"price":null}
        ]'::jsonb),
        ('correlated EXISTS', $q$
            SELECT c.product
            FROM catalogue AS c
            WHERE EXISTS (
                SELECT 1
                FROM order_lines AS l
                WHERE l.product = c.product
            )
            ORDER BY c.product
        $q$, '[
            {"product":"cocoa"},
            {"product":"coffee"},
            {"product":"tea"}
        ]'::jsonb),
        ('correlated NOT EXISTS', $q$
            SELECT c.product
            FROM catalogue AS c
            WHERE NOT EXISTS (
                SELECT 1
                FROM order_lines AS l
                WHERE l.product = c.product
            )
            ORDER BY c.product
        $q$, '[
            {"product":"mint"}
        ]'::jsonb),
        ('IN membership', $q$
            SELECT c.product FROM catalogue AS c
            WHERE c.product IN (SELECT product FROM order_lines)
            ORDER BY c.product
        $q$, '[
            {"product":"cocoa"},
            {"product":"coffee"},
            {"product":"tea"}
        ]'::jsonb),
        ('NOT IN with missing code', $q$
            SELECT c.product,
                   c.product NOT IN (
                       SELECT product
                       FROM (VALUES ('tea'::text), (NULL)) AS incoming(product)
                   ) AS absent_in,
                   NOT EXISTS (
                       SELECT 1
                       FROM (VALUES ('tea'::text), (NULL)) AS incoming(product)
                       WHERE incoming.product = c.product
                   ) AS absent_exists
            FROM catalogue AS c
            ORDER BY c.product
        $q$, '[
            {"product":"cocoa","absent_in":null,"absent_exists":true},
            {"product":"coffee","absent_in":null,"absent_exists":true},
            {"product":"mint","absent_in":null,"absent_exists":true},
            {"product":"tea","absent_in":false,"absent_exists":false}
        ]'::jsonb)
        ) AS cases(label, statement, expected)
    LOOP
        EXECUTE format(
            'SELECT COALESCE(jsonb_agg(to_jsonb(result)), ''[]''::jsonb) FROM (%s) AS result',
            example.statement
        ) INTO actual;
        IF actual IS DISTINCT FROM example.expected THEN
            RAISE EXCEPTION '% returned %, expected %', example.label, actual, example.expected;
        END IF;
    END LOOP;

    BEGIN
        EXECUTE 'SELECT product, order_id, SUM(quantity) FROM order_lines GROUP BY product';
        RAISE EXCEPTION 'Expected an error for an ungrouped order identifier';
    EXCEPTION WHEN grouping_error THEN
        NULL;
    END;

    BEGIN
        EXECUTE 'SELECT (SELECT unit_price_cents FROM order_lines WHERE product = ''coffee'')';
        RAISE EXCEPTION 'Expected an error for a scalar subquery with two rows';
    EXCEPTION WHEN cardinality_violation THEN
        NULL;
    END;
END
$verify$;

SELECT 'Combining Rows examples verified' AS result;
ROLLBACK;
