import { cn } from "../../lib/utils";

const Button = ({ className, variant = "default", size = "default", ...props }) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-blue transition-all duration-300 hover:shadow-neon-blue hover:scale-105",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_5px_#ff073a,0_0_20px_#ff073a] transition-all duration-300 hover:shadow-[0_0_10px_#ff073a,0_0_30px_#ff073a] hover:scale-105",
    outline: "border-2 border-neon-blue bg-background hover:bg-neon-blue/10 hover:text-neon-blue transition-all duration-300",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-neon-purple transition-all duration-300 hover:shadow-neon-purple hover:scale-105",
    ghost: "hover:bg-accent hover:text-accent-foreground transition-all duration-300",
    link: "text-neon-blue underline-offset-4 hover:underline text-glow-blue transition-all duration-300",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

export default Button;
