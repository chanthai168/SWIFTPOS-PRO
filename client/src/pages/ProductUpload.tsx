// src/App.tsx or your page component
import React from 'react';
import ProductUpload from '../components/productUpload/Index';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/Context';

const ProductUploadPage: React.FC = () => {
  const navigate = useNavigate();

  const {userInfo,shop} = useUser();

  console.log(userInfo);
  console.log(shop);

  if(!shop){
    //should redirect to shop creatation
    navigate('/');
    return null;
  }

  const handleSuccess = () => {
    
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <ProductUpload
      shopId={shop.id}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default ProductUploadPage;