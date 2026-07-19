
import ShopGreetingForm from "./ShopForm";
import heroImage from "../../assets/narutov2.jpg";
import logo from '../../assets/logo.png';

function InitShop() {

  return (
      <div className="flex h-[100vh] relative overflow-hidden">
          <div >
            <img className="  w-[60vw]" src={heroImage}  alt="something" />
          </div>
          <div className=" absolute -top-8 right-20">
            <img src={logo} alt="" />
          </div>
          <div className=" w-[40vw]">
            <ShopGreetingForm/>
          </div>
      </div>
  )
}

export default InitShop;
