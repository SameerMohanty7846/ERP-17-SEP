// import express from 'express';
// import { protect, hasPermission } from '../middleware/AuthMiddleware.js';
// import { PERMISSIONS } from '../../config/permissions.js';

// const router = express.Router();
// router.use(protect); 
// router.use(hasPermission(PERMISSIONS.PAGES.SALARY_MANAGEMENT)); 

// import {
//     getSalaryComponents, createSalaryComponent, updateSalaryComponent, deleteSalaryComponent, getEmployeeSalaryStructure, updateEmployeeSalaryStructure
// } from '../controllers/SalaryController.js';

// router.route('/components')
//     .get(getSalaryComponents)
//     .post(createSalaryComponent);

// router.route('/components/:id')
//     .put(updateSalaryComponent)
//     .delete(deleteSalaryComponent);

//     router.route('/structure/:employeeId')
//     .get(getEmployeeSalaryStructure)
//     .post(updateEmployeeSalaryStructure);

// export default router;

import express from 'express';
import { protect, hasPermission } from '../middleware/AuthMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';
import {
  getEmployeeList,
  getSalaryComponents,
  createSalaryComponent,
  updateSalaryComponent,
  deleteSalaryComponent,
  getEmployeeSalaryStructure,
  updateEmployeeSalaryStructure
} from '../controllers/SalaryController.js';

const router = express.Router();

router.use(protect);

router.use(hasPermission(PERMISSIONS.PAGES.SALARY_MANAGEMENT));


router.get('/list-employees', 
 hasPermission(PERMISSIONS.PAYROLL.SALARY_STRUCTURE.UPDATE), 
   getEmployeeList)

router.route('/components')
  .get(
    hasPermission(PERMISSIONS.PAYROLL.SALARY_COMPONENT.READ), 
    getSalaryComponents
  )
  .post(
    hasPermission(PERMISSIONS.PAYROLL.SALARY_COMPONENT.CREATE), 
    createSalaryComponent
  );

router.route('/components/:id')
  .put(
    hasPermission(PERMISSIONS.PAYROLL.SALARY_COMPONENT.UPDATE), 
    updateSalaryComponent
  )
  .delete(
    hasPermission(PERMISSIONS.PAYROLL.SALARY_COMPONENT.DELETE), 
    deleteSalaryComponent
  );

router.route('/structure/:employeeId')
  .get(
    hasPermission(PERMISSIONS.PAYROLL.SALARY_COMPONENT.READ), 
    getEmployeeSalaryStructure
  )
  .post(
    hasPermission(PERMISSIONS.PAYROLL.SALARY_STRUCTURE.UPDATE), 
    updateEmployeeSalaryStructure
  );

export default router;
