type AvatarProps = {
  initials: string;
  size?: number;
};

export const Avatar = ({ initials, size = 40 }: AvatarProps) => {
  return (
    <div
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accentSoft to-blue-500 text-white"
      style={{ width: size, height: size, fontSize: size * 0.35, fontWeight: 700 }}
      aria-label={`Avatar ${initials}`}
    >
      {initials}
    </div>
  );
};
