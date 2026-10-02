<?php
/**
 * Jetpack Historical Statistics Exporter for SprachCafé Polnisch e.V.
 *
 * Extracts historical stats from Automattic Jetpack API via WordPress Blog Token:
 * - 2+ Years Daily & Monthly Web Traffic (Views)
 * - Top Visited Pages & Blog Posts
 * - Inbound Referrers & Traffic Channels (Google, Social, Newsletters)
 * - Outbound Clicks (SharePoint, Forms, Eventbrite, Downloads)
 */

if (!defined('ABSPATH')) {
    exit;
}

require_once WP_PLUGIN_DIR . '/jetpack/jetpack.php';

$blog_id = Jetpack_Options::get_option('id');
if (!$blog_id) {
    fwrite(STDERR, "Error: Jetpack blog ID not found.\n");
    exit(1);
}

function fetch_jetpack_csv($table, $blog_id, $days = 730, $limit = 50) {
    $url = "https://stats.wordpress.com/csv.php?table={$table}&blog_id={$blog_id}&days={$days}&limit={$limit}";
    $res = \Automattic\Jetpack\Connection\Client::remote_request([
        'url' => $url,
        'method' => 'GET',
        'timeout' => 90,
        'user_id' => 0,
    ]);

    if (is_wp_error($res)) {
        fwrite(STDERR, "WP Error fetching {$table}: " . $res->get_error_message() . "\n");
        return [];
    }

    $body = wp_remote_retrieve_body($res);
    if (empty($body)) {
        return [];
    }

    $lines = explode("\n", trim($body));
    if (count($lines) < 2) {
        return [];
    }

    $headers = str_getcsv(array_shift($lines));
    $rows = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '') continue;
        $row = str_getcsv($line);
        if (count($row) === count($headers)) {
            $rows[] = array_combine($headers, $row);
        }
    }
    return $rows;
}

// 1. Fetch Views (up to 1100 days to capture late 2023 onwards)
$views_rows = fetch_jetpack_csv('views', $blog_id, 1100, -1);

$daily_views = [];
$monthly_views = [];
$yearly_views = [];
$total_all_time = 0;

foreach ($views_rows as $r) {
    $date = $r['date'] ?? '';
    $cnt = (int)($r['views'] ?? 0);
    if (!$date) continue;

    $daily_views[$date] = $cnt;
    $total_all_time += $cnt;

    $ym = substr($date, 0, 7); // "YYYY-MM"
    $yr = substr($date, 0, 4); // "YYYY"

    if (!isset($monthly_views[$ym])) {
        $monthly_views[$ym] = ['jahrMonat' => $ym, 'jahr' => (int)$yr, 'views' => 0, 'days' => 0];
    }
    $monthly_views[$ym]['views'] += $cnt;
    $monthly_views[$ym]['days']++;

    if (!isset($yearly_views[$yr])) {
        $yearly_views[$yr] = 0;
    }
    $yearly_views[$yr] += $cnt;
}

ksort($monthly_views);
$monthly_list = array_values($monthly_views);

// 2. Fetch Postviews (2 Years / 730 days)
$postviews_rows = fetch_jetpack_csv('postviews', $blog_id, 730, 50);

$posts_map = [];
foreach ($postviews_rows as $r) {
    $date = $r['date'] ?? '';
    $post_id = (int)($r['post_id'] ?? 0);
    $raw_title = trim($r['post_title'] ?? '');
    $permalink = trim($r['post_permalink'] ?? '');
    $cnt = (int)($r['views'] ?? 0);
    $yr = substr($date, 0, 4);

    $key = $permalink ?: "post_{$post_id}";
    if (!isset($posts_map[$key])) {
        $title = $raw_title;
        if (empty($title)) {
            if ($permalink === 'https://sprachcafe-polnisch.org/' || $permalink === 'http://sprachcafe-polnisch.org/') {
                $title = 'Startseite (Homepage)';
            } elseif ($post_id > 0) {
                $db_title = get_the_title($post_id);
                $title = $db_title ?: basename(parse_url($permalink, PHP_URL_PATH));
            }
        }
        $posts_map[$key] = [
            'postId' => $post_id,
            'title' => $title ?: 'Seite #' . $post_id,
            'url' => $permalink,
            'viewsTotal' => 0,
            'views2026' => 0,
            'views2025' => 0,
            'views2024' => 0,
            'viewsByMonth' => []
        ];
    }

    $posts_map[$key]['viewsTotal'] += $cnt;
    if ($yr === '2026') $posts_map[$key]['views2026'] += $cnt;
    elseif ($yr === '2025') $posts_map[$key]['views2025'] += $cnt;
    elseif ($yr === '2024') $posts_map[$key]['views2024'] += $cnt;

    $ym = substr($date, 0, 7);
    if (!isset($posts_map[$key]['viewsByMonth'][$ym])) {
        $posts_map[$key]['viewsByMonth'][$ym] = 0;
    }
    $posts_map[$key]['viewsByMonth'][$ym] += $cnt;
}

