export type RegistrationFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "otp_pending"; email: string }
  | { status: "success" };

export const initialRegistrationFormState: RegistrationFormState = {
  status: "idle",
};

export type OtpFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export const initialOtpFormState: OtpFormState = { status: "idle" };
