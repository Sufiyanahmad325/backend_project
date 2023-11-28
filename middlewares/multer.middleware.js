import path from "path";

import multer from "multer"                      // multer =>   ye binary se image me convert krta hai

const upload = multer({
    dest: "uploads/",                             //dest => ye distination hai ki path pe  kha uplode hogi
    limits: { fileSize: 50 * 1024 * 1024 },      //50 mb in size limit
    storage: multer.diskStorage({              //diskstorage hai wo local system me file ko uplode krta hai
        destination: "uploads/",                 // local storege me kha pe file uploade hogi    
        filename: (_req, file, cb) => { 
            cb(null, file.originalname);          // yaha pe jo file ka original name hai us name se file uploade hogi 
        }, 
    }),

    fileFilter: (_req, file, cb) => {           
        let ext = path.extname(file.originalname);
        if (
            ext !== ".jpg" &&
            ext !== ".jpeg" &&
            ext !== ".webp" &&
            ext !== ".png" &&
            ext !== ".mp4"

        ){
            cb(new Error (`unsupported file type! ${ext}`) , false);
            return;
        }
        cb(null , true);
    }
})


export default upload;