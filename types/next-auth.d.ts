// The GitHub account id rides in the session so every admin check can re-test it against the allowlist
declare module "next-auth" {
  interface Session {
    githubId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubId?: string;
  }
}

export {};
