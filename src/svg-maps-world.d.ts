declare module "@svg-maps/world" {
  export interface SvgMapLocation {
    id: string; // ISO alpha-2, lowercase (matches our country codes)
    name: string;
    path: string;
  }
  export interface SvgMap {
    label?: string;
    viewBox: string;
    locations: SvgMapLocation[];
  }
  const map: SvgMap;
  export default map;
}
