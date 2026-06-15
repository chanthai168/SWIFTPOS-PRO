
export class ResponseFormat {
    static update(data:any){
        const form = {
            success:true,
            data:data
        }
        return form;
    }
}