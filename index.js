import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import getConfigs from './config/config.js';
// import all_hoto_routes from './routes/hoto_to_assets/all.hoto_to_assets.routes.js';
// import maintenance_router from './routes/maintenance/gp/index.js';
import all_master_router from './routes/masters/all_masters.routes.js';
// import all_o_and_m_routes from './routes/o&m/all_o&m.routes.js';
import survey_router from './routes/survey/survey.routes.js';
import authRouter from './routes/users/auth.routes.js';
import userRouter from './routes/users/users.routes.js';
import { globalErrorHandler } from './utils/errors/GlobalErrorHandler.js';
import connect from './database/connect_db.service.js';
import maintenance_router from './routes/maintenance/gp/index.js';


const Configs = getConfigs();
await connect()
const app = express();


const PORT = Configs.server.port;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json({ limit: 'Infinity' }));
app.use(express.urlencoded({ limit: 'Infinity', extended: true }));

global.config = {
  dirname: __dirname,
  filename: __filename,
};

var corsOptions = {
  origin: Configs.cors.origin,
  optionsSuccessStatus: 200,
  credentials: Configs.cors.credentials,
};
app.use(cors(corsOptions));
app.use('/upload', express.static('./upload'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
app.use(cookieParser());

const base_url = `/api/${Configs?.server?.version}`;

app.use(`${base_url}/survey`, survey_router)
app.use(`${base_url}/master`, all_master_router)
app.use(`${base_url}/users`, userRouter)
app.use(`${base_url}/auth`, authRouter)
// app.use(`${base_url}/hoto-to-assets`, all_hoto_routes)
// app.use(`${base_url}/o&m`, all_o_and_m_routes)
app.use(`${base_url}`, maintenance_router)

app.use(globalErrorHandler);


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
// Error handling for the server
app.on('error', (error) => {
  console.error(`Server error: ${error.message}`);
});
