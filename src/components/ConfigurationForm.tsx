
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CameraIcon, BellRing, MessageCircle, Database } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';

type ConfigFormData = {
  camera_url: string;
  camera_port: string;
  blynk_auth_token: string;
  telegram_bot_token: string;
  telegram_chat_id: string;
  enable_logging: boolean;
};

export function ConfigurationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const defaultValues: ConfigFormData = {
    camera_url: '',
    camera_port: '',
    blynk_auth_token: '',
    telegram_bot_token: '',
    telegram_chat_id: '',
    enable_logging: false,
  };

  const { register, handleSubmit, setValue, watch } = useForm<ConfigFormData>({
    defaultValues,
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data: config, error } = await supabase
          .from('user_configurations')
          .select('*')
          .single();

        if (error) throw error;
        
        if (config) {
          Object.entries(config).forEach(([key, value]) => {
            if (key in defaultValues) {
              setValue(key as keyof ConfigFormData, value);
            }
          });
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
      }
    };

    loadConfig();
  }, [setValue]);

  const onSubmit = async (data: ConfigFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_configurations')
        .upsert([{
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your configuration has been saved.",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraIcon className="h-5 w-5" />
            IP Camera Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="camera_url">Camera HTTP URL</Label>
            <Input
              id="camera_url"
              placeholder="http://192.168.1.100"
              {...register('camera_url')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="camera_port">Camera Port</Label>
            <Input
              id="camera_port"
              placeholder="8080"
              {...register('camera_port')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Blynk Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="blynk_auth_token">Blynk Auth Token</Label>
            <Input
              id="blynk_auth_token"
              type="password"
              {...register('blynk_auth_token')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Telegram Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegram_bot_token">Telegram Bot Token</Label>
            <Input
              id="telegram_bot_token"
              type="password"
              {...register('telegram_bot_token')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram_chat_id">Telegram Chat ID</Label>
            <Input
              id="telegram_chat_id"
              {...register('telegram_chat_id')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Logging Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="enable_logging">Enable Timestamp Logging</Label>
            <Switch
              id="enable_logging"
              checked={watch('enable_logging')}
              onCheckedChange={(checked) => setValue('enable_logging', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </form>
  );
}
