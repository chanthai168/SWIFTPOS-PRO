
import ShopGreetingForm from "./ShopForm";
import heroImage from "../../assets/naruto.jpg";

function InitShop() {

  return (
      <div className="flex h-[100vh] overflow-hidden">
          <div >
            <img className="  w-[60vw]" src={heroImage}  alt="something" />
          </div>
          <div className=" w-[40vw]">
            <ShopGreetingForm/>
          </div>
      </div>
  )
}

export default InitShop;
