import axios from "axios";
import { useEffect,useState } from "react";

const url = `http://localhost:5000/check-health`;

interface Health {
    message:string;
}
const TestServer = () => {
    
    const [res,setRes] = useState<Health | null> (null);
    const fetchHealt = async () => {
        try{
            const response = await axios.get(url);
            setRes(response.data);
        }
        catch{
            setRes({message:"failed"});
        }

    }

    useEffect(()=>{
        fetchHealt();
    },[])

    return (
        <>
        <h1>Message appear here</h1>
        <h2>{res?.message}</h2>
        </>
    )
}
export default TestServer;