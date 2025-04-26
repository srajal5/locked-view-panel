
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bell, Telegram, Blynk, Firebase } from "lucide-react";
import { useState } from "react";

const Settings = () => {
  const [phoneNotifications, setPhoneNotifications] = useState(true);
  const [notificationChannel, setNotificationChannel] = useState("telegram");
  const [credentials, setCredentials] = useState({
    telegram: { botToken: "", chatId: "" },
    blynk: { authToken: "", deviceId: "" },
    firebase: { serverKey: "", deviceToken: "" }
  });

  const handleNotificationChange = (checked: boolean) => {
    setPhoneNotifications(checked);
    console.log("Phone notifications set to:", checked);
  };

  const handleCredentialChange = (
    channel: "telegram" | "blynk" | "firebase",
    field: string,
    value: string
  ) => {
    setCredentials(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [field]: value
      }
    }));
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="max-w-md space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone-notifications">
                Phone notifications when someone is detected
              </Label>
              <Switch
                id="phone-notifications"
                checked={phoneNotifications}
                onCheckedChange={handleNotificationChange}
              />
            </div>

            <div className="space-y-4">
              <Label>Notification Channel</Label>
              <RadioGroup
                value={notificationChannel}
                onValueChange={setNotificationChannel}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="telegram" id="telegram" />
                  <Label htmlFor="telegram" className="flex items-center gap-2">
                    <Telegram className="h-4 w-4" />
                    Telegram
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blynk" id="blynk" />
                  <Label htmlFor="blynk" className="flex items-center gap-2">
                    <Blynk className="h-4 w-4" />
                    Blynk Cloud
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="firebase" id="firebase" />
                  <Label htmlFor="firebase" className="flex items-center gap-2">
                    <Firebase className="h-4 w-4" />
                    Firebase Cloud
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Collapsible open={notificationChannel === "telegram"}>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram-bot-token">Telegram Bot Token</Label>
                  <Input
                    id="telegram-bot-token"
                    value={credentials.telegram.botToken}
                    onChange={(e) => handleCredentialChange("telegram", "botToken", e.target.value)}
                    placeholder="Enter your Telegram bot token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram-chat-id">Telegram Chat ID</Label>
                  <Input
                    id="telegram-chat-id"
                    value={credentials.telegram.chatId}
                    onChange={(e) => handleCredentialChange("telegram", "chatId", e.target.value)}
                    placeholder="Enter your Telegram chat ID"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={notificationChannel === "blynk"}>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="blynk-auth-token">Blynk Auth Token</Label>
                  <Input
                    id="blynk-auth-token"
                    value={credentials.blynk.authToken}
                    onChange={(e) => handleCredentialChange("blynk", "authToken", e.target.value)}
                    placeholder="Enter your Blynk auth token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blynk-device-id">Blynk Device ID</Label>
                  <Input
                    id="blynk-device-id"
                    value={credentials.blynk.deviceId}
                    onChange={(e) => handleCredentialChange("blynk", "deviceId", e.target.value)}
                    placeholder="Enter your Blynk device ID"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={notificationChannel === "firebase"}>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="firebase-server-key">Firebase Server Key</Label>
                  <Input
                    id="firebase-server-key"
                    value={credentials.firebase.serverKey}
                    onChange={(e) => handleCredentialChange("firebase", "serverKey", e.target.value)}
                    placeholder="Enter your Firebase server key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firebase-device-token">Firebase Device Token</Label>
                  <Input
                    id="firebase-device-token"
                    value={credentials.firebase.deviceToken}
                    onChange={(e) => handleCredentialChange("firebase", "deviceToken", e.target.value)}
                    placeholder="Enter your Firebase device token"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
