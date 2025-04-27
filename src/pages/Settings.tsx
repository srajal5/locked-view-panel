
import DashboardLayout from "@/components/DashboardLayout";
import { ConfigurationForm } from "@/components/ConfigurationForm";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <ConfigurationForm />
      </div>
    </DashboardLayout>
  );
};

export default Settings;
