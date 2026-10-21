import { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { KeyValue } from "../../lib/keyboard";
import { CharStatus } from "../../lib/statuses";

type Props = {
  children?: ReactNode;
  value: KeyValue;
  width?: number;
  status?: CharStatus;
  onClick: (value: KeyValue) => void;
};

export const Key = ({
  children,
  status,
  width = 40,
  value,
  onClick,
}: Props) => {
  const classes = cn(
    "keyboard-key flex items-center justify-center rounded mx-0.5 text-xs md:text-base lg:text-lg font-bold cursor-pointer transition-all duration-200",
    !status && "bg-slate-200 hover:bg-slate-300 active:bg-slate-400",
    status === "absent" && "bg-primary-gray text-white",
    status === "correct" && "bg-primary-green hover:bg-primary-green/80 active:bg-primary-green/90 text-white",
    status === "present" && "bg-primary-yellow hover:bg-primary-yellow/80 active:bg-primary-yellow/90 text-white"
  );

  return (
    <div
      style={{ 
        '--key-width': `${width}px`,
        '--key-width-md': `${Math.round(width * 1.3)}px`,
        '--key-width-lg': `${Math.round(width * 1.6)}px`
      } as React.CSSProperties}
      className={classes}
      onClick={() => onClick(value)}
    >
      {children || value}
    </div>
  );
};
