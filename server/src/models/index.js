import sequelize from '../db/sequelize.js';
import defineEmployeeModel from './employee.model.js';
import definePermissionModel from './permission.model.js';
import defineTaskModel from './task.model.js'; 
import defineIncrementSchemeModel from './incrementScheme.model.js'; 
import defineLeaveTypeModel from './leave-type.model.js';
import defineLeaveRequestModel from './leave-request.model.js';
import defineCompanyRuleModel from './company-rules.model.js';
import defineAttendanceModel from './attendance.model.js';
import definePayrollReportModel from './payroll-report.model.js';
import defineSalarySlipModel from './salary-slip.model.js';
import defineSalaryComponentModel from './salary-component.model.js';
import defineEmployeeSalaryStructureModel from './employee-salary-structure.model.js';
import defineMessageModel from './message.model.js';
import defineEmployeePasswordModel from './EmployeePassword.js';

defineEmployeeModel(sequelize);
definePermissionModel(sequelize);
defineTaskModel(sequelize);
defineIncrementSchemeModel(sequelize);
defineLeaveTypeModel(sequelize);     
defineLeaveRequestModel(sequelize);  
defineCompanyRuleModel(sequelize); 
defineAttendanceModel(sequelize);
definePayrollReportModel(sequelize);
defineSalarySlipModel(sequelize);
defineSalaryComponentModel(sequelize);
defineEmployeeSalaryStructureModel(sequelize);
defineMessageModel(sequelize); 
defineEmployeePasswordModel(sequelize)

const { Employee, Permission, Task, LeaveType, LeaveRequest, Attendance, PayrollReport, SalarySlip, SalaryComponent, EmployeeSalaryStructure, Message,EmployeePassword  } = sequelize.models;

Employee.belongsToMany(Permission, { through: 'employee_permissions' });
Permission.belongsToMany(Employee, { through: 'employee_permissions' });

Employee.hasMany(Task);
Task.belongsTo(Employee);


Employee.hasMany(LeaveRequest, { foreignKey: 'employee_id' });
LeaveRequest.belongsTo(Employee, { foreignKey: 'employee_id' });


LeaveRequest.belongsTo(Employee, {
  as: 'CreatedByAdmin', 
  foreignKey: 'created_by_admin_id'
});

LeaveType.hasMany(LeaveRequest, { foreignKey: 'leave_type_id' });
LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leave_type_id' });


LeaveType.belongsTo(LeaveType, {
  as: 'FallbackType', 
  foreignKey: 'fallback_leave_type_id'
});

Employee.hasMany(Attendance, { foreignKey: 'employee_id' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id' });

PayrollReport.hasMany(SalarySlip, { foreignKey: 'report_id' });
SalarySlip.belongsTo(PayrollReport, { foreignKey: 'report_id' });

Employee.hasMany(PayrollReport, { foreignKey: 'generated_by_id' });
PayrollReport.belongsTo(Employee, { foreignKey: 'generated_by_id' });

Employee.hasMany(EmployeeSalaryStructure, { foreignKey: 'employee_id' });
EmployeeSalaryStructure.belongsTo(Employee, { foreignKey: 'employee_id' });

SalaryComponent.hasMany(EmployeeSalaryStructure, { foreignKey: 'component_id' });
EmployeeSalaryStructure.belongsTo(SalaryComponent, { as: 'component', foreignKey: 'component_id' });

Employee.hasMany(Message, { as: 'SentMessages', foreignKey: 'sender_id' });
Employee.hasMany(Message, { as: 'ReceivedMessages', foreignKey: 'receiver_id' });

Message.belongsTo(Employee, { as: 'Sender', foreignKey: 'sender_id' });
Message.belongsTo(Employee, { as: 'Receiver', foreignKey: 'receiver_id' });



//employees with password table
Employee.hasMany(EmployeePassword, {
  foreignKey: 'employee_id',
  as: 'passwords',
  onDelete: 'CASCADE'
});
EmployeePassword.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});








console.log('Models and Associations defined');

export { sequelize };
export const models = sequelize.models;