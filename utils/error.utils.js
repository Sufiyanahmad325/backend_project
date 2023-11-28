class AppError extends Error{
    constructor(messange , statusCode){
        super(messange);                      //yaha pe error class me jo message aayega wo yaha aajayega 

        this.statusCode=statusCode;           
        Error.captureStackTrace(this , this.consturctor) //
    }
}


export default AppError;