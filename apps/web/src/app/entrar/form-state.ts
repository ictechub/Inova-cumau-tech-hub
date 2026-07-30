export type LoginFormState =
  | { status: "idle" }
  | { status: "error"; message: string };

export const initialLoginFormState: LoginFormState = { status: "idle" };
