import {
  ChatBentoCard,
  type ChatMessageType,
} from "@/components/chat-bento-card";

export function ChatBentoCardDemo() {
  return (
    <div className="border-border bg-card box-content w-full max-w-96 rounded-md border px-1 pt-0">
      <ChatBentoCard
        className="aspect-square"
        viewOptions={{ threshold: 0.75 }}
        messages={messages}
      />
      <div className="p-3">
        <div className="text-card-foreground mb-2 font-medium">
          Chat bento card
        </div>
        <p className="text-muted-foreground text-sm">
          A Bento chat interface card that mimics live chat interactions, great
          for embedding conversational UI demos in a Bento grid.
        </p>
      </div>
    </div>
  );
}

const messages: ChatMessageType[] = [
  {
    type: "outgoing",
    content: (
      <>
        Have you seen <span className="font-medium">100xUI</span>? The motion
        components are truly impressive.
      </>
    ),
  },
  {
    type: "incoming",
    from: "Founder",
    avatarProps: {
      src: "/bento-card-avatar.png",
      fallback: "FO",
    },
    content: (
      <p>
        Agreed. That level of craftsmanship is exactly what we need. We should
        hire its creator for our team.
      </p>
    ),
  },
  {
    type: "outgoing",

    content: <>My thoughts exactly. Let&apos;s make an offer.</>,
  },
  {
    type: "incoming",
    from: "Founder",
    avatarProps: {
      src: "/bento-card-avatar.png",
      fallback: "FO",
    },
    content: <p>Definitely. Get the process started.</p>,
  },
];
