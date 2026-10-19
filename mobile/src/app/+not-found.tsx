import { Stack } from "expo-router";
import { Button, Notice, Screen } from "@/ui/components";

/** A link that points nowhere inside the app. */
export default function NotFound() {
  return (
    <Screen>
      <Stack.Screen options={{ title: "Not found" }} />
      <Notice title="That page is not in the app" body="The link may be old or mistyped.">
        <Button label="Go to Home" variant="dark" href="/" />
      </Notice>
    </Screen>
  );
}
