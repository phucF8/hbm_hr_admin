CREATE TABLE UserErrorReport  (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100),
    TenNhanVien NVARCHAR(200),
    ApiUrl NVARCHAR(500),
    RequestJson NVARCHAR(MAX),
    ResponseJson NVARCHAR(MAX),
    VersionApp NVARCHAR(50),
    Device NVARCHAR(50), -- Ví dụ: iPhone, Android, Web, v.v.
    CreatedAt DATETIME DEFAULT GETDATE()
);

