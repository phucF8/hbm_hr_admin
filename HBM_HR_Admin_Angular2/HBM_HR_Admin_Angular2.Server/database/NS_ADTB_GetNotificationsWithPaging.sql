IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_GetNotificationsWithPaging')
    DROP PROCEDURE NS_ADTB_GetNotificationsWithPaging;
GO

CREATE PROCEDURE NS_ADTB_GetNotificationsWithPaging
    @PageNumber INT,
    @PageSize INT,
    @NotificationType INT,
    @LoaiThongBao VARCHAR(8),
    @SortBy NVARCHAR(50) = 'NgayTao',
    @SearchText NVARCHAR(255) = '',
    @SentStatus INT = NULL,
    @Platform VARCHAR(10) = NULL,
    @FromDate DATE = NULL,
    @ToDate DATE = NULL,
    @FromSentDate DATE = NULL,
    @ToSentDate DATE = NULL,
    @IsSentToAll INT = NULL,
    @NgTaoIds NVARCHAR(MAX) = NULL,
    @NguoiNhanIds NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @PageNumber < 1 SET @PageNumber = 1;

    DECLARE @SortColumn NVARCHAR(50) = 
        CASE LOWER(@SortBy)
            WHEN 'ngaytao' THEN 'NgayTao'
            WHEN 'title' THEN 'Title'
            ELSE 'NgayTao'
        END;

    DECLARE @FromDateTime DATETIME = NULL;
    DECLARE @ToDateTime DATETIME = NULL;
    IF @FromDate IS NOT NULL
        SET @FromDateTime = DATEADD(DAY, 0, CAST(@FromDate AS DATETIME));
    IF @ToDate IS NOT NULL
        SET @ToDateTime = DATEADD(MILLISECOND, -3, DATEADD(DAY, 1, CAST(@ToDate AS DATETIME)));

    -- Tách danh sách người tạo
    DECLARE @NgTaoTable TABLE (NguoiTao NVARCHAR(50));
    IF @NgTaoIds IS NOT NULL AND LTRIM(RTRIM(@NgTaoIds)) <> ''
    BEGIN
        DECLARE @Pos INT = 0, @NextPos INT, @Value NVARCHAR(50)
        WHILE @Pos <= LEN(@NgTaoIds)
        BEGIN
            SET @NextPos = CHARINDEX(',', @NgTaoIds, @Pos + 1)
            IF @NextPos = 0 SET @NextPos = LEN(@NgTaoIds) + 1
            SET @Value = LTRIM(RTRIM(SUBSTRING(@NgTaoIds, @Pos + 1, @NextPos - @Pos - 1)))
            IF @Value <> '' INSERT INTO @NgTaoTable (NguoiTao) VALUES (@Value)
            SET @Pos = @NextPos
        END
    END

    -- Tách danh sách người nhận
    DECLARE @NguoiNhanTable TABLE (NguoiNhan NVARCHAR(50));
    IF @NguoiNhanIds IS NOT NULL AND LTRIM(RTRIM(@NguoiNhanIds)) <> ''
    BEGIN
        DECLARE @Pos2 INT = 0, @NextPos2 INT, @Value2 NVARCHAR(50)
        WHILE @Pos2 <= LEN(@NguoiNhanIds)
        BEGIN
            SET @NextPos2 = CHARINDEX(',', @NguoiNhanIds, @Pos2 + 1)
            IF @NextPos2 = 0 SET @NextPos2 = LEN(@NguoiNhanIds) + 1
            SET @Value2 = LTRIM(RTRIM(SUBSTRING(@NguoiNhanIds, @Pos2 + 1, @NextPos2 - @Pos2 - 1)))
            IF @Value2 <> '' INSERT INTO @NguoiNhanTable (NguoiNhan) VALUES (@Value2)
            SET @Pos2 = @NextPos2
        END
    END

    ;WITH CTE AS (
        SELECT 
            v.ID,
            v.Title,
            v.Content,
            v.NotificationType,
            v.LoaiThongBao,
            v.NotificationStatus AS Status,
            v.Platform,
            v.NgayTao,
            v.NguoiTao,
            v.TenNguoiTao,
            v.AnhNguoiTao,
            v.NguoiNhan,
            v.TenNguoiNhan,
            v.RecipientStatus,
            ROW_NUMBER() OVER (ORDER BY 
                CASE WHEN @SortColumn = 'NgayTao' THEN NgayTao END DESC
            ) AS RowNum
        FROM v_NotificationsWithRecipients v
        WHERE 
            (@NotificationType = 0 OR v.NotificationType = @NotificationType)
            AND (@LoaiThongBao IS NULL OR v.LoaiThongBao = @LoaiThongBao)
            AND (@SentStatus IS NULL OR v.RecipientStatus = @SentStatus)
            AND (@Platform IS NULL OR v.Platform = @Platform)
            AND (@FromDateTime IS NULL OR v.NgayTao >= @FromDateTime)
            AND (@ToDateTime IS NULL OR v.NgayTao <= @ToDateTime)
            AND (
                @SearchText = '' OR 
                v.Title LIKE '%' + @SearchText + '%' OR 
                v.Content LIKE '%' + @SearchText + '%'
            )
            AND (
                @NgTaoIds IS NULL
                OR EXISTS (SELECT 1 FROM @NgTaoTable t WHERE t.NguoiTao = v.NguoiTao)
            )
            AND (
                @NguoiNhanIds IS NULL
                OR EXISTS (SELECT 1 FROM @NguoiNhanTable t WHERE t.NguoiNhan = v.NguoiNhan)
            )
    )
    SELECT 
        ID,
        Title,
        Content,
        NotificationType,
        LoaiThongBao,
        Status,
        Platform,
        NgayTao,
        NguoiTao,
        TenNguoiTao,
        AnhNguoiTao,
        NguoiNhan,
        TenNguoiNhan,
        RecipientStatus,
        (SELECT COUNT(*) FROM CTE) AS TotalCount,
        CEILING(CAST((SELECT COUNT(*) FROM CTE) AS FLOAT) / @PageSize) AS TotalPages
    FROM CTE
    WHERE RowNum BETWEEN (@PageNumber - 1) * @PageSize + 1 AND @PageNumber * @PageSize
    ORDER BY RowNum;
END;
GO

--
EXEC NS_ADTB_GetNotificationsWithPaging
    @PageNumber = 1,
    @PageSize = 10,
    @NotificationType = 0,
    @LoaiThongBao = NULL,              -- <<< bổ sung dòng này
    @SortBy = N'ngayTao',
    @SearchText = N'công văn',
    @SentStatus = NULL,
	@Platform = 'MB',
    @FromDate = '2024-01-01',
    @ToDate = '2025-04-30',
    @FromSentDate = NULL,
    @ToSentDate = NULL,
    @NgTaoIds = N'ADCA206DB08F45DE,cb63de21690349bc'  -- danh sách ID người tạo


