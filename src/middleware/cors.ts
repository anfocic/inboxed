import cors from 'cors';

export default cors({
    origin: "*",
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
});