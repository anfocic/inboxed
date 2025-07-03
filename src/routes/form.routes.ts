import express from 'express';
import {handleFormSubmission} from "../controllers/formController";

const router = express.Router();

// @ts-ignore
router.post('/submit', handleFormSubmission);

export default router;