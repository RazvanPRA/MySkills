export type MasteryCellProps = {
  /** 0..100, or null when nothing was practised yet (lowest step). */
  percent: number | null;
  /** What the cell shows, already formatted ("72%", "—"). */
  text: string;
  /** "React, Senior: 72%" (design system §9). */
  accessibilityLabel: string;
};
