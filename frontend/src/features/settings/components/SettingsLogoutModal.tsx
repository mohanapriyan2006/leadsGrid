import { ConfirmDialog } from "../../leads/components/ConfirmDialog";

type SettingsLogoutModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const SettingsLogoutModal = ({ open, onCancel, onConfirm }: SettingsLogoutModalProps) => {
  return (
    <ConfirmDialog
      open={open}
      title="Log Out"
      description="Are you sure you want to log out of your account?"
      confirmLabel="Yes, Log Out"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
};
