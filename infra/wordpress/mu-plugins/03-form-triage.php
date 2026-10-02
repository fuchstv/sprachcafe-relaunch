<?php
/**
 * Plugin Name: SprachCafé Form Anti-Spam Triage & Smart Router
 * Description: Multi-level triage for incoming forms. Detects spam (Cyrillic link-spam, SEO pitches, URL shorteners, honeypot), quarantines spam entries with status='spam' in DB, suppresses notification emails for spam, and routes genuine inquiries to kontakt@sprachcafe-polnisch.org with Reply-To set to the sender.
 * Version: 1.0.0
 * Author: SprachCafé Polnisch e.V.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Sprachcafe_Form_Triage {

    const TARGET_EMAIL = 'kontakt@sprachcafe-polnisch.org';

    // Thread-safe request flag for the currently processed submission
    private static $is_current_spam = false;
    private static $current_spam_reasons = [];
    private static $current_sender_email = '';
    private static $current_sender_name = '';

    public static function init() {
        // 1. Triage analysis hook BEFORE actions / notifications fire
        add_action('fluentform/before_form_actions_processing', [__CLASS__, 'analyze_submission'], 5, 3);

        // 2. Suppress notifications if marked as spam
        add_filter('fluentform/global_notification_active_types', [__CLASS__, 'filter_active_notifications'], 999, 2);
        add_filter('fluentform/email_to', [__CLASS__, 'filter_email_recipient'], 999, 4);
        add_filter('fluentform/email_header', [__CLASS__, 'filter_email_headers'], 999, 4);

        // 3. Automated 30-day quarantine cleanup hook
        if (!wp_next_scheduled('sprachcafe_dsgvo_spam_cleanup')) {
            wp_schedule_event(time(), 'daily', 'sprachcafe_dsgvo_spam_cleanup');
        }
        add_action('sprachcafe_dsgvo_spam_cleanup', [__CLASS__, 'cleanup_old_spam_entries']);
    }

    /**
     * Analyze submitted form data for spam characteristics
     */
    public static function analyze_submission($insertId, $formData, $form) {
        self::$is_current_spam = false;
        self::$current_spam_reasons = [];
        self::$current_sender_email = '';
        self::$current_sender_name = '';

        // Extract sender details
        foreach (['your-email', 'email', 'parent-email', 'user_email', 'contact-email'] as $k) {
            if (!empty($formData[$k]) && is_email($formData[$k])) {
                self::$current_sender_email = sanitize_email($formData[$k]);
                break;
            }
        }
        foreach (['your-name', 'name', 'parent-name', 'full_name', 'contact-name'] as $k) {
            if (!empty($formData[$k])) {
                self::$current_sender_name = sanitize_text_field($formData[$k]);
                break;
            }
        }

        // Aggregate text fields for textual analysis
        $text_corpus = '';
        foreach ($formData as $key => $val) {
            if (is_string($val) && !str_starts_with($key, '_')) {
                $text_corpus .= ' ' . $val;
            }
        }

        // --- HEURISTIC 1: Honeypot Trigger ---
        $formId = $form->id ?? 0;
        $hp_keys = ['item_' . $formId . '__fluent_sf', 'website_url', 'hp_check', 'address_confirm'];
        foreach ($hp_keys as $hp) {
            if (isset($formData[$hp]) && !empty($formData[$hp])) {
                self::$is_current_spam = true;
                self::$current_spam_reasons[] = 'Honeypot field filled (' . $hp . ')';
            }
        }

        // --- HEURISTIC 2: Cyrillic / Non-Latin SEO Link-Spam ---
        // Match Cyrillic characters: \p{Cyrillic}
        if (preg_match('/[\x{0400}-\x{04FF}]/u', $text_corpus)) {
            // Check if there are community/German/Polish words or if it's pure Russian marketing
            $has_de_pl_context = preg_match('/\b(sprachcafe|berlin|polnisch|polski|kurs|dzieci|dziecko|niemiec|spotkanie|warsztat|termin|pankow|schöneberg|köpenick|hallo|guten|dzień|dobry|zapraszamy|kontakt)\b/i', $text_corpus);
            if (!$has_de_pl_context) {
                self::$is_current_spam = true;
                self::$current_spam_reasons[] = 'Cyrillic script without community/local context';
            }
        }

        // --- HEURISTIC 3: SEO Shorteners & High Link Density ---
        $shorteners = ['cutt.ly', 'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'rb.gy'];
        foreach ($shorteners as $shortener) {
            if (stripos($text_corpus, $shortener) !== false) {
                self::$is_current_spam = true;
                self::$current_spam_reasons[] = 'Spam URL shortener detected (' . $shortener . ')';
                break;
            }
        }

        // Count URLs in message
        $url_count = preg_match_all('/https?:\/\/[^\s]+/i', $text_corpus);
        if ($url_count >= 2) {
            self::$is_current_spam = true;
            self::$current_spam_reasons[] = 'Excessive URLs (' . $url_count . ')';
        }

        // --- HEURISTIC 4: Commercial SEO & Traffic Pitches ---
        $commercial_spam_patterns = [
            '/7-day free trial/i',
            '/website traffic/i',
            '/adaptive AI handles/i',
            '/ad-platform complexity/i',
            '/guest post/i',
            '/seo audit/i',
            '/ranking on google/i',
            '/crypto|bitcoin|forex/i',
            '/casino|slot machine|betting/i',
            '/viagra|cialis|pharmacy/i'
        ];
        foreach ($commercial_spam_patterns as $pattern) {
            if (preg_match($pattern, $text_corpus)) {
                self::$is_current_spam = true;
                self::$current_spam_reasons[] = 'Commercial spam phrase matched (' . $pattern . ')';
                break;
            }
        }

        // If classified as SPAM, quarantine in database and log
        if (self::$is_current_spam && $insertId) {
            global $wpdb;
            $table = $wpdb->prefix . 'fluentform_submissions';
            $wpdb->update($table, ['status' => 'spam'], ['id' => $insertId]);

            // Add an audit log in Fluent Forms
            do_action('fluentform/log_data', [
                'parent_source_id' => $form->id,
                'source_type'      => 'submission_item',
                'source_id'        => $insertId,
                'component'        => 'SpamTriage',
                'status'           => 'warning',
                'title'            => 'Submission quarantined as SPAM',
                'description'      => 'Reasons: ' . implode('; ', self::$current_spam_reasons)
            ]);
        }
    }

    /**
     * Suppress all notifications if submission is spam
     */
    public static function filter_active_notifications($feedKeys, $formId) {
        if (self::$is_current_spam) {
            // Cancel all feeds/notifications
            return [];
        }
        return $feedKeys;
    }

    /**
     * Ensure email recipient is always kontakt@sprachcafe-polnisch.org
     */
    public static function filter_email_recipient($sendAddresses, $notification, $submittedData, $form) {
        if (self::$is_current_spam) {
            return '';
        }
        return self::TARGET_EMAIL;
    }

    /**
     * Add proper Reply-To header pointing to the genuine sender
     */
    public static function filter_email_headers($headers, $notification, $submittedData, $form) {
        if (!empty(self::$current_sender_email)) {
            $sender = self::$current_sender_name ? self::$current_sender_name . ' <' . self::$current_sender_email . '>' : self::$current_sender_email;
            $headers[] = 'Reply-To: ' . $sender;
        }
        return $headers;
    }

    /**
     * 30-Day DSGVO Spam Quarantine Auto-Cleanup
     */
    public static function cleanup_old_spam_entries() {
        global $wpdb;
        $table = $wpdb->prefix . 'fluentform_submissions';
        $deleted = $wpdb->query("DELETE FROM {$table} WHERE status = 'spam' AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
        if ($deleted) {
            error_log('[SprachCafe Triage] Cleaned up ' . $deleted . ' expired spam submissions.');
        }
    }
}

add_action('plugins_loaded', ['Sprachcafe_Form_Triage', 'init'], 20);
