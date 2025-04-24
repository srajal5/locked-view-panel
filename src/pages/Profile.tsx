
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Admin Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Email</h3>
            <p className="text-muted-foreground">admin@example.com</p>
          </div>
          <div>
            <h3 className="font-medium">Role</h3>
            <p className="text-muted-foreground">Administrator</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Profile;
