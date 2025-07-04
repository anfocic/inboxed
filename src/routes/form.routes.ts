import express from 'express';
import {handleSubmit} from "../controllers/formController";
import {upload} from "../middleware/multer";

const router = express.Router();

router.post('/submit', upload.array('attachments', 5), handleSubmit);

export default router;