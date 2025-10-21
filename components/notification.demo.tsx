import {
  Notification,
  NotificationCancel,
  NotificationContent,
  NotificationTrigger,
} from "./notification";

export function NotificationDemo() {
  return (
    <Notification
      className="right-5 bottom-5 z-50 max-w-xs text-sm"
      slideContentFrom="bottom"
    >
      <NotificationTrigger>
        <h3 className="font-medium">Nexus raises $40M Series B 🎉</h3>
        <p className="mt-1 text-xs">
          Fueling the future of social identity and agent-driven play.
        </p>
      </NotificationTrigger>
      <NotificationContent className="max-h-(--container-xs)">
        The new funding, led by Aurora Ventures and Vector Capital, will help us
        advance agent identity, expand cross-world integrations, and elevate the
        creator experience across the Nexus ecosystem.
      </NotificationContent>
      <NotificationCancel />
    </Notification>
  );
}
