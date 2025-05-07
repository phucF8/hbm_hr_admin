using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;

public class FirebaseNotificationService
{
    private readonly ILogger<FirebaseNotificationService> _logger;

    public FirebaseNotificationService(ILogger<FirebaseNotificationService> logger)
    {
        _logger = logger;
        InitializeFirebase();
    }

    private void InitializeFirebase()
    {
        if (FirebaseApp.DefaultInstance == null)
        {
            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromFile("appsettings/serviceAccountKey.json")
            });
        }
    }

    public async Task<bool> SendNotificationAsync(string deviceToken, string title, string body, object data = null)
    {
        try
        {
            var message = new Message()
            {
                Token = deviceToken,
                Notification = new FirebaseAdmin.Messaging.Notification
                {
                    Title = title,
                    Body = body,
                    // Badge is not supported directly in Notification, consider adding it to Data if needed
                },
                Data = data != null ? (System.Collections.Generic.Dictionary<string, string>)data : new System.Collections.Generic.Dictionary<string, string>
                {
                    { "badge", "3" } // Add badge as part of the data payload
                }
            };

            string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
            _logger.LogInformation($"Successfully sent message: {response}");

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending FCM notification: {ex.Message}");
            return false;
        }
    }


    public async Task<bool> SendNotificationAsync(List<string> deviceTokens, string title, string body, object data = null)
    {
        try
        {
            var message = new Message()
            {
                Notification = new FirebaseAdmin.Messaging.Notification
                {
                    Title = title,
                    Body = body
                },
                Data = data != null ? (System.Collections.Generic.Dictionary<string, string>)data : null
            };

            var messages = deviceTokens.Select(token => new Message
            {
                Token = token,
                Notification = message.Notification,
                Data = message.Data
            }).ToList();

            // Gửi thông báo cho tất cả các tokens sử dụng SendEachAsync
            var response = await FirebaseMessaging.DefaultInstance.SendEachAsync(messages);

            if (response.SuccessCount > 0)
            {
                return true;
            }
            else
            {
                _logger.LogWarning($"Failed to send message to {response.FailureCount} devices.");
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending FCM notification: {ex.Message}");
            return false;
        }
    }



    public async Task<bool> TestNotificationAsync(string deviceToken, string title, string body, int badge)
    {
        try
        {
            var message = new Message()
            {
                Token = deviceToken,
                Notification = new FirebaseAdmin.Messaging.Notification
                {
                    Title = title,
                    Body = body
                },
                Apns = new ApnsConfig
                {
                    Aps = new Aps
                    {
                        Badge = badge,
                        ContentAvailable = true,
                        Sound = "default"
                    }
                },
                Data = new Dictionary<string, string> {
                    { "custom_key", "value" }
                }
            };
            string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
            _logger.LogInformation($"Successfully sent message: {response}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending FCM notification: {ex.Message}");
            return false;
        }
    }





}
