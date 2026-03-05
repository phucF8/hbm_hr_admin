-- Rollback script cho EventPages table
-- Author: System
-- Created: 2026-03-05
-- Purpose: Xóa bảng EventPages và các index liên quan

-- Drop indexes (nếu tồn tại)
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EventPages_IsActive_StartTime_EndTime' AND object_id = OBJECT_ID('EventPages'))
BEGIN
    DROP INDEX IX_EventPages_IsActive_StartTime_EndTime ON EventPages;
    PRINT 'Dropped index: IX_EventPages_IsActive_StartTime_EndTime';
END

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EventPages_Priority' AND object_id = OBJECT_ID('EventPages'))
BEGIN
    DROP INDEX IX_EventPages_Priority ON EventPages;
    PRINT 'Dropped index: IX_EventPages_Priority';
END

-- Drop table (nếu tồn tại)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'EventPages')
BEGIN
    DROP TABLE EventPages;
    PRINT 'Dropped table: EventPages';
END

PRINT 'Rollback completed successfully.'
GO
