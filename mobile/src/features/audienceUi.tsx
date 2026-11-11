import { View, type ImageSourcePropType } from "react-native";
import { Card, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import type { Audience } from "@/lib/audiences";

/**
 * Bundled copies of the photos named in lib/audiences.ts, by audience slug.
 * The senior advocate's full-length portrait is cropped to head and torso
 * for the app, so the standard centred crop keeps his face in frame.
 */
export const AUDIENCE_PHOTOS: Record<string, ImageSourcePropType> = {
  "junior-advocates": require("../../assets/audiences/junior-advocates.jpg"),
  "senior-advocates": require("../../assets/audiences/senior-advocates.jpg"),
  corporate: require("../../assets/audiences/corporate.jpg"),
  clerks: require("../../assets/audiences/clerks.jpg"),
  scholars: require("../../assets/audiences/scholars.jpg"),
  judges: require("../../assets/audiences/judges.jpg"),
  lecturers: require("../../assets/audiences/lecturers.jpg"),
  students: require("../../assets/audiences/students.jpg"),
  clat: require("../../assets/audiences/clat.jpg"),
  "judicial-exams": require("../../assets/audiences/judicial-exams.jpg"),
  "court-staff": require("../../assets/audiences/court-staff.jpg"),
  citizens: require("../../assets/audiences/citizens.jpg"),
  advice: require("../../assets/audiences/advice.jpg"),
};


/** The labelled sample card, as on the website: label, "Sample", term and detail rows. */
export function AudienceSample({ audience }: { audience: Audience }) {
  const p = usePalette();
  if (!audience.sample) return null;
  return (
    <Card>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: space.md }}>
        <T v="label" tone="indigo" style={{ flexShrink: 1 }}>{audience.sample.label}</T>
        <T v="label" tone="faint">Sample</T>
      </View>
      {audience.sample.rows.map((row) => (
        <View
          key={row.term}
          style={{ flexDirection: "row", gap: space.md, paddingVertical: space.sm, borderTopWidth: 1, borderTopColor: p.line }}
        >
          <T v="h3" style={{ fontSize: 16, width: "38%" }}>{row.term}</T>
          {row.detail ? <T v="small" tone="soft" style={{ flex: 1 }}>{row.detail}</T> : null}
        </View>
      ))}
      {audience.disclaimer ? <T v="small" tone="soft" style={{ fontStyle: "italic" }}>{audience.disclaimer}</T> : null}
    </Card>
  );
}
