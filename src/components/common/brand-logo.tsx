import { Pizza } from "lucide-react";

const BrandLogo = () => {
  return (
    <div className='flex items-center gap-2'>
      <div className='h-8 w-8 rounded bg-gradient-to-r from-orange-400 to-rose-600 flex items-center justify-center'>
        <span className='text-white font-bold text-sm'><Pizza/></span>
      </div>
      <span className='text-xl font-bold'>Food Forum</span>
    </div>
  );
};

export default BrandLogo;
