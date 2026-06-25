

import {server} from "./server.js"

const app = server();
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`✅ Server is running on http://localhost:${PORT}`);
})
