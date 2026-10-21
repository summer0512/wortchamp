import { Cell } from "./Cell";

type Props = {
  wordLength: number;
};

export const EmptyRow = ({ wordLength }: Props) => {
  return (
    <div className="flex justify-center mb-1">
      {Array.from({ length: wordLength }).map((_, i) => (
        <Cell key={i} />
      ))}
    </div>
  );
};
