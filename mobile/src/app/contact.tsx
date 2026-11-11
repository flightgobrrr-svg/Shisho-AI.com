import { Linking } from "react-native";
import { Headline, Screen, T, TextButton } from "@/ui/components";

/**
 * The website's /contact. The address comes from EXPO_PUBLIC_CONTACT_EMAIL,
 * matching the website's NEXT_PUBLIC_CONTACT_EMAIL: never a mailbox nobody
 * reads. Until it is set, the screen says so plainly, as the website does.
 */
const EMAIL = process.env.EXPO_PUBLIC_CONTACT_EMAIL;

export default function Contact() {
  return (
    <Screen>
      <T v="label" tone="indigo">Shisho AI</T>
      <Headline text="Contact" />
      <T tone="soft">Questions about the product, your account, your data or a refund.</T>
      {EMAIL ? (
        <>
          <T tone="soft">Write to</T>
          <TextButton label={EMAIL} onPress={() => void Linking.openURL(`mailto:${EMAIL}`)} />
          <T v="small" tone="soft">Say what the question is about and, for account requests, the email address on the account.</T>
        </>
      ) : (
        <T tone="soft">Contact details will appear here before launch.</T>
      )}
      <T v="small" tone="soft">Shisho AI cannot give legal advice by email either. For advice on your own matter, speak to an advocate.</T>
    </Screen>
  );
}
