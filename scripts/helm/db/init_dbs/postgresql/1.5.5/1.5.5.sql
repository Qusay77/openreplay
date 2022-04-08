BEGIN;
CREATE OR REPLACE FUNCTION openreplay_version()
    RETURNS text AS
$$
SELECT 'v1.5.5'
$$ LANGUAGE sql IMMUTABLE;


CREATE TABLE IF NOT EXISTS dashboards
(
    dashboard_id integer generated BY DEFAULT AS IDENTITY PRIMARY KEY,
    project_id   integer   NOT NULL REFERENCES projects (project_id) ON DELETE CASCADE,
    user_id      integer   NOT NULL REFERENCES users (user_id) ON DELETE SET NULL,
    name         text      NOT NULL,
    is_public    boolean   NOT NULL DEFAULT TRUE,
    is_pinned    boolean   NOT NULL DEFAULT FALSE,
    created_at   timestamp NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at   timestamp NULL     DEFAULT NULL
);


ALTER TABLE IF EXISTS metrics
    DROP CONSTRAINT IF EXISTS null_project_id_for_template_only,
    DROP CONSTRAINT IF EXISTS unique_key;

ALTER TABLE IF EXISTS metrics
    ADD COLUMN IF NOT EXISTS edited_at      timestamp NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS is_pinned      boolean   NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS category       text      NULL DEFAULT 'custom',
    ADD COLUMN IF NOT EXISTS is_predefined  boolean   NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_template    boolean   NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS predefined_key text      NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS default_config jsonb     NOT NULL DEFAULT '{"col": 2,"row": 2,"position": 0}'::jsonb,
    ALTER COLUMN project_id DROP NOT NULL,
    ADD CONSTRAINT null_project_id_for_template_only
        CHECK ( (metrics.category != 'custom') != (metrics.project_id IS NOT NULL) ),
    ADD CONSTRAINT unique_key UNIQUE (predefined_key);



CREATE TABLE IF NOT EXISTS dashboard_widgets
(
    widget_id    integer generated BY DEFAULT AS IDENTITY PRIMARY KEY,
    dashboard_id integer   NOT NULL REFERENCES dashboards (dashboard_id) ON DELETE CASCADE,
    metric_id    integer   NOT NULL REFERENCES metrics (metric_id) ON DELETE CASCADE,
    user_id      integer   NOT NULL REFERENCES users (user_id) ON DELETE SET NULL,
    created_at   timestamp NOT NULL DEFAULT timezone('utc'::text, now()),
    config       jsonb     NOT NULL DEFAULT '{}'::jsonb
);

COMMIT;
ALTER TYPE metric_view_type ADD VALUE IF NOT EXISTS 'areaChart';
ALTER TYPE metric_view_type ADD VALUE IF NOT EXISTS 'barChart';
ALTER TYPE metric_view_type ADD VALUE IF NOT EXISTS 'stackedBarChart';
ALTER TYPE metric_view_type ADD VALUE IF NOT EXISTS 'stackedBarLineChart';
ALTER TYPE metric_view_type ADD VALUE IF NOT EXISTS 'overview';
ALTER TYPE metric_view_type ADD VALUE IF NOT EXISTS 'map';
ALTER TYPE metric_type ADD VALUE IF NOT EXISTS 'predefined';

