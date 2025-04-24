
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { useState } from "react";

const Settings = () => {
  const [phoneNotifications, setPhoneNotifications] = useState(true);

  const handleNotificationChange = (checked: boolean) => {
    setPhoneNotifications(checked);
    // Here you would typically save this preference to a backend
    console.log("Phone notifications set to:", checked);
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-y-2">
              <Label htmlFor="phone-notifications">
                Phone notifications when someone is detected
              </Label>
              <Switch
                id="phone-notifications"
                checked={phoneNotifications}
                onCheckedChange={handleNotificationChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
