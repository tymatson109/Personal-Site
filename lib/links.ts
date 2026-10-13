// The one place outbound links are built; a null link is hidden until Ty supplies it

export const SITE_LINKS = {
  github: "https://github.com/tymatson109",
  linkedin: null as string | null,
  email: "tymatson109@gmail.com",
  substack: "https://tymatson.substack.com",
} as const;

export function mailto(address: string): string {
  return `mailto:${address}`;
}

export function substackSubscribe(base: string): string {
  return `${base.replace(/\/$/, "")}/subscribe`;
}
