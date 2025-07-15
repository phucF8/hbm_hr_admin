
-- Table: Topics - Voting or Survey topics
CREATE TABLE BB_Topics (
    Id VARCHAR(36) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    StartDate DATETIME NOT NULL,
    EndDate DATETIME NOT NULL,
    CreatedBy VARCHAR(36) NOT NULL,
    UpdatedBy VARCHAR(36) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
EXEC sys.sp_addextendedproperty 
  @name = N'MS_Description', 
  @value = N'Topic info for voting or survey', 
  @level0type = N'SCHEMA', @level0name = dbo, 
  @level1type = N'TABLE', @level1name = N'BB_Topics';

-- Table: Questions - List of questions in each topic
CREATE TABLE BB_Questions (
    Id VARCHAR(36) PRIMARY KEY,
    TopicId VARCHAR(36) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(20) CHECK (Type IN ('SingleChoice', 'MultiChoice', 'Essay')),
    OrderNumber INT,
    CreatedBy VARCHAR(36) NOT NULL,
    UpdatedBy VARCHAR(36) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
EXEC sys.sp_addextendedproperty 
  @name = N'MS_Description', 
  @value = N'Questions in a topic (multiple choice, essay, etc.)', 
  @level0type = N'SCHEMA', @level0name = dbo, 
  @level1type = N'TABLE', @level1name = N'BB_Questions';

-- Table: Options - Options for multiple choice questions
CREATE TABLE BB_Options (
    Id VARCHAR(36) PRIMARY KEY,
    QuestionId VARCHAR(36) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    OrderNumber INT,
    CreatedBy VARCHAR(36) NOT NULL,
    UpdatedBy VARCHAR(36) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
EXEC sys.sp_addextendedproperty 
  @name = N'MS_Description', 
  @value = N'Multiple choice options for questions', 
  @level0type = N'SCHEMA', @level0name = dbo, 
  @level1type = N'TABLE', @level1name = N'BB_Options';

-- Table: UserAnswers - User responses to questions
CREATE TABLE BB_UserAnswers (
    Id VARCHAR(36) PRIMARY KEY,
    UserId VARCHAR(36) NOT NULL,
    QuestionId VARCHAR(36) NOT NULL,
    OptionId VARCHAR(36) NULL,
    EssayAnswer NVARCHAR(MAX),
    AnsweredAt DATETIME DEFAULT GETDATE(),
    CreatedBy VARCHAR(36) NOT NULL,
    UpdatedBy VARCHAR(36) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
EXEC sys.sp_addextendedproperty 
  @name = N'MS_Description', 
  @value = N'User responses (multiple choice or essay)', 
  @level0type = N'SCHEMA', @level0name = dbo, 
  @level1type = N'TABLE', @level1name = N'BB_UserAnswers';












-- Table: NotificationSchedules - Schedules for notifying users
CREATE TABLE BB_NotificationSchedules (
    Id VARCHAR(36) PRIMARY KEY,
    TopicId VARCHAR(36) NOT NULL,
    ScheduledTime DATETIME NOT NULL,
    IsSent BIT DEFAULT 0,
    CreatedBy VARCHAR(36) NOT NULL,
    UpdatedBy VARCHAR(36) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
EXEC sys.sp_addextendedproperty 
  @name = N'MS_Description', 
  @value = N'Schedules for notifying users to vote/survey', 
  @level0type = N'SCHEMA', @level0name = dbo, 
  @level1type = N'TABLE', @level1name = N'BB_NotificationSchedules';
