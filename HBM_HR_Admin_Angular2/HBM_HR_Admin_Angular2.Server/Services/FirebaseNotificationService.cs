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
                    Body = body
                },
                Data = data != null ? (System.Collections.Generic.Dictionary<string, string>)data : null
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
