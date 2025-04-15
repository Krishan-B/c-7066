
import { Switch } from "@/components/ui/switch";

interface NotificationSettingProps {
  title: string;
  description: string;
  defaultChecked?: boolean;
}

export function NotificationSetting({ title, description, defaultChecked = false }: NotificationSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
