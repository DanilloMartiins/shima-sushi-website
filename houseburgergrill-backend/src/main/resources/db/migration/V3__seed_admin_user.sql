INSERT INTO users (
    full_name,
    email,
    password_hash,
    role,
    active
) VALUES (
    '${admin_name}',
    '${admin_email}',
    '$2a$12$8.1V679SJ9Ziy5shs.4pBe9G.n6K/u5C39.vV7V.nFf.nFf.nFf.n',
    'ADMIN',
    TRUE
);