INSERT INTO metrics (name, category, default_config, is_predefined, is_template, is_public, predefined_key, metric_type, view_type)
VALUES ('Captured sessions', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'count_sessions', 'predefined', 'overview'),
       ('Request Load Time', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_request_load_time', 'predefined', 'overview'),
       ('Page Load Time', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_page_load_time', 'predefined', 'overview'),
       ('Image Load Time', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_image_load_time', 'predefined', 'overview'),
       ('DOM Content Load Start', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_dom_content_load_start', 'predefined', 'overview'),
       ('First Meaningful paint', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_first_contentful_pixel', 'predefined', 'overview'),
       ('No. of Visited Pages', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_visited_pages', 'predefined', 'overview'),
       ('Session Duration', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_session_duration', 'predefined', 'overview'),
       ('DOM Build Time', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_pages_dom_buildtime', 'predefined', 'overview'),
       ('Pages Response Time', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_pages_response_time', 'predefined', 'overview'),
       ('Response Time', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_response_time', 'predefined', 'overview'),
       ('First Paint', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_first_paint', 'predefined', 'overview'),
       ('DOM Content Loaded', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_dom_content_loaded', 'predefined', 'overview'),
       ('Time Till First byte', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_till_first_byte', 'predefined', 'overview'),
       ('Time To Interactive', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_time_to_interactive', 'predefined', 'overview'),
       ('Captured requests', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'count_requests', 'predefined', 'overview'),
       ('Time To Render', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_time_to_render', 'predefined', 'overview'),
       ('Memory Consumption', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_used_js_heap_size', 'predefined', 'overview'),
       ('CPU Load', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_cpu', 'predefined', 'overview'),
       ('Frame rate', 'overview', '{"col":1,"row":1,"position":0}', true, true, true, 'avg_fps', 'predefined', 'overview'),

       ('Sessions Affected by JS Errors', 'errors', '{"col":2,"row":2,"position":0}', true, true, true, 'impacted_sessions_by_js_errors', 'predefined', 'barChart'),
       ('Top Domains with 4xx Fetch Errors', 'errors', '{"col":2,"row":2,"position":0}', true, true, true, 'domains_errors_4xx', 'predefined', 'lineChart'),
       ('Top Domains with 5xx Fetch Errors', 'errors', '{"col":2,"row":2,"position":0}', true, true, true, 'domains_errors_5xx', 'predefined', 'lineChart'),
       ('Errors per Domain', 'errors', '{"col":2,"row":2,"position":0}', true, true, true, 'errors_per_domains', 'predefined', 'table'),
       ('Fetch Calls with Errors', 'errors', '{"col":2,"row":2,"position":0}', true, true, true, 'calls_errors', 'predefined', 'table'),
       ('Errors by Type', 'errors', '{"col":2,"row":2,"position":0}', true, true, true, 'errors_per_type', 'predefined', 'barChart'),
       ('Errors by Origin', 'errors', '{"col":2,"row":2,"position":0}', true, true, true, 'resources_by_party', 'predefined', 'stackedBarChart'),

       ('Speed Index by Location', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'speed_location', 'predefined', 'map'),
       ('Slowest Domains', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'slowest_domains', 'predefined', 'table'),
       ('Sessions per Browser', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'sessions_per_browser', 'predefined', 'table'),
       ('Time To Render', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'time_to_render', 'predefined', 'areaChart'),
       ('Sessions Impacted by Slow Pages', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'impacted_sessions_by_slow_pages', 'predefined', 'areaChart'),
       ('Memory Consumption', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'memory_consumption', 'predefined', 'areaChart'),
       ('CPU Load', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'cpu', 'predefined', 'areaChart'),
       ('Frame Rate', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'fps', 'predefined', 'areaChart'),
       ('Crashes', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'crashes', 'predefined', 'areaChart'),
       ('Resources Loaded vs Visually Complete', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'resources_vs_visually_complete', 'predefined', 'areaChart'),
       ('DOM Build Time', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'pages_dom_buildtime', 'predefined', 'areaChart'),
       ('Pages Response Time', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'pages_response_time', 'predefined', 'areaChart'),
       ('Pages Response Time Distribution', 'performance', '{"col":2,"row":2,"position":0}', true, true, true, 'pages_response_time_distribution', 'predefined', 'barChart'),

       ('Missing Resources', 'resources', '{"col":2,"row":2,"position":0}', true, true, true, 'missing_resources', 'predefined', 'table'),
       ('Slowest Resources', 'resources', '{"col":4,"row":2,"position":0}', true, true, true, 'slowest_resources', 'predefined', 'table'),
       ('Resources Fetch Time', 'resources', '{"col":2,"row":2,"position":0}', true, true, true, 'resources_loading_time', 'predefined', 'table'),
       ('Resource Loaded vs Response End', 'resources', '{"col":2,"row":2,"position":0}', true, true, true, 'resource_type_vs_response_end', 'predefined', 'stackedBarLineChart'),
       ('Breakdown of Loaded Resources', 'resources', '{"col":2,"row":2,"position":0}', true, true, true, 'resources_count_by_type', 'predefined', 'stackedBarChart')
ON CONFLICT (predefined_key) DO UPDATE
    SET name=excluded.name,
        category=excluded.category,
        default_config=excluded.default_config,
        is_predefined=excluded.is_predefined,
        is_template=excluded.is_template,
        is_public=excluded.is_public,
        metric_type=excluded.metric_type,
        view_type=excluded.view_type;