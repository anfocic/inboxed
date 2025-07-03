"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const formController_1 = require("../controllers/formController");
const router = express_1.default.Router();
router.post('/submit', formController_1.handleFormSubmission);
exports.default = router;
