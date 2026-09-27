import { ContactsList } from "@/components/contacts/ContactsList";

export default function ContactsPage() {
  return (
    <div className="flex w-full h-full">
      <ContactsList />
      <div className="flex-1 hidden md:flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle">
            <span className="text-4xl">📒</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Your Contacts</h2>
          <p className="text-text-muted text-sm max-w-sm">
            Select a contact to view their profile or start a new conversation.
          </p>
        </div>
      </div>
    </div>
  );
}
