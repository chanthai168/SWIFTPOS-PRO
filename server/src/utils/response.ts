
export class ResponseFormat {
    static update(data:any){
        const form = {
            success:true,
            data:data
        }
        return form;
    }
    static get(data:any,rows:number){
        const form = {
            success:true,
            rows:rows,
            data:data
        }
        return form;
    }
}