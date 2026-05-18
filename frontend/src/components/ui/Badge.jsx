import { cn } from "../../lib/utils";

const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-neon-blue transition-all duration-300",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-neon-purple transition-all duration-300",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-[0_0_5px_#ff073a,0_0_20px_#ff073a] transition-all duration-300",
    outline: "text-foreground border-2 border-neon-blue/50 hover:border-neon-blue transition-all duration-300",
    success: "border-transparent bg-neon-green text-black hover:bg-neon-green/80 shadow-neon-green transition-all duration-300",
    warning: "border-transparent bg-neon-yellow text-black hover:bg-neon-yellow/80 shadow-[0_0_5px_#ffff00,0_0_20px_#ffff00] transition-all duration-300",
    info: "border-transparent bg-neon-blue text-black hover:bg-neon-blue/80 shadow-neon-blue transition-all duration-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export default Badge;
