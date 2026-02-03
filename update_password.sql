USE huffadz_jatim;
UPDATE users SET password = '$2b$10$qvbwjGOI47DVXjroPWW6Lew2AmmMoEcXNHHJE8Q5O8qfHigqr4SAW' WHERE email = 'hakimarx@gmail.com';
SELECT id, email, role FROM users WHERE email = 'hakimarx@gmail.com';
