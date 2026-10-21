import { CharStatus } from "../../lib/statuses";
import { cn } from "../../lib/utils";
import { useEffect, useState } from "react";

type Props = {
  value?: string;
  status?: CharStatus;
  isRevealing?: boolean;
  animationDelay?: number;
};

export const Cell = ({ value, status, isRevealing = false, animationDelay = 0 }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFinalState, setShowFinalState] = useState(!isRevealing);

  useEffect(() => {
    if (isRevealing) {
      // 重置状态
      setIsFlipped(false);
      setShowFinalState(false);
      
      const timer = setTimeout(() => {
        setIsFlipped(true);
        // 在翻转中途切换到最终状态
        setTimeout(() => {
          setShowFinalState(true);
          setTimeout(() => {
            setIsFlipped(false);
          }, 250);
        }, 250);
      }, animationDelay);

      return () => clearTimeout(timer);
    } else {
      // 非动画状态时，直接显示最终状态
      setShowFinalState(true);
      setIsFlipped(false);
    }
  }, [isRevealing, animationDelay]);

  const baseClasses = "w-14 h-14 border-solid border-2 flex items-center justify-center mx-0.5 text-lg md:text-xl lg:text-2xl font-bold rounded relative transition-all duration-500 transform-gpu select-none cursor-default grid-cell";
  
  const frontClasses = cn(
    baseClasses,
    "bg-white border-slate-200",
    isFlipped && "rotateX-90"
  );

  const backClasses = cn(
    baseClasses,
    "absolute inset-0",
    !status && "bg-white border-slate-200",
    status === "absent" && "bg-primary-gray text-white border-primary-gray",
    status === "correct" && "bg-primary-green text-white border-primary-green",
    status === "present" && "bg-primary-yellow text-white border-primary-yellow",
    !isFlipped ? "rotateX-90" : "rotateX-0"
  );

  const staticClasses = cn(
    baseClasses,
    !status && "bg-white border-slate-200",
    status === "absent" && "bg-primary-gray text-white border-primary-gray",
    status === "correct" && "bg-primary-green text-white border-primary-green",
    status === "present" && "bg-primary-yellow text-white border-primary-yellow"
  );

  if (!isRevealing) {
    return <div className={staticClasses}>{value}</div>;
  }

  return (
    <div className="relative w-14 h-14 mx-0.5" style={{ perspective: "1000px" }}>
      {!showFinalState ? (
        <div className={frontClasses}>
          {value}
        </div>
      ) : null}
      {showFinalState ? (
        <div className={backClasses}>
          {value}
        </div>
      ) : null}
      
      {/* 背景扩散动画效果 */}
      {isRevealing && status && showFinalState && (
        <div 
          className={cn(
            "absolute inset-0 rounded",
            status === "absent" && "bg-primary-gray",
            status === "correct" && "bg-primary-green", 
            status === "present" && "bg-primary-yellow"
          )}
          style={{
            animation: `bgExpand 0.4s ease-out forwards`,
            transformOrigin: "center",
            zIndex: -1
          }}
        />
      )}
    </div>
  );
};
