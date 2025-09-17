import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize } from './models/index.js'; 
import { fileURLToPath } from 'url';
import path from 'path';
import cookieParser from 'cookie-parser';



import authRoutes from './routes/AuthRoutes.js';
import employeeRoutes from './routes/EmployeeRoutes.js';
import taskRoutes from './routes/TaskRoutes.js';
import incrementRoutes from './routes/IncrementRoutes.js';
import permissionRoutes from './routes/PermissionRoutes.js';
import accountRoutes from './routes/AccountRoutes.js'
import dashboardRoutes from './routes/DashboardRoutes.js';
import policyRoutes from './routes/PolicyRoutes.js';
import leaveRoutes from './routes/LeaveRoutes.js';
import rulesRoutes from './routes/RulesRoutes.js'; 
import attendanceRoutes from './routes/AttendanceRoutes.js';
import payrollRoutes from './routes/PayrollRoutes.js';
import salaryRoutes from './routes/SalaryRoutes.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
        origin: process.env.CORS_ORIGIN, 

    credentials: true   
}));
app.use(cookieParser());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));	

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/increment-report', incrementRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/salary', salaryRoutes);


app.get('/', (req, res) => {
  res.send('Running...');
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('db success');
    

      // await sequelize.sync({ alter: true });
      // console.log('sync success');

    app.listen(PORT, () => {
      console.log(`bluetooth connected on ${PORT}`);
    });
  } catch (error) {
    console.error( error);
  }
};

startServer();