IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_GetNotificationsWithPaging')
    DROP PROCEDURE NS_ADTB_GetNotificationsWithPaging
GO

CREATE PROCEDURE NS_ADTB_GetNotificationsWithPaging
    @PageNumber INT,
    @PageSize INT,
    @NotificationType INT,         -- 0: Lấy tất cả, 1 tự động, 2 chủ động
    @LoaiThongBao VARCHAR(8),
    @SortBy NVARCHAR(50) = 'NgayTao',  -- Tên cột để sắp xếp
    @SearchText NVARCHAR(255) = '',    -- Tìm kiếm tiêu đề hoặc nội dung
    @SentStatus INT = NULL,            -- NULL: Lấy cả hai, 1: Đã gửi, 0: Chưa gửi
	@Platform VARCHAR(10) = NULL,		-- Nền tảng Web, MB//mobile
    @FromDate DATE = NULL,             -- Ngày tạo: từ ngày (bao gồm)
    @ToDate DATE = NULL,               -- Ngày tạo: đến ngày (bao gồm)
    @FromSentDate DATE = NULL,         -- Ngày gửi: từ ngày (bao gồm)
    @ToSentDate DATE = NULL,           -- Ngày gửi: đến ngày (bao gồm)
    @IsSentToAll INT = NULL,           -- NULL: all, 1 Đã hoàn thành, 2 chưa hoàn thành
    @NgTaoIds NVARCHAR(MAX) = NULL     -- Danh sách ID người tạo, ngăn cách bởi dấu phẩy
AS
BEGIN
    SET NOCOUNT ON;
	IF @PageNumber < 1 SET @PageNumber = 1;
    -- Xác định cột sắp xếp hợp lệ
    DECLARE @SortColumn NVARCHAR(50) = 
        CASE LOWER(@SortBy)
            WHEN 'ngaytao' THEN 'NgayTao'
            WHEN 'title' THEN 'Title'
            ELSE 'NgayTao' -- mặc định
        END;
    -- Chuyển đổi ngày thành dạng DATETIME chính xác
    DECLARE @FromDateTime DATETIME = NULL;
    DECLARE @ToDateTime DATETIME = NULL;
    IF @FromDate IS NOT NULL
        SET @FromDateTime = DATEADD(DAY, 0, CAST(@FromDate AS DATETIME)); -- 00:00:00.000
    IF @ToDate IS NOT NULL
        SET @ToDateTime = DATEADD(MILLISECOND, -3, DATEADD(DAY, 1, CAST(@ToDate AS DATETIME))); -- 23:59:59.997
    -- Chuyển danh sách ID người tạo thành bảng
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
    -- Truy vấn chính
    ;WITH CTE AS (
        SELECT 
            [ID],
            [Title],
            [Content],
            [TenNhanVien],        
            [NotificationType],
            [LoaiThongBao],
            [Status],
            [Platform],
            [ReceivedCount],
            [TotalRecipients],
            [NgayTao],
            [NguoiTao],
            COUNT(*) OVER () AS TotalCount
        FROM [HBM_HCNSApp].[dbo].[v_NotificationsWithRecipients] v
        WHERE 
            (@NotificationType = 0 OR NotificationType = @NotificationType)
            AND ((@LoaiThongBao IS NULL OR LoaiThongBao = @LoaiThongBao))
            AND (@SentStatus IS NULL OR Status = @SentStatus)
			AND (@Platform IS NULL OR [Platform] = @Platform)
            AND (@FromDateTime IS NULL OR NgayTao >= @FromDateTime)
            AND (@ToDateTime IS NULL OR NgayTao <= @ToDateTime)
            AND (
                @SearchText = '' OR 
                Title LIKE '%' + @SearchText + '%' OR 
                Content LIKE '%' + @SearchText + '%'
            )
            AND (
                @IsSentToAll IS NULL
                OR (@IsSentToAll = 1 AND ReceivedCount = TotalRecipients)
                OR (@IsSentToAll = 2 AND ReceivedCount <> TotalRecipients)
            )
            AND (
                @NgTaoIds IS NULL
                OR EXISTS (
                    SELECT 1 FROM @NgTaoTable t WHERE t.NguoiTao = v.NguoiTao
                )
            )
    )
    SELECT 
        ID,
        Title,
        Content,
        TenNhanVien,
        NotificationType,
        LoaiThongBao,
        Status,
		Platform,
        ReceivedCount,
        TotalRecipients,
        NgayTao,
        NguoiTao,
        TotalCount,
        CEILING(CAST(TotalCount AS FLOAT) / @PageSize) AS TotalPages
    FROM CTE
    ORDER BY 
        CASE WHEN @SortColumn = 'NgayTao' THEN NgayTao END DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
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


