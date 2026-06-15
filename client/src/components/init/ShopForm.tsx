import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { shopService } from '../../services/shopServices';
import { useNotification,NotificationContainer } from '../../public/Notify';
import { useNavigate } from 'react-router-dom';

const ShopGreetingForm: React.FC = () => {
  const [shopName, setShopName] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const {notify,notifications} = useNotification(); 

  const {user} = useAuth0();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (shopName.trim()) {
      setSubmitted(true);
    }
    createShop();
  };

  const createShop = async ()=>{
    try{
        if(!user?.sub){
            throw Error();
        }
        const result = shopService.createShop(user?.sub,shopName.trim());
        console.log(result);
        setTimeout(()=>{
          navigate('/dashboard');
        },2000);
    }
    catch(error){
        notify('error','Cannot create Shop!');
        setSubmitted(true);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShopName(e.target.value);
    if (submitted) setSubmitted(false);
  };

  console.log(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <NotificationContainer notifications={notifications} />
      <div className="w-full max-w-md">
        {/* Greeting Card */}
        <div className=" backdrop-blur-sm rounded-4xl  p-8 border border-white/20 transition-all duration-300 ">
          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome to <span className=' text-red-500'>SWIFTPOS</span>
                </h1>
                <p className="text-gray-500">Please enter your shop name to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 ">
                <div >
                  <label
                    htmlFor="shopName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Shop Name
                  </label>
                  <input
                    type="text"
                    id="shopName"
                    value={shopName}
                    onChange={handleChange}
                    placeholder="e.g., Corner Coffee Shop"
                    className="w-full px-4 py-3  rounded-4xl focus:ring-2 focus:ring-red-500/0 focus:border-indigo-500/0 outline-none transition-all duration-200 bg-gray-200"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full  bg-primary text-white font-semibold py-3 px-4 rounded-4xl  transform hover:scale-[1.02] transition-all duration-200 shadow-md"
                >
                  Create your shop
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-extrabold text-gray-800 mb-3">
                  Welcome to My System!
                </h2>
                <p className="text-xl text-gray-600">
                  Hello <span className="font-bold text-indigo-600">{shopName}'s owner</span>
                </p>
                <p className="text-gray-500 mt-2">
                  We're excited to have you onboard
                </p>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setShopName('');
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
              >
                ← Back to form
              </button>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ShopGreetingForm;