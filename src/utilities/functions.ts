import { supabaseServiceRoleClient } from "./supabaseClient";

export const transactionStatusColor = (status: string) => {
  switch (status) {
    case "Credit":
      return "green";
    case "Debit":
      return "red";
    case "Requested":
      return "#002244";
    case "Approved":
      return "green";
    default:
      return "grey";
  }
};

export const banUser = async (userId: string, banDuration: string) => {
  const result = await supabaseServiceRoleClient.auth.admin.updateUserById(
    userId,
    { ban_duration: banDuration }
  );
  return result;
};
