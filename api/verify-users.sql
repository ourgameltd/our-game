-- Verify users in the database
SELECT 
    Id,
    AuthId,
    Email,
    FirstName,
    LastName,
    Role
FROM Users
ORDER BY CreatedAt;