usort($posts_map, function($a, $b) {
    return $b['viewsTotal'] <=> $a['viewsTotal'];
});
$top_posts = array_slice($posts_map, 0, 30);

// 3. Fetch Referrers (2 Years / 730 days)
$referrers_rows = fetch_jetpack_csv('referrers', $blog_id, 730, 50);

$channel_totals = [
    'Google Suche & Apps' => 0,
    'Facebook' => 0,
    'Instagram' => 0,
    'Newsletter & E-Mail (Mailchimp/Gmail)' => 0,
    'Microsoft & Bing' => 0,
    'Partnernetzwerke & Lokales' => 0,
    'Direkt / Andere Quellen' => 0
];

$domain_map = [];

foreach ($referrers_rows as $r) {
    $date = $r['date'] ?? '';
    $ref = trim($r['referrer'] ?? '');
    $cnt = (int)($r['views'] ?? 0);
    $yr = substr($date, 0, 4);

    $host = parse_url($ref, PHP_URL_HOST) ?: $ref;
    $host = preg_replace('/^www\./', '', strtolower($host));
    if ($host === 'android-app' || stripos($ref, 'android.gm') !== false) {
        $host = 'mail.google.com (Gmail App)';
    }

    if (!isset($domain_map[$host])) {
        $domain_map[$host] = [
            'domain' => $host,
            'exampleUrl' => $ref,
            'viewsTotal' => 0,
            'views2026' => 0,
            'views2025' => 0
        ];
    }
    $domain_map[$host]['viewsTotal'] += $cnt;
    if ($yr === '2026') $domain_map[$host]['views2026'] += $cnt;
    elseif ($yr === '2025') $domain_map[$host]['views2025'] += $cnt;

    // Channel categorization
    if (stripos($ref, 'campaign-archive') !== false || stripos($ref, 'mailchimp') !== false || stripos($ref, 'list-manage') !== false || stripos($ref, 'poczta') !== false || stripos($ref, 'mail.google') !== false || stripos($ref, 'webmail') !== false || stripos($ref, 'android.gm') !== false) {
        $channel_totals['Newsletter & E-Mail (Mailchimp/Gmail)'] += $cnt;
    } elseif (stripos($ref, 'google') !== false) {
        $channel_totals['Google Suche & Apps'] += $cnt;
    } elseif (stripos($ref, 'facebook') !== false || stripos($ref, 'fb.me') !== false) {
        $channel_totals['Facebook'] += $cnt;
    } elseif (stripos($ref, 'instagram') !== false) {
        $channel_totals['Instagram'] += $cnt;
    } elseif (stripos($ref, 'bing') !== false || stripos($ref, 'safelinks') !== false || stripos($ref, 'outlook') !== false || stripos($ref, 'msn.com') !== false || stripos($ref, 'live.com') !== false) {
        $channel_totals['Microsoft & Bing'] += $cnt;
    } elseif (stripos($ref, 'berlin') !== false || stripos($ref, 'migrantka') !== false || stripos($ref, 'kulturzug') !== false || stripos($ref, 'poloniaviva') !== false || stripos($ref, 'polacywberlinie') !== false) {
        $channel_totals['Partnernetzwerke & Lokales'] += $cnt;
    } elseif (stripos($ref, 'chatgpt') !== false || stripos($ref, 'openai') !== false) {
        $channel_totals['KI-Assistenten (ChatGPT)'] += $cnt;
    } else {
        $channel_totals['Direkt / Andere Quellen'] += $cnt;
    }
}

usort($domain_map, function($a, $b) {
    return $b['viewsTotal'] <=> $a['viewsTotal'];
});
$top_domains = array_slice($domain_map, 0, 25);

