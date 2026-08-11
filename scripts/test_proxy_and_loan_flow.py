#!/usr/bin/env python3
"""
Integration Verification Test for hausbibliothek.org behind Caddy Reverse Proxy:
1. Reverse Proxy X-Forwarded-* Header Trust
2. Session Cookie Flags (Secure, HttpOnly, SameSite=Lax)
3. Login & Logout Roundtrip over HTTPS Simulation
4. Full Loan & Return Flow (Ausleih- und Rückgabe-Prozess)
"""

import subprocess
import urllib.request
import urllib.parse
import json

def run_db_query(sql):
    cmd = [
        'docker', 'exec', '-i', 'library_db',
        'mysql', '--default-character-set=utf8mb4', '-uroot', '-pAljO2D1aBnyb4sQ0',
        'library_db', '-e', sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return res.stdout.strip()

def get_backend_ip():
    cmd = ['docker', 'inspect', '-f', '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}', 'library_backend']
    return subprocess.run(cmd, capture_output=True, text=True, check=True).stdout.strip()

def setup_test_user():
    print("🔧 Setting up test member in MySQL library_db...")
    php_cmd = ['docker', 'exec', '-i', 'library_backend', 'php', '-r', 'echo password_hash("TestPassword2026!", PASSWORD_DEFAULT);']
    pass_hash = subprocess.run(php_cmd, capture_output=True, text=True, check=True).stdout.strip()

    sql = f"""
    INSERT INTO users (name, email, password_hash, phone, fee_paid, is_blocked, role) 
    VALUES ('Proxy Test Member', 'proxy_test@sprachcafe-polnisch.org', '{pass_hash}', '030123456', 1, 0, 'member')
    ON DUPLICATE KEY UPDATE password_hash='{pass_hash}', fee_paid=1, is_blocked=0;
    """
    run_db_query(sql)
    print("✓ Test member 'proxy_test@sprachcafe-polnisch.org' ready.")

def run_verification():
    setup_test_user()
    
    backend_ip = get_backend_ip()
    base_url = f"http://{backend_ip}:80/api"
    
    headers_base = {
        'Host': 'hausbibliothek.org',
        'X-Forwarded-Proto': 'https',
        'X-Forwarded-Host': 'hausbibliothek.org',
        'X-Forwarded-For': '203.0.113.195',
        'Origin': 'https://hausbibliothek.org',
        'Content-Type': 'application/json'
    }

    print("\n--------------------------------------------------------------------------------")
    print("1. VERIFYING LOGIN & REVERSE PROXY COOKIE FLAGS")
    print("--------------------------------------------------------------------------------")
    
    login_data = json.dumps({
        "email": "proxy_test@sprachcafe-polnisch.org",
        "password": "TestPassword2026!"
    }).encode('utf-8')

    req = urllib.request.Request(f"{base_url}/auth/login", data=login_data, headers=headers_base, method='POST')
    
    phpsessid = None
    with urllib.request.urlopen(req) as resp:
        resp_body = json.loads(resp.read().decode('utf-8'))
        cookie_headers = resp.headers.get_all('Set-Cookie', [])
        
        print(f"✓ Login HTTP Status: {resp.status}")
        print(f"✓ Login Response User: {resp_body.get('user', {}).get('name')}")
        print(f"✓ Set-Cookie Headers ({len(cookie_headers)}): {cookie_headers}")

        last_cookie_header = cookie_headers[-1] if cookie_headers else ""
        assert "PHPSESSID=" in last_cookie_header, "PHPSESSID cookie missing!"
        assert "secure" in last_cookie_header.lower(), "Secure flag missing in Set-Cookie!"
        assert "httponly" in last_cookie_header.lower(), "HttpOnly flag missing in Set-Cookie!"
        assert "samesite=lax" in last_cookie_header.lower(), "SameSite=Lax flag missing in Set-Cookie!"
        
        # Extract session ID from cookie header
        phpsessid = last_cookie_header.split('PHPSESSID=')[1].split(';')[0]

        csrf_token = resp_body.get('csrfToken')
        user_id = resp_body.get('user', {}).get('id')
        print(f"✓ Active Session Cookie: PHPSESSID={phpsessid}")
        print(f"✓ CSRF Token received: {csrf_token}")
        print(f"✓ User ID: {user_id}")

    session_headers = dict(headers_base)
    session_headers['Cookie'] = f"PHPSESSID={phpsessid}"

    print("\n--------------------------------------------------------------------------------")
    print("2. VERIFYING SESSION PERSISTENCE (/auth/me)")
    print("--------------------------------------------------------------------------------")
    
    req_me = urllib.request.Request(f"{base_url}/auth/me", headers=session_headers, method='GET')
    with urllib.request.urlopen(req_me) as resp:
        me_body = json.loads(resp.read().decode('utf-8'))
        print(f"✓ Authenticated user profile: {me_body.get('user', {}).get('email')}")
        assert me_body.get('user', {}).get('email') == "proxy_test@sprachcafe-polnisch.org"

    print("\n--------------------------------------------------------------------------------")
    print("3. TESTING BORROWING FLOW (POST /loans)")
    print("--------------------------------------------------------------------------------")
    
    # Ensure book 1 is available in DB before test
    run_db_query("UPDATE books SET availability_status = 'available' WHERE id = 1;")
    run_db_query(f"DELETE FROM loans WHERE book_id = 1;")

    borrow_headers = dict(session_headers)
    borrow_headers['X-CSRF-Token'] = csrf_token

    borrow_data = json.dumps({"book_id": 1}).encode('utf-8')
    req_borrow = urllib.request.Request(f"{base_url}/loans", data=borrow_data, headers=borrow_headers, method='POST')

    with urllib.request.urlopen(req_borrow) as resp:
        borrow_resp = json.loads(resp.read().decode('utf-8'))
        print(f"✓ Borrow Response: {borrow_resp.get('message')}")
        print(f"✓ Due Date: {borrow_resp.get('due_date')}")
        assert "successfully borrowed" in borrow_resp.get('message', '').lower()

    # Verify DB state after borrow
    book_status = run_db_query("SELECT availability_status FROM books WHERE id = 1;").split('\n')[-1]
    loan_info = run_db_query(f"SELECT id, status FROM loans WHERE book_id = 1 AND user_id = {user_id} AND status != 'returned';").split('\n')[-1]
    loan_id = int(loan_info.split('\t')[0])

    print(f"✓ DB Book #1 Availability Status: '{book_status}'")
    print(f"✓ DB Active Loan Record ID: {loan_id}")
    assert book_status == 'borrowed', "Book status in DB did not update to 'borrowed'!"

    print("\n--------------------------------------------------------------------------------")
    print("4. TESTING RETURN FLOW (PUT /loans)")
    print("--------------------------------------------------------------------------------")

    return_data = json.dumps({"loan_id": loan_id, "action": "return"}).encode('utf-8')
    req_return = urllib.request.Request(f"{base_url}/loans", data=return_data, headers=borrow_headers, method='PUT')

    with urllib.request.urlopen(req_return) as resp:
        return_resp = json.loads(resp.read().decode('utf-8'))
        print(f"✓ Return Response: {return_resp.get('message')}")
        assert "successfully returned" in return_resp.get('message', '').lower()

    # Verify DB state after return
    book_status_after = run_db_query("SELECT availability_status FROM books WHERE id = 1;").split('\n')[-1]
    loan_status_after = run_db_query(f"SELECT status, return_date FROM loans WHERE id = {loan_id};").split('\n')[-1]

    print(f"✓ DB Book #1 Availability Status After Return: '{book_status_after}'")
    print(f"✓ DB Loan Record Status After Return: {loan_status_after}")
    assert book_status_after == 'available', "Book status in DB did not return to 'available'!"

    print("\n--------------------------------------------------------------------------------")
    print("5. TESTING LOGOUT ROUNDTRIP (/auth/logout)")
    print("--------------------------------------------------------------------------------")

    logout_req = urllib.request.Request(f"{base_url}/auth/logout", data=b'{}', headers=borrow_headers, method='POST')
    with urllib.request.urlopen(logout_req) as resp:
        logout_resp = json.loads(resp.read().decode('utf-8'))
        print(f"✓ Logout Response: {logout_resp.get('message')}")

    # Verify session is unauthenticated now
    try:
        req_unauth = urllib.request.Request(f"{base_url}/auth/me", headers=session_headers, method='GET')
        with urllib.request.urlopen(req_unauth) as resp:
            pass
        print("❌ Error: Session still valid after logout!")
        assert False
    except urllib.error.HTTPError as err:
        print(f"✓ Unauthenticated check passed: HTTP {err.code}")
        assert err.code == 401

    print("\n================================================================================")
    print("🎉 ALL REVERSE PROXY, COOKIE SECURITY & LOAN/RETURN FLOW TESTS PASSED 100%!")
    print("================================================================================\n")

if __name__ == '__main__':
    run_verification()
