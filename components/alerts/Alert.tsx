type Props = {
  isOpen: boolean;
  message: string;
};

export const Alert = ({ isOpen, message }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div 
        className={`max-w-sm w-full bg-rose-200 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 -translate-y-2 scale-95'
        }`}
      >
        <div className="p-4">
          <p className="text-sm text-center font-medium text-gray-900">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