// 4. Fetch Clicks (2 Years / 730 days)
$clicks_rows = fetch_jetpack_csv('clicks', $blog_id, 730, 50);

$click_category_totals = [
    'SharePoint & Anmeldelisten' => 0,
    'Eventbrite Ticket-Buchungen' => 0,
    'Social Media (Instagram/YouTube/FB)' => 0,
    'Downloads (PDF-Kalender/Formulare/Satzung)' => 0,
    'Google Forms' => 0,
    'Externe Partner & Links' => 0
];

$clicks_map = [];

foreach ($clicks_rows as $r) {
    $date = $r['date'] ?? '';
    $target = trim($r['click'] ?? '');
    $cnt = (int)($r['views'] ?? 0);
    $yr = substr($date, 0, 4);

    if (!isset($clicks_map[$target])) {
        // Human label
        $label = $target;
        if (stripos($target, 'sharepoint.com') !== false) {
            $label = 'SharePoint Excel Anmeldeliste';
        } elseif (stripos($target, 'eventbrite') !== false) {
            $path = parse_url($target, PHP_URL_PATH);
            $slug = trim(explode('/tickets-', $path)[0], '/');
            $label = 'Eventbrite: ' . basename($slug);
        } elseif (stripos($target, 'Kalendarz-2025') !== false || stripos($target, 'Kalender') !== false) {
            $label = 'PDF: Jahreskalender 2025/2026';
        } elseif (stripos($target, 'forms.gle') !== false || stripos($target, 'docs.google.com/forms') !== false) {
            $label = 'Google Forms Anmeldung';
        } elseif (stripos($target, 'instagram.com') !== false) {
            $label = 'Instagram SprachCafé Polnisch';
        } elseif (stripos($target, 'youtube.com') !== false) {
            $label = 'YouTube SprachCafé Kanal';
        } elseif (stripos($target, 'facebook.com') !== false) {
            $label = 'Facebook Seite & Gruppe';
        } elseif (preg_match('/\.pdf$/i', $target)) {
            $label = 'PDF Download: ' . basename(parse_url($target, PHP_URL_PATH));
        }

        $clicks_map[$target] = [
            'url' => $target,
            'label' => $label,
            'clicksTotal' => 0,
            'clicks2026' => 0,
            'clicks2025' => 0
        ];
    }

    $clicks_map[$target]['clicksTotal'] += $cnt;
    if ($yr === '2026') $clicks_map[$target]['clicks2026'] += $cnt;
    elseif ($yr === '2025') $clicks_map[$target]['clicks2025'] += $cnt;

    // Categories
    if (stripos($target, 'sharepoint.com') !== false) {
        $click_category_totals['SharePoint & Anmeldelisten'] += $cnt;
    } elseif (stripos($target, 'eventbrite') !== false) {
        $click_category_totals['Eventbrite Ticket-Buchungen'] += $cnt;
    } elseif (stripos($target, 'instagram.com') !== false || stripos($target, 'youtube.com') !== false || stripos($target, 'facebook.com') !== false) {
        $click_category_totals['Social Media (Instagram/YouTube/FB)'] += $cnt;
    } elseif (preg_match('/\.pdf$/i', $target)) {
        $click_category_totals['Downloads (PDF-Kalender/Formulare/Satzung)'] += $cnt;
    } elseif (stripos($target, 'forms.gle') !== false || stripos($target, 'docs.google.com/forms') !== false) {
        $click_category_totals['Google Forms'] += $cnt;
    } else {
        $click_category_totals['Externe Partner & Links'] += $cnt;
    }
}

usort($clicks_map, function($a, $b) {
    return $b['clicksTotal'] <=> $a['clicksTotal'];
});
$top_clicks = array_slice($clicks_map, 0, 25);

// Build final result
$export = [
    'metadata' => [
        'blogId' => (int)$blog_id,
        'source' => 'Automattic Jetpack Stats API (csv.php)',
        'exportedAt' => date('c'),
        'totalAllTimeViews' => $total_all_time,
        'daysRecorded' => count($daily_views),
        'yearlyTotals' => $yearly_views
    ],
    'monthlyViews' => $monthly_list,
    'topPosts' => $top_posts,
    'trafficChannels' => $channel_totals,
    'topReferrers' => $top_domains,
    'clickCategories' => $click_category_totals,
    'topClicks' => $top_clicks
];

echo json_encode($export, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
